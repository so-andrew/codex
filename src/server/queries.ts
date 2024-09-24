import { db } from '@/server/db'
import { type CategoryTableRow, type ProductTableRow } from '@/types'
import { auth } from '@clerk/nextjs/server'
import { and, asc, count, eq, sql } from 'drizzle-orm'
import 'server-only'
import {
    type Category,
    conventionProductReports,
    conventions,
    type Product,
    productCategories,
    products,
    type ProductVariation,
    productVariations,
} from './db/schema'

const getSingleProduct = db
    .select()
    .from(products)
    .where(
        and(
            eq(products.id, sql.placeholder('productId')),
            eq(products.creatorId, sql.placeholder('userId')),
        ),
    )
    .prepare('get-single-product')

const getProducts = db
    .select()
    .from(products)
    .where(eq(products.creatorId, sql.placeholder('userId')))
    .orderBy(productCategories.name)
    .prepare('get-products')

const getCategories = db
    .select({
        id: productCategories.id,
        name: productCategories.name,
        creatorId: productCategories.creatorId,
        parentId: productCategories.parentId,
        productCount: count(products.id),
    })
    .from(productCategories)
    .where(eq(productCategories.creatorId, sql.placeholder('userId')))
    .leftJoin(products, eq(productCategories.id, products.category))
    .groupBy(productCategories.id)
    .orderBy(productCategories.id)
    .prepare('get-categories')

const getConventions = db
    .select()
    .from(conventions)
    .where(eq(conventions.creatorId, sql.placeholder('userId')))
    .prepare('get-conventions')

const getSingleConvention = db
    .select()
    .from(conventions)
    .where(eq(conventions.id, sql.placeholder('conventionId')))
    .prepare('get-single-convention')

const getProductVariations = db
    .select()
    .from(productVariations)
    .where(
        and(
            eq(productVariations.productId, sql.placeholder('productId')),
            eq(productVariations.creatorId, sql.placeholder('userId')),
        ),
    )
    .orderBy(asc(productVariations.name))
    .prepare('get-variations')

export async function getProductById(productId: number) {
    const user = auth()
    if (!user.userId) throw new Error('Unauthorized')
    const products = await getSingleProduct.execute({
        productId: productId,
        userId: user.userId,
    })
    return products[0]
}

export async function getUserProducts() {
    const user = auth()
    if (!user.userId) throw new Error('Unauthorized')
    return await getProducts.execute({ userId: user.userId })
}

export async function getProductHierarchy() {
    const user = auth()
    if (!user.userId) throw new Error('Unauthorized')
    const productsWithVariations = await db
        .select()
        .from(products)
        .leftJoin(
            productVariations,
            eq(products.id, productVariations.productId),
        )

    const categories = await getCategories.execute({ userId: user.userId })

    return constructProductHierarchy({ productsWithVariations, categories })
}

function constructProductHierarchy({
    productsWithVariations,
    categories,
}: {
    productsWithVariations: Array<{
        product: Product
        productVariations: ProductVariation | null
    }>
    categories: Category[]
}) {
    const categoryMap = new Map<number, string>()
    for (const category of categories) {
        categoryMap.set(category.id, category.name)
    }

    const productMap = new Map<number, ProductTableRow>()

    productsWithVariations.forEach((row) => {
        const product = row.product
        const variation = row.productVariations
        if (!productMap.has(product.id)) {
            productMap.set(product.id, {
                product: product,
                variations: [],
                categoryName:
                    product.category && categoryMap.has(product.category)
                        ? categoryMap.get(product.category)!
                        : 'Uncategorized',
            })
        }
        if (variation) {
            productMap.get(product.id)!.variations.push({
                product: variation,
                variations: [],
                categoryName: null,
            })
        }
    })

    return Array.from(productMap.values())
}

export async function getUserConventions() {
    const user = auth()
    if (!user.userId) throw new Error('Unauthorized')
    return await getConventions.execute({ userId: user.userId })
}

export async function getConventionById(conventionId: number) {
    const user = auth()
    if (!user.userId) throw new Error('Unauthorized')
    const conventions = await getSingleConvention.execute({
        conventionId: conventionId,
        userId: user.userId,
    })
    return conventions[0]
}

export async function getUserProductVariations(productId: number) {
    const user = auth()
    if (!user.userId) throw new Error('Unauthorized')
    return await getProductVariations.execute({
        productId: productId,
        userId: user.userId,
    })
}

export async function getUserCategories() {
    const user = auth()
    if (!user.userId) throw new Error('Unauthorized')
    const categories = await getCategories.execute({ userId: user.userId })
    //console.log(categories)
    const categoryMap = new Map<number, string>()
    for (const category of categories) {
        categoryMap.set(category.id, category.name)
    }
    return {
        categories: categories,
        categoryMap: categoryMap,
    }
}

export async function getCategoryHierarchy() {
    const user = auth()
    if (!user.userId) throw new Error('Unauthorized')
    const categories = (
        await getCategories.execute({ userId: user.userId })
    ).map((category) => {
        return {
            category: category,
            subcategories: [],
        }
    })
    //console.log(categories)
    return constructCategoryHierarchy(categories)
}

function constructCategoryHierarchy(categories: Array<CategoryTableRow>) {
    const categoryMap = new Map<number, CategoryTableRow>()

    categories.forEach((row) => {
        const category = row.category
        categoryMap.set(category.id, { category, subcategories: [] })
    })

    const rootCategories: CategoryTableRow[] = []

    categories.forEach((row) => {
        const category = row.category
        if (category.parentId === null) {
            rootCategories.push(categoryMap.get(category.id)!)
        } else {
            const parentCategory = categoryMap.get(category.parentId)
            if (parentCategory) {
                parentCategory.subcategories.push(categoryMap.get(category.id)!)
            }
        }
    })

    return rootCategories
}

export async function getConventionReportsOld(conventionId: number) {
    const user = auth()
    if (!user.userId) throw new Error('Unauthorized')
    return await db
        .select()
        .from(conventionProductReports)
        .where(eq(conventionProductReports.conventionId, conventionId))
}

// export async function getConventionReports(conventionId: number) {
//     const user = auth()
//     if (!user.userId) throw new Error('Unauthorized')
//     return (await db
//         .select({
//             reportId: conventionProductReports.id,
//             reportName: conventionProductReports.name,
//             reportPrice: conventionProductReports.price,
//             reportSalesFigures: conventionProductReports.salesFigures,
//             productId: conventionProductReports.productId,
//             productName: conventionProductReports.productName,
//             categoryId: productCategories.id,
//             categoryName: productCategories.name,
//         })
//         .from(conventionProductReports)
//         .where(eq(conventionProductReports.conventionId, conventionId))
//         .leftJoin(products, eq(conventionProductReports.productId, products.id))
//         .leftJoin(
//             productCategories,
//             eq(products.category, productCategories.id),
//         )) as ReportType[]
// }

export async function getConventionReportsNew(conventionId: number) {
    const user = auth()
    if (!user.userId) throw new Error('Unauthorized')
    const reportsWithRevenue = await db.query.conventionProductReports.findMany(
        {
            where: eq(conventionProductReports.conventionId, conventionId),
            columns: {
                id: true,
                name: true,
                productId: true,
                productName: true,
                categoryId: true,
                categoryName: true,
                conventionId: true,
                price: true,
            },
            with: {
                revenues: true,
            },
        },
    )
    return reportsWithRevenue
}

export async function getConventionCategories(conventionId: number) {
    const user = auth()
    if (!user.userId) throw new Error('Unauthorized')
    return await db
        .selectDistinct({
            id: productCategories.id,
            name: productCategories.name,
        })
        .from(conventionProductReports)
        .where(eq(conventionProductReports.conventionId, conventionId))
        .leftJoin(products, eq(conventionProductReports.productId, products.id))
        .leftJoin(
            productCategories,
            eq(products.category, productCategories.id),
        )
}
