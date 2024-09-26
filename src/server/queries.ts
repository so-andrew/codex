import { db } from '@/server/db'
import {
    type CategoryTableRow,
    type ProductTableRow,
    TopSellingVariations,
} from '@/types'
import { auth } from '@clerk/nextjs/server'
import { eachDayOfInterval } from 'date-fns'
import { and, asc, count, desc, eq, sql } from 'drizzle-orm'
import 'server-only'
import {
    type Category,
    conventionProductReports,
    conventions,
    discounts,
    type Product,
    productCategories,
    productDailyRevenue,
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

const getDiscounts = db
    .select()
    .from(discounts)
    .where(eq(discounts.creatorId, sql.placeholder('userId')))
    .orderBy(discounts.name)
    .prepare('get-discounts')

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

export async function getUserDiscounts() {
    const user = auth()
    if (!user.userId) throw new Error('Unauthorized')
    return await getDiscounts.execute({ userId: user.userId })
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

export async function getConventionReports(conventionId: number) {
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

export async function getConventionRevenue(conventionId: number) {
    const user = auth()
    if (!user.userId) throw new Error('Unauthorized')

    const itemized = await db
        .select({
            date: productDailyRevenue.date,
            reportId: productDailyRevenue.reportId,
            categoryId: productDailyRevenue.categoryId,
            cashSales: productDailyRevenue.cashSales,
            cardSales: productDailyRevenue.cardSales,
            price: sql<number>`cast(${conventionProductReports.price} as float)`,
            totalSales: sql<number>`cast(sum(${productDailyRevenue.cardSales})+sum(${productDailyRevenue.cashSales}) as int)`,
            totalRevenue: sql<number>`cast(${conventionProductReports.price}*(sum(${productDailyRevenue.cardSales})+sum(${productDailyRevenue.cashSales})) as float)`,
        })
        .from(productDailyRevenue)
        .leftJoin(
            conventionProductReports,
            eq(productDailyRevenue.reportId, conventionProductReports.id),
        )
        .groupBy(
            productDailyRevenue.date,
            productDailyRevenue.reportId,
            productDailyRevenue.categoryId,
            conventionProductReports.price,
            productDailyRevenue.cashSales,
            productDailyRevenue.cardSales,
        )
        .where(eq(productDailyRevenue.conventionId, conventionId))

    const conventionTotalRevenue = itemized.reduce((acc, element) => {
        return +acc + +element.totalRevenue
    }, 0)

    const datesInRange = await getConventionDateRange(conventionId)
    if (!datesInRange) throw new Error('Invalid dates')
    const revenueDateMap = new Map<string, Record<number, number>>(
        datesInRange.map((date) => {
            return [date.toISOString(), {} as Record<number, number>]
        }),
    )
    for (const revenue of itemized) {
        if (!revenueDateMap.has(revenue.date.toISOString())) {
            revenueDateMap.set(
                revenue.date.toISOString(),
                {} as Record<number, number>,
            )
        }
        const dailyRecord = revenueDateMap.get(revenue.date.toISOString())
        if (!dailyRecord![revenue.categoryId]) {
            dailyRecord![revenue.categoryId] = 0
        }
        dailyRecord![revenue.categoryId]! +=
            revenue.price * (revenue.cardSales + revenue.cashSales)
        revenueDateMap.set(revenue.date.toISOString(), dailyRecord!)
    }

    return {
        itemizedRevenue: itemized,
        totalRevenue: conventionTotalRevenue,
        revenueByCategory: revenueDateMap,
    }
}

async function getConventionDateRange(conventionId: number) {
    const user = auth()
    if (!user.userId) throw new Error('Unauthorized')

    const query = await db
        .select({
            startDate: conventions.startDate,
            endDate: conventions.endDate,
        })
        .from(conventions)
        .where(eq(conventions.id, conventionId))

    return query[0]
        ? eachDayOfInterval({
              start: query[0].startDate,
              end: query[0].endDate,
          })
        : undefined
}

export async function getTopSellingVariations(conventionId: number) {
    const user = auth()
    if (!user.userId) throw new Error('Unauthorized')

    const revenueQuery = db
        .select({
            reportId: productDailyRevenue.reportId,
            totalSales:
                sql<number>`cast(sum(${productDailyRevenue.cardSales})+sum(${productDailyRevenue.cashSales}) as int)`.as(
                    'totalSales',
                ),
            totalRevenue:
                sql<number>`cast(${conventionProductReports.price}*(sum(${productDailyRevenue.cardSales})+sum(${productDailyRevenue.cashSales})) as float)`.as(
                    'totalRevenue',
                ),
        })
        .from(productDailyRevenue)
        .where(eq(productDailyRevenue.conventionId, conventionId))
        .leftJoin(
            conventionProductReports,
            eq(conventionProductReports.id, productDailyRevenue.reportId),
        )
        .groupBy(productDailyRevenue.reportId, conventionProductReports.price)
        .as('rq')

    const query = (await db
        .select({
            reportId: revenueQuery.reportId,
            variationName: productVariations.name,
            productName: conventionProductReports.productName,
            totalSales: revenueQuery.totalSales,
            totalRevenue: revenueQuery.totalRevenue,
        })
        .from(revenueQuery)
        .leftJoin(
            conventionProductReports,
            eq(conventionProductReports.id, revenueQuery.reportId),
        )
        .leftJoin(
            productVariations,
            eq(
                productVariations.id,
                conventionProductReports.productVariationId,
            ),
        )
        .orderBy(desc(revenueQuery.totalRevenue))) as TopSellingVariations[]
    return query
}
