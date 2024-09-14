'use server'
import { auth } from '@clerk/nextjs/server'
import { randomBytes } from 'crypto'
import { differenceInCalendarDays, eachDayOfInterval } from 'date-fns'
import { and, eq, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
//import { cookies } from 'next/headers'
import { z } from 'zod'
import { db } from '~/server/db'
import {
    conventionProductVariationReports,
    conventions,
    productCategories,
    products,
    productVariations,
    type salesFigureDaily,
    type salesFigures,
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
    //cookies().set('Auth_State', state, { expires: Date.now() + 300000 })
    return url
}

// General database item schemas
const generalItemSchema = z.object({
    id: z.number(),
    creatorId: z.string(),
})

const variationSimpleSchema = z.object({
    id: z.number(),
    productId: z.number(),
    creatorId: z.string(),
})

// Product schemas
const productCreateScheme = z.object({
    name: z.string().min(2).max(100),
    category: z.number().optional(),
    price: z.coerce.number(),
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
    category: z.number().optional(),
    price: z.coerce.number().optional(),
})

const bulkProductDeleteScheme = z.object({
    data: z.array(generalItemSchema),
})

// Category schemas
const categoryCreateScheme = z.object({
    name: z.string().min(2).max(100),
    parentId: z.number().optional(),
})

// Variation schemas
const variationCreateScheme = z.object({
    name: z.string().min(2).max(100),
    price: z.coerce.number().nonnegative(),
    productId: z.number(),
    baseProductName: z.string(),
    sku: z.string().min(4).max(25).optional(),
})

const variationEditScheme = z.object({
    name: z.string().min(2).max(100),
    id: z.number(),
    productId: z.number(),
    creatorId: z.string(),
    price: z.coerce.number().nonnegative(),
    sku: z.string().min(4).max(25).optional(),
})

const bulkVariationEditScheme = z.object({
    data: z.array(variationSimpleSchema),
    price: z.coerce.number().nonnegative(),
})

const bulkVariationDeleteScheme = z.object({
    data: z.array(variationSimpleSchema),
})

// Convention schemas
const conventionScheme = z.object({
    name: z.string().min(2).max(100),
    location: z.string().min(2).max(100),
    dateRange: z.object({
        from: z.date(),
        to: z.date(),
    }),
})

const bulkConventionDeleteScheme = z.object({
    data: z.array(generalItemSchema),
})

export async function createProduct(data: z.infer<typeof productCreateScheme>) {
    const user = auth()
    if (user && user.userId) {
        try {
            // If we have never created a category before, create a default
            const categories = await db.select().from(productCategories)
            if (!categories || categories.length === 0) {
                await db.insert(productCategories).values({
                    id: -1,
                    name: 'Uncategorized',
                    parentId: null,
                    creatorId: user.userId,
                })
            }

            const parse = productCreateScheme.parse({
                name: data.name,
                category: data.category,
                price: data.price,
                variations: data.variations,
            })

            // If the user specified variations to be created
            if (parse.variations && parse.variations.length > 0) {
                // Create base product
                const baseProduct = await db
                    .insert(products)
                    .values({
                        name: parse.name,
                        category: parse.category,
                        creatorId: user.userId,
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
                        creatorId: user.userId,
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
                        creatorId: user.userId,
                    })
                    .returning()

                await db.insert(productVariations).values({
                    name: 'Default',
                    price: parse.price.toString(),
                    baseProductName: newProduct[0]!.name,
                    productId: newProduct[0]!.id,
                    creatorId: user.userId,
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

export async function editProduct(data: z.infer<typeof productEditScheme>) {
    const user = auth()

    if (!user || !user.userId) {
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
                eq(products.creatorId, user.userId),
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
                and(
                    eq(products.id, data.id),
                    eq(products.creatorId, user.userId),
                ),
            )
        return revalidatePath('/dashboard/products')
    } catch (e) {
        const error = e as Error
        console.error(error)
        throw error
    }
}

export async function deleteProduct({
    id,
    creatorId,
}: {
    id: number
    creatorId: string
}) {
    const user = auth()
    if (!user || !user.userId) {
        const error = new Error('Invalid user.')
        throw error
    }

    if (user.userId !== creatorId) {
        const error = new Error('User does not have permission to delete.')
        throw error
    }
    await db.delete(products).where(eq(products.id, id))
    revalidatePath('/dashboard/products')
}

export async function bulkDeleteProduct(
    data: z.infer<typeof bulkProductDeleteScheme>,
) {
    const user = auth()

    if (!user || !user.userId) {
        const error = new Error('Invalid user.')
        throw error
    }

    try {
        const parse = bulkProductDeleteScheme.parse({
            data: data.data,
        })

        for (const product of parse.data) {
            await db
                .delete(products)
                .where(
                    and(
                        eq(products.id, product.id),
                        eq(products.creatorId, product.creatorId),
                    ),
                )
        }
    } catch (e) {
        const error = e as Error
        console.error(error)
        throw error
    }
    revalidatePath('dashboard/products')
}

export async function createCategory(
    data: z.infer<typeof categoryCreateScheme>,
) {
    const user = auth()

    if (!user || !user.userId) {
        const error = new Error('Invalid user.')
        throw error
    }

    // If we have never created a category before, create a default
    const categories = await db.select().from(productCategories)
    if (!categories || categories.length === 0) {
        await db.insert(productCategories).values({
            id: -1,
            name: 'Uncategorized',
            parentId: null,
            creatorId: user.userId,
        })
    }

    try {
        const parse = categoryCreateScheme.parse({
            name: data.name,
            parentId: data.parentId,
        })

        await db.insert(productCategories).values({
            name: parse.name,
            parentId: parse.parentId ?? undefined,
            creatorId: user.userId,
        })
    } catch (e) {
        const error = e as Error
        console.error(error)
        throw error
    }
    revalidatePath('/dashboard/categories')
}

export async function createVariation(
    data: z.infer<typeof variationCreateScheme>,
) {
    const user = auth()

    if (!user || !user.userId) {
        const error = new Error('Invalid user.')
        throw error
    }
    try {
        const parse = variationCreateScheme.parse({
            name: data.name,
            price: data.price,
            productId: data.productId,
            baseProductName: data.baseProductName,
            sku: data.sku,
        })

        await db.insert(productVariations).values({
            name: parse.name,
            price: parse.price.toString(),
            productId: parse.productId,
            baseProductName: parse.baseProductName,
            creatorId: user.userId,
            sku: parse.sku,
        })
    } catch (error) {
        console.error(error)
    }
    revalidatePath('/dashboard/products')
}

export async function editVariation(data: z.infer<typeof variationEditScheme>) {
    const user = auth()
    if (!user || !user.userId) {
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
            sku: data.sku,
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
                    eq(productVariations.creatorId, user.userId),
                ),
            )

        if (parse.sku) {
            await db
                .update(productVariations)
                .set({
                    sku: parse.sku,
                })
                .where(
                    and(
                        eq(productVariations.id, parse.id),
                        eq(productVariations.creatorId, user.userId),
                    ),
                )
        }
    } catch (e) {
        const error = e as Error
        console.error(error)
        throw error
    }
    revalidatePath('/dashboard/products')
}

export async function bulkEditVariation(
    data: z.infer<typeof bulkVariationEditScheme>,
) {
    const user = auth()
    if (!user || !user.userId) {
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
                    eq(productVariations.creatorId, user.userId),
                ),
            )
    } catch (e) {
        const error = e as Error
        console.error(error)
        throw error
    }
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
    const user = auth()

    if (!user || user.userId) {
        const error = new Error('Invalid user.')
        throw error
    }

    if (user.userId !== creatorId) {
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

    // We will be deleting the last variation other than default, so set product price to price of default variation
    if (getAllVariations.length === 2) {
        const defaultVariation = getAllVariations.find(
            (variation) => variation.id !== id,
        )
        await db
            .update(products)
            .set({ price: defaultVariation!.price })
            .where(eq(products.id, productId))
    }
    await db.delete(productVariations).where(eq(productVariations.id, id))

    revalidatePath('/dashboard/products')
}

export async function bulkDeleteVariation(
    data: z.infer<typeof bulkVariationDeleteScheme>,
) {
    const user = auth()

    if (!user || !user.userId) {
        const error = new Error('Invalid user.')
        throw error
    }

    // if (user.id !== creatorId) {
    //     const error = new Error('User does not have permission to delete.')
    //     throw error
    // }

    const parse = bulkVariationDeleteScheme.parse({
        data: data.data,
    })

    const productIds = parse.data.map((variation) => variation.productId)
    const variationIds = parse.data.map((variation) => variation.id)

    for (const productId of productIds) {
        const product = await db.query.products.findFirst({
            where: and(
                eq(products.id, productId),
                eq(products.creatorId, user.userId),
            ),
        })

        const getAllVariations = await db
            .select()
            .from(productVariations)
            .where(eq(productVariations.productId, productId))
        const variationsOfProduct = parse.data.filter(
            (variation) => variation.productId === productId,
        )

        await db
            .delete(productVariations)
            .where(
                and(
                    inArray(productVariations.id, variationIds),
                    eq(productVariations.creatorId, user.userId),
                ),
            )

        // Check if we are deleting all but one variation, set product price to default variation price
        if (getAllVariations.length - variationsOfProduct.length === 1) {
            const getLastVariation = await db.query.productVariations.findFirst(
                {
                    where: and(
                        eq(productVariations.productId, productId),
                        eq(productVariations.creatorId, user.userId),
                    ),
                },
            )

            console.log(`Setting price to ${getLastVariation?.price}`)

            await db
                .update(products)
                .set({ price: getLastVariation!.price })
                .where(eq(products.id, productId))
        }

        // Check if we are deleting all variations, create new default variation
        if (getAllVariations.length === variationsOfProduct.length) {
            await db.insert(productVariations).values({
                name: 'Default',
                price: '0',
                baseProductName: product!.name,
                productId: productId,
                creatorId: user.userId,
            })
            console.log('Setting price to 0')
            await db
                .update(products)
                .set({ price: '0' })
                .where(eq(products.id, productId))
        }
    }
    revalidatePath('/dashboard/products')
}

// Create convention
export async function createConvention(data: z.infer<typeof conventionScheme>) {
    const user = auth()

    if (!user || !user.userId) {
        const error = new Error('Invalid user.')
        throw error
    }

    try {
        const parse = conventionScheme.parse({
            name: data.name,
            location: data.location,
            dateRange: data.dateRange,
        })

        const newConventionQuery = await db
            .insert(conventions)
            .values({
                name: parse.name,
                location: parse.location,
                startDate: parse.dateRange.from.toISOString(),
                endDate: parse.dateRange.to.toISOString(),
                creatorId: user.userId,
            })
            .returning()

        const newConvention = newConventionQuery[0]

        // TODO: Throw error in case of failed db insert
        console.log(newConvention)

        // const currentProducts = await db.query.products.findMany({
        //     where: eq(products.creatorId, user.id),
        // })

        const length = await getConventionLength({
            startDateString: newConvention!.startDate,
            endDateString: newConvention!.endDate,
        })
        console.log(length)

        type NewReport = typeof conventionProductVariationReports.$inferInsert

        const allVariations = await db.query.productVariations.findMany({
            where: eq(productVariations.creatorId, user.userId),
        })

        //const productVariationsWithReports = await db.select({ productId: productVariations.productId }).from(productVariations).rightJoin(conventionProductVariationReports, eq(productVariations.id,conventionProductVariationReports.productVariationId))

        const map2 = allVariations.map((variation) => {
            const dayReports: salesFigures = {}
            const daysInRange = eachDayOfInterval({
                start: newConvention!.startDate,
                end: newConvention!.endDate,
            })
            for (const day of daysInRange) {
                const dayReport: salesFigureDaily = {
                    date: day,
                    cashSales: 0,
                    cardSales: 0,
                }
                dayReports[day.toISOString()] = dayReport
            }

            const newReport: NewReport = {
                name: variation.name,
                productId: variation.productId,
                productName: variation.baseProductName,
                price: variation.price,
                salesFigures: dayReports,
                creatorId: variation.creatorId,
                productVariationId: variation.id,
                conventionId: newConvention!.id,
            }

            return newReport
        })
        console.log(map2)
        await db.insert(conventionProductVariationReports).values(map2)
    } catch (e) {
        const error = e as Error
        console.error(error)
        throw error
    }
    return revalidatePath('/dashboard/conventions')
}

export async function getConventionLength({
    startDateString,
    endDateString,
}: {
    startDateString: string
    endDateString: string
}) {
    return differenceInCalendarDays(startDateString, endDateString)
}

export async function getConventionLengthOld(
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

// Delete one convention
export async function deleteConvention({
    id,
    creatorId,
}: {
    id: number
    creatorId: string
}) {
    const user = auth()

    if (!user || !user.userId) {
        const error = new Error('Invalid user.')
        throw error
    }

    if (user.userId !== creatorId) {
        const error = new Error('User does not have permission to delete.')
        throw error
    }

    await db.delete(conventions).where(eq(conventions.id, id))
    revalidatePath('/dashboard/conventions')
}

// Bulk delete conventions
export async function bulkDeleteConvention(
    data: z.infer<typeof bulkConventionDeleteScheme>,
) {
    const user = auth()

    if (!user || !user.userId) {
        const error = new Error('Invalid user.')
        throw error
    }

    try {
        const parse = bulkConventionDeleteScheme.parse({
            data: data.data,
        })

        for (const convention of parse.data) {
            await db
                .delete(conventions)
                .where(
                    and(
                        eq(conventions.id, convention.id),
                        eq(conventions.creatorId, convention.creatorId),
                    ),
                )
        }
    } catch (e) {
        const error = e as Error
        console.error(error)
        throw error
    }
    revalidatePath('dashboard/conventions')
}
