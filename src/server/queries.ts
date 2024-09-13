import { auth } from '@clerk/nextjs/server'
import { and, asc, eq, sql } from 'drizzle-orm'
import 'server-only'
import { db } from './db'
import { conventions, products, productVariations } from './db/schema'

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
    .prepare('get-products')

const getConventions = db
    .select()
    .from(conventions)
    .where(eq(conventions.creatorId, sql.placeholder('userId')))
    .prepare('get-conventions')

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

export async function getUserConventions() {
    const user = auth()
    if (!user.userId) throw new Error('Unauthorized')
    return await getConventions.execute({ userId: user.userId })
}

export async function getUserProductVariations(productId: number) {
    const user = auth()
    if (!user.userId) throw new Error('Unauthorized')
    return await getProductVariations.execute({
        productId: productId,
        userId: user.userId,
    })
}
