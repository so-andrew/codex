'use server'
import { currentUser } from '@clerk/nextjs/server'
import { randomBytes } from 'crypto'
import { and, eq, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { db } from '~/server/db'
import {
    type Convention,
    type conventionProductVariationReports,
    conventions,
    type Product,
    products,
    type ProductVariation,
    productVariations,
} from '~/server/db/schema'

export async function test() {
    'use server'
    let basePath: string
    if (process.env.SQ_ENVIRONMENT!.toLowerCase() === 'production') {
        basePath = `https://connect.squareup.com`
    } else if (process.env.SQ_ENVIRONMENT!.toLowerCase() === 'sandbox') {
        basePath = `https://connect.squareupsandbox.com`
    } else {
        console.warn('Unsupported value for SQ_ENVIRONMENT in .env file.')
        process.exit(1)
    }

    const scopes = ['ITEMS_READ', 'ITEMS_WRITE']

    const state = randomBytes(32).toString('hex')
    const url =
        basePath +
        `/oauth2/authorize?client_id=${process.env.SQ_APPLICATION_ID}&` +
        `response_type=code&` +
        `scope=${scopes.join('+')}` +
        `&state=` +
        state
    cookies().set('Auth_State', state, { expires: Date.now() + 300000 })
    return url
}

const productScheme = z.object({
    name: z.string().min(2).max(100),
    category: z.string().optional(),
    price: z.number(),
    variations: z.array(
        z.object({
            name: z.string().min(2).max(100),
            price: z.number(),
        }),
    ),
})

const productEditScheme = z.object({
    id: z.number(),
    name: z.string().min(2).max(100).optional(),
    category: z.string().optional(),
    price: z.number().optional(),
})

export async function createProduct(data: z.infer<typeof productScheme>) {
    const user = await currentUser()
    //console.log(data)

    if (user) {
        try {
            const parse = productScheme.parse({
                name: data.name,
                category: data.category,
                price: data.price,
                variations: data.variations,
            })

            console.log(parse)
            console.log(parse.variations && parse.variations.length > 0)

            // If the user specified variations to be created
            if (parse.variations && parse.variations.length > 0) {
                // Create base product
                const baseProduct = await db
                    .insert(products)
                    .values({
                        name: parse.name,
                        category: parse.category,
                        creatorId: user.id,
                    })
                    .returning()

                type NewVariation = typeof productVariations.$inferInsert

                // Create variations
                const map = parse.variations.map((variation) => {
                    const newVariation: NewVariation = {
                        name: variation.name,
                        baseProductName: baseProduct[0]!.name,
                        price: variation.price.toString(),
                        productId: baseProduct[0]!.id,
                        creatorId: user.id,
                    }
                    return newVariation
                })
                await db.insert(productVariations).values(map)
            } else {
                // Create base product and default variation
                const newProduct = await db
                    .insert(products)
                    .values({
                        name: parse.name,
                        category: parse.category,
                        price: parse.price.toString(), // TODO: Rework how price is stored/displayed in UI
                        creatorId: user.id,
                    })
                    .returning()

                await db.insert(productVariations).values({
                    name: 'Default',
                    price: parse.price.toString(),
                    baseProductName: newProduct[0]!.name,
                    productId: newProduct[0]!.id,
                    creatorId: user.id,
                })
            }
        } catch (e) {
            const error = e as Error
            console.error(error)
            throw error
        }
        return revalidatePath('/dashboard/products')
    }
}

export async function deleteProductOld(product: Product) {
    const user = await currentUser()
    if (user && user.id === product.creatorId) {
        await db.delete(products).where(eq(products.id, product.id))
    }
    revalidatePath('/dashboard/products')
}

export async function deleteProduct({
    id,
    creatorId,
}: {
    id: number
    creatorId: string
}) {
    const user = await currentUser()
    if (user && user.id === creatorId) {
        await db.delete(products).where(eq(products.id, id))
    }
    revalidatePath('/dashboard/products')
}

export async function editProduct(data: z.infer<typeof productEditScheme>) {
    const user = await currentUser()

    if (!user) {
        const error = new Error('Invalid user.')
        throw error
    }
    try {
        const parse = productEditScheme.parse({
            id: data.id,
            name: data.name,
            category: data.category,
            price: data.price,
        })

        const foundProduct = await db.query.products.findFirst({
            where: and(
                eq(products.id, parse.id),
                eq(products.creatorId, user.id),
            ),
        })
        await db
            .update(products)
            .set({
                name: parse.name ?? foundProduct?.name,
                category: parse.category ?? foundProduct?.category,
                price: parse.price?.toString() ?? foundProduct?.price,
            })
            .where(
                and(eq(products.id, data.id), eq(products.creatorId, user.id)),
            )
        return revalidatePath('/dashboard/products')
    } catch (e) {
        const error = e as Error
        console.error(error)
        throw error
    }
}

const variationScheme = z.object({
    name: z.string().min(2).max(100),
    price: z.number(),
    productId: z.number(),
    baseProductName: z.string(),
})

export async function createVariation(data: z.infer<typeof variationScheme>) {
    const user = await currentUser()

    if (!user) {
        const error = new Error('Invalid user.')
        throw error
    }
    try {
        const parse = variationScheme.parse({
            name: data.name,
            price: data.price,
            productId: data.productId,
            baseProductName: data.baseProductName,
        })

        await db.insert(productVariations).values({
            name: parse.name,
            price: parse.price.toString(),
            productId: parse.productId,
            baseProductName: parse.baseProductName,
            creatorId: user.id,
        })
    } catch (error) {
        console.error(error)
    }
    revalidatePath('/dashboard/products')
}

const variationEditScheme = z.object({
    name: z.string().min(2).max(100),
    id: z.number(),
    productId: z.number(),
    creatorId: z.string(),
    price: z.number().nonnegative(),
})

export async function editVariation(data: z.infer<typeof variationEditScheme>) {
    const user = await currentUser()
    if (!user) {
        const error = new Error('Invalid user.')
        throw error
    }

    try {
        const parse = variationEditScheme.parse({
            name: data.name,
            id: data.id,
            productId: data.productId,
            creatorId: data.creatorId,
            price: data.price,
        })

        await db
            .update(productVariations)
            .set({
                name: parse.name,
                price: parse.price.toString(),
            })
            .where(
                and(
                    eq(productVariations.id, parse.id),
                    eq(productVariations.creatorId, user.id),
                ),
            )
    } catch (e) {
        const error = e as Error
        console.error(error)
        throw error
    }
    revalidatePath('/dashboard/products')
}

const bulkVariationEditScheme = z.object({
    data: z.array(
        z.object({
            id: z.number(),
            productId: z.number(),
            creatorId: z.string(),
        }),
    ),
    price: z.coerce
        .number({
            required_error: 'Price is required',
            invalid_type_error: 'Price must be a number',
        })
        .nonnegative(),
})

export async function bulkEditVariation(
    data: z.infer<typeof bulkVariationEditScheme>,
) {
    const user = await currentUser()
    if (!user) {
        const error = new Error('Invalid user.')
        throw error
    }

    try {
        const parse = bulkVariationEditScheme.parse({
            data: data.data,
            price: data.price,
        })

        const variationIds = parse.data.map((variation) => variation.id)

        await db
            .update(productVariations)
            .set({
                price: parse.price.toString(),
            })
            .where(
                and(
                    inArray(productVariations.id, variationIds),
                    eq(productVariations.creatorId, user.id),
                ),
            )
    } catch (e) {
        const error = e as Error
        console.error(error)
        throw error
    }
    revalidatePath('/dashboard/products')
}

export async function deleteVariationOld(variation: ProductVariation) {
    const user = await currentUser()

    if (!user) {
        const error = new Error('Invalid user.')
        throw error
    }

    if (user.id !== variation.creatorId) {
        const error = new Error('User does not have permission to delete.')
        throw error
    }

    const getAllVariations = await db
        .select()
        .from(productVariations)
        .where(eq(productVariations.productId, variation.productId))

    if (getAllVariations.length <= 1) {
        const error = new Error('Cannot delete default variation.')
        throw error
    }

    await db
        .delete(productVariations)
        .where(eq(productVariations.id, variation.id))

    revalidatePath('/dashboard/products')
}

export async function deleteVariation({
    id,
    productId,
    creatorId,
}: {
    id: number
    productId: number
    creatorId: string
}) {
    const user = await currentUser()

    if (!user) {
        const error = new Error('Invalid user.')
        throw error
    }

    if (user.id !== creatorId) {
        const error = new Error('User does not have permission to delete.')
        throw error
    }

    const getAllVariations = await db
        .select()
        .from(productVariations)
        .where(eq(productVariations.productId, productId))

    if (getAllVariations.length <= 1) {
        const error = new Error('Cannot delete default variation.')
        throw error
    }

    await db.delete(productVariations).where(eq(productVariations.id, id))

    revalidatePath('/dashboard/products')
}

const conventionScheme = z.object({
    name: z.string().min(2).max(100),
    location: z.string().min(2).max(100),
    dateRange: z.object({
        from: z.date(),
        to: z.date(),
    }),
})

export async function createConvention(data: z.infer<typeof conventionScheme>) {
    const user = await currentUser()

    if (user) {
        try {
            const parse = conventionScheme.parse({
                name: data.name,
                location: data.location,
                dateRange: data.dateRange,
            })

            const newConvention = await db
                .insert(conventions)
                .values({
                    name: parse.name,
                    location: parse.location,
                    startDate: parse.dateRange.from.toISOString(),
                    endDate: parse.dateRange.to.toISOString(),
                    creatorId: user.id,
                })
                .returning()

            console.log(newConvention)

            const currentProducts = await db.query.products.findMany({
                where: eq(products.creatorId, user.id),
            })

            const length = await getConventionLength(
                newConvention[0]!.startDate,
                newConvention[0]!.endDate,
            )
            console.log(length)

            type NewListing =
                typeof conventionProductVariationReports.$inferInsert

            // const map1 = currentProducts.map((product) => {
            //     const newListing: NewListing = {
            //         name: product.name,
            //         category: product.category,
            //         price: product.price!,
            //         length: length,
            //         creatorId: product.creatorId,
            //         productId: product.id,
            //         conventionId: newConvention[0]!.id,
            //     }
            //     return newListing
            // })

            // console.log(map1)
            // await db.insert(conventionProductVariationReports).values(map1)
        } catch (e) {
            const error = e as Error
            console.error(error)
            throw error
        }
        return revalidatePath('/dashboard/conventions')
    }
}

export async function getConventionLength(
    startDateString: string,
    endDateString: string,
) {
    const startDate = new Date(Date.parse(startDateString))
    const endDate = new Date(Date.parse(endDateString))

    const utcStart = Date.UTC(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
    )
    const utcEnd = Date.UTC(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
    )

    const timeDiff = Math.abs(utcStart - utcEnd)
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

    switch (daysDiff) {
        case 0:
            return '1day'
        case 1:
            return '2day'
        case 2:
            return '3day'
        case 3:
            return '4day'
        default:
            return 'other'
    }
}

export async function deleteConvention(convention: Convention) {
    const user = await currentUser()
    if (user && user.id === convention.creatorId) {
        await db.delete(conventions).where(eq(conventions.id, convention.id))
    }
    revalidatePath('/dashboard/conventions')
    redirect('/dashboard/conventions')
}
