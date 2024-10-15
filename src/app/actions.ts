'use server'
import { auth } from '@clerk/nextjs/server'
import { randomBytes } from 'crypto'
import { differenceInCalendarDays, eachDayOfInterval } from 'date-fns'
import { and, eq, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
//import { cookies } from 'next/headers'
import { db } from '@/server/db'
import {
    conventionDiscountReports,
    conventionProductReports,
    conventions,
    discountDaily,
    discounts,
    productCategories,
    productDailyRevenue,
    products,
    productVariations,
} from '@/server/db/schema'
import { getUserCategories } from '@/server/queries'
import { z } from 'zod'

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
    price: z.coerce.number().nonnegative(),
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
    price: z.coerce.number().nonnegative().optional(),
})

const bulkProductDeleteScheme = z.object({
    data: z.array(generalItemSchema),
})

// Discount schemas
const discountCreateScheme = z.object({
    name: z.string().min(2).max(100),
    amount: z.coerce.number().nonnegative(),
})

const discountEditScheme = z.object({
    id: z.number(),
    name: z.string().min(2).max(100),
    amount: z.coerce.number().nonnegative(),
    creatorId: z.string(),
})

// Category schemas
const categoryCreateScheme = z.object({
    name: z.string().min(2).max(100),
    parentId: z.number().optional(),
})

const categoryEditScheme = z.object({
    id: z.number(),
    name: z.string().min(2).max(100),
    parentId: z.number().nullable(),
    creatorId: z.string(),
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
const conventionCreateScheme = z.object({
    name: z.string().min(2).max(100),
    location: z.string().min(2).max(100),
    dateRange: z.object({
        from: z.date(),
        to: z.date(),
    }),
})

const conventionEditScheme = z.object({
    id: z.number(),
    name: z.string().min(2).max(100),
    location: z.string().min(2).max(100),
    dateRange: z.object({
        from: z.date(),
        to: z.date().optional(),
    }),
})

const bulkConventionDeleteScheme = z.object({
    data: z.array(generalItemSchema),
})

// Record schema
const productReportScheme = z.object({
    reportId: z.coerce.number(),
    date: z.date(),
    type: z.literal('product'),
    cashSales: z.number().int().min(0, 'Number must be nonnegative').optional(),
    cardSales: z.number().int().min(0, 'Number must be nonnegative').optional(),
})

const discountReportScheme = z.object({
    reportId: z.coerce.number(),
    date: z.date(),
    type: z.literal('discount'),
    cashDiscounts: z
        .number()
        .int()
        .min(0, 'Number must be nonnegative')
        .optional(),
    cardDiscounts: z
        .number()
        .int()
        .min(0, 'Number must be nonnegative')
        .optional(),
})

const reportOrDiscount = z.discriminatedUnion('type', [
    productReportScheme,
    discountReportScheme,
])

const reportFormScheme = z.array(reportOrDiscount)

const customReportCreateScheme = z.object({
    name: z.string().min(2).max(100),
    price: z.coerce.number().nonnegative(),
    conventionId: z.number(),
})

const customReportEditScheme = z.object({
    id: z.number(),
    name: z.string().min(2).max(100),
    price: z.coerce.number().nonnegative(),
    conventionId: z.number(),
})

const customDiscountCreateScheme = z.object({
    name: z.string().min(2).max(100),
    amount: z.coerce.number().nonnegative(),
    conventionId: z.number(),
})

const customDiscountEditScheme = z.object({
    id: z.number(),
    name: z.string().min(2).max(100),
    amount: z.coerce.number().nonnegative(),
    conventionId: z.number(),
})

type NewReport = typeof conventionProductReports.$inferInsert
type NewDailyRevenue = typeof productDailyRevenue.$inferInsert
type NewDiscountReport = typeof conventionDiscountReports.$inferInsert
type NewDailyDiscount = typeof discountDaily.$inferInsert

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

export async function deleteProduct(data: z.infer<typeof generalItemSchema>) {
    const user = auth()
    if (!user || !user.userId) {
        const error = new Error('Invalid user.')
        throw error
    }

    const parse = generalItemSchema.parse({
        id: data.id,
        creatorId: data.creatorId,
    })

    if (user.userId !== parse.creatorId) {
        const error = new Error('User does not have permission to delete.')
        throw error
    }
    await db.delete(products).where(eq(products.id, parse.id))
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

// Create discounts
export async function createDiscount(
    data: z.infer<typeof discountCreateScheme>,
) {
    const user = auth()

    if (!user || !user.userId) {
        const error = new Error('Invalid user.')
        throw error
    }

    try {
        const parse = discountCreateScheme.parse({
            name: data.name,
            amount: data.amount,
        })

        await db.insert(discounts).values({
            name: parse.name,
            amount: parse.amount.toString(),
            creatorId: user.userId,
        })
    } catch (e) {
        const error = e as Error
        console.error(error)
        throw error
    }
    revalidatePath('/dashboard/discounts')
}

export async function editDiscount(data: z.infer<typeof discountEditScheme>) {
    const user = auth()

    if (!user || !user.userId) {
        const error = new Error('Invalid user.')
        throw error
    }

    try {
        const parse = discountEditScheme.parse({
            id: data.id,
            name: data.name,
            amount: data.amount,
            creatorId: data.creatorId,
        })

        await db
            .update(discounts)
            .set({
                name: parse.name,
                amount: parse.amount.toString(),
            })
            .where(
                and(
                    eq(discounts.id, parse.id),
                    eq(discounts.creatorId, parse.creatorId),
                ),
            )
        revalidatePath('/dashboard/discounts')
    } catch (e) {
        const error = e as Error
        console.error(error)
        throw error
    }
}

export async function deleteDiscount(data: z.infer<typeof generalItemSchema>) {
    const user = auth()

    if (!user || !user.userId) {
        const error = new Error('Invalid user.')
        throw error
    }

    const parse = generalItemSchema.parse({
        id: data.id,
        creatorId: data.creatorId,
    })

    if (user.userId !== parse.creatorId) {
        const error = new Error('User does not have permission to delete.')
        throw error
    }

    await db.delete(discounts).where(eq(discounts.id, parse.id))
    revalidatePath('/dashboard/discounts')
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
            parentId: parse.parentId === -1 ? null : parse.parentId,
            creatorId: user.userId,
        })
    } catch (e) {
        const error = e as Error
        console.error(error)
        throw error
    }
    revalidatePath('/dashboard/categories')
}

export async function editCategory(data: z.infer<typeof categoryEditScheme>) {
    const user = auth()

    if (!user || !user.userId) {
        const error = new Error('Invalid user.')
        throw error
    }

    try {
        const parse = categoryEditScheme.parse({
            id: data.id,
            name: data.name,
            parentId: data.parentId,
            creatorId: data.creatorId,
        })

        await db
            .update(productCategories)
            .set({
                name: data.name,
                parentId: data.parentId,
            })
            .where(eq(productCategories.id, parse.id))
        revalidatePath('/dashboard/categories')
    } catch (e) {
        const error = e as Error
        console.error(error)
        throw error
    }
}

export async function deleteCategory(data: z.infer<typeof generalItemSchema>) {
    const user = auth()

    if (!user || !user.userId) {
        const error = new Error('Invalid user.')
        throw error
    }

    const parse = generalItemSchema.parse({
        id: data.id,
        creatorId: data.creatorId,
    })

    if (user.userId !== parse.creatorId) {
        const error = new Error('User does not have permission to delete.')
        throw error
    }

    await db.delete(productCategories).where(eq(productCategories.id, parse.id))
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

        const getAllVariations = await db
            .select()
            .from(productVariations)
            .where(eq(productVariations.productId, parse.productId))

        if (getAllVariations.length > 1) {
            await db
                .update(products)
                .set({ price: null })
                .where(
                    and(
                        eq(products.id, parse.productId),
                        eq(products.creatorId, user.userId),
                    ),
                )
        }
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

        const product = await db.query.products.findFirst({
            where: eq(products.id, parse.productId),
        })

        const getAllVariations = await db
            .select()
            .from(productVariations)
            .where(eq(productVariations.productId, parse.productId))

        if (getAllVariations.length <= 1 && parse.name !== 'Default') {
            const error = new Error('Cannot edit name of default variation.')
            throw error
        }

        await db
            .update(productVariations)
            .set({
                name: parse.name,
                price: parse.price.toString(),
                sku: parse.sku,
            })
            .where(
                and(
                    eq(productVariations.id, parse.id),
                    eq(productVariations.creatorId, user.userId),
                ),
            )

        if (
            getAllVariations.length <= 1 &&
            parse.price.toString() !== product!.price
        ) {
            await db
                .update(products)
                .set({ price: parse.price.toString() })
                .where(
                    and(
                        eq(products.id, parse.productId),
                        eq(products.creatorId, user.userId),
                    ),
                )
        }

        // if (parse.sku) {
        //     await db
        //         .update(productVariations)
        //         .set({
        //             sku: parse.sku,
        //         })
        //         .where(
        //             and(
        //                 eq(productVariations.id, parse.id),
        //                 eq(productVariations.creatorId, user.userId),
        //             ),
        //         )
        // }
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

    if (!user || !user.userId) {
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
            where: eq(products.id, productId),
        })

        // For each product, get all of its variations
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
export async function createConvention(
    data: z.infer<typeof conventionCreateScheme>,
) {
    const user = auth()

    if (!user || !user.userId) {
        const error = new Error('Invalid user.')
        throw error
    }

    try {
        const parse = conventionCreateScheme.parse({
            name: data.name,
            location: data.location,
            dateRange: data.dateRange,
        })

        if (!parse.dateRange.to) parse.dateRange.to = parse.dateRange.from

        const length = await getConventionLength({
            startDate: parse.dateRange.from,
            endDate: parse.dateRange.to,
        })

        // Create convention db entry
        const newConventionQuery = await db
            .insert(conventions)
            .values({
                name: parse.name,
                location: parse.location,
                length: length,
                startDate: parse.dateRange.from,
                endDate: parse.dateRange.to,
                creatorId: user.userId,
            })
            .returning()

        const newConvention = newConventionQuery[0]
        if (!newConvention) throw new Error('Convention not found')

        const daysInRange = eachDayOfInterval({
            start: newConvention.startDate,
            end: newConvention.endDate,
        })

        // TODO: Throw error in case of failed db insert

        // Get all products
        // const allVariations = await db.query.productVariations.findMany({
        //     where: eq(productVariations.creatorId, user.userId),
        // })

        const allVariations = await db
            .select()
            .from(productVariations)
            .where(eq(productVariations.creatorId, user.userId))
            .leftJoin(products, eq(productVariations.productId, products.id))

        //console.log('allVariations:', allVariations)

        // Get all categories
        const { categoryMap } = await getUserCategories()

        // Generate reports for all products
        const map2 = allVariations.map(({ productVariations, product }) => {
            const newReport: NewReport = {
                name: productVariations.name,
                productId: productVariations.productId,
                originalProductId: productVariations.productId,
                productName: productVariations.baseProductName,
                categoryId: product?.category ?? -1,
                categoryName:
                    product && categoryMap.has(product.category)
                        ? categoryMap.get(product.category)
                        : 'Uncategorized',
                price: productVariations.price,
                creatorId: productVariations.creatorId,
                productVariationId: productVariations.id,
                conventionId: newConvention.id,
            }
            return newReport
        })

        const reports = await db
            .insert(conventionProductReports)
            .values(map2)
            .returning()
        const dailyRevenues = []

        // Generate all revenue entries for reports
        for (const report of reports) {
            for (const day of daysInRange) {
                const dailyRevenue: NewDailyRevenue = {
                    reportId: report.id,
                    conventionId: report.conventionId,
                    categoryId: report.categoryId,
                    date: day,
                }
                dailyRevenues.push(dailyRevenue)
            }
        }
        await db.insert(productDailyRevenue).values(dailyRevenues)

        type NewDiscountReport = typeof conventionDiscountReports.$inferInsert
        type NewDailyDiscount = typeof discountDaily.$inferInsert

        // Get all discounts
        const allDiscounts = await db
            .select()
            .from(discounts)
            .where(eq(discounts.creatorId, user.userId))

        // Generate reports for all discounts
        const map3 = allDiscounts.map((discount) => {
            const newDiscountReport: NewDiscountReport = {
                name: discount.name,
                amount: discount.amount,
                discountId: discount.id,
                creatorId: discount.creatorId,
                conventionId: newConvention.id,
            }
            return newDiscountReport
        })

        const discountReports = await db
            .insert(conventionDiscountReports)
            .values(map3)
            .returning()
        const dailyDiscounts = []

        // Generate all daily entries for discount reports
        for (const report of discountReports) {
            for (const day of daysInRange) {
                const dailyDiscount: NewDailyDiscount = {
                    reportId: report.id,
                    conventionId: report.conventionId,
                    date: day,
                }
                dailyDiscounts.push(dailyDiscount)
            }
        }
        await db.insert(discountDaily).values(dailyDiscounts)
    } catch (e) {
        const error = e as Error
        console.error(error)
        throw error
    }
    return revalidatePath('/dashboard/conventions')
}

export async function editConvention(
    data: z.infer<typeof conventionEditScheme>,
) {
    const user = auth()

    if (!user || !user.userId) {
        const error = new Error('Invalid user.')
        throw error
    }

    try {
        const parse = conventionEditScheme.parse({
            id: data.id,
            name: data.name,
            location: data.location,
            dateRange: data.dateRange,
        })

        await db
            .update(conventions)
            .set({
                name: parse.name,
                location: parse.location,
                startDate: parse.dateRange.from,
                endDate: parse.dateRange.to,
            })
            .where(eq(conventions.id, parse.id))
        revalidatePath('/dashboard/conventions')
    } catch (e) {
        const error = e as Error
        console.error(error)
        throw error
    }
}

export async function getConventionLength({
    startDate,
    endDate,
}: {
    startDate: Date
    endDate: Date
}) {
    return differenceInCalendarDays(endDate, startDate) + 1
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

export async function editRecords(data: z.infer<typeof reportFormScheme>) {
    const user = auth()

    if (!user || !user.userId) {
        const error = new Error('Invalid user.')
        throw error
    }

    try {
        for (const report of data) {
            const parse = reportOrDiscount.parse(report)
            switch (parse.type) {
                case 'product': {
                    await db
                        .update(productDailyRevenue)
                        .set({
                            cashSales: parse.cashSales,
                            cardSales: parse.cardSales,
                        })
                        .where(
                            and(
                                eq(
                                    productDailyRevenue.reportId,
                                    parse.reportId,
                                ),
                                eq(productDailyRevenue.date, parse.date),
                            ),
                        )
                    break
                }
                case 'discount': {
                    await db
                        .update(discountDaily)
                        .set({
                            cashDiscounts: parse.cashDiscounts,
                            cardDiscounts: parse.cardDiscounts,
                        })
                        .where(
                            and(
                                eq(discountDaily.reportId, parse.reportId),
                                eq(discountDaily.date, parse.date),
                            ),
                        )
                    break
                }
            }
        }
    } catch (e) {
        const error = e as Error
        console.error(error)
        throw error
    }
    revalidatePath('/dashboard/conventions')
}

export async function addCustomReport(
    data: z.infer<typeof customReportCreateScheme>,
) {
    const user = auth()
    if (!user || !user.userId) {
        const error = new Error('Invalid user.')
        throw error
    }

    try {
        if (customReportCreateScheme.parse(data)) {
            const newReport: NewReport = {
                name: data.name,
                productName: data.name,
                price: data.price.toString(),
                creatorId: user.userId,
                conventionId: data.conventionId,
                custom: true,
            }

            const convention = await db.query.conventions.findFirst({
                where: eq(conventions.id, newReport.conventionId),
            })
            if (!convention) throw new Error('Convention not found')

            const report = await db
                .insert(conventionProductReports)
                .values(newReport)
                .returning()

            const daysInRange = eachDayOfInterval({
                start: convention.startDate,
                end: convention.endDate,
            })

            const dailyRevenues = []
            for (const day of daysInRange) {
                const dailyRevenue: NewDailyRevenue = {
                    reportId: report[0]!.id,
                    conventionId: report[0]!.conventionId,
                    categoryId: -1,
                    date: day,
                }
                dailyRevenues.push(dailyRevenue)
            }

            await db.insert(productDailyRevenue).values(dailyRevenues)
        }
    } catch (e) {
        const error = e as Error
        console.error(error)
        throw error
    }
    revalidatePath('/dashboard/conventions')
}

export async function editCustomReport(
    data: z.infer<typeof customReportEditScheme>,
) {
    const user = auth()
    if (!user || !user.userId) {
        const error = new Error('Invalid user.')
        throw error
    }

    try {
        const parse = customReportEditScheme.parse(data)
        await db
            .update(conventionProductReports)
            .set({ name: parse.name, price: parse.price.toString() })
            .where(
                and(
                    eq(conventionProductReports.id, parse.id),
                    eq(conventionProductReports.creatorId, user.userId),
                ),
            )
    } catch (e) {
        const error = e as Error
        console.error(error)
        throw error
    }
    revalidatePath('/dashboard/conventions')
}


export async function addCustomDiscount(
    data: z.infer<typeof customDiscountCreateScheme>,
) {
    const user = auth()
    if (!user || !user.userId) {
        const error = new Error('Invalid user.')
        throw error
    }

    try {
        if (customDiscountCreateScheme.parse(data)) {
            const newDiscount: NewDiscountReport = {
                name: data.name,
                amount: data.amount.toString(),
                creatorId: user.userId,
                conventionId: data.conventionId,
                custom: true,
            }

            const convention = await db.query.conventions.findFirst({
                where: eq(conventions.id, newDiscount.conventionId),
            })
            if (!convention) throw new Error('Convention not found')

            const discount = await db
                .insert(conventionDiscountReports)
                .values(newDiscount)
                .returning()

            const daysInRange = eachDayOfInterval({
                start: convention.startDate,
                end: convention.endDate,
            })

            const dailyDiscounts = []
            for (const day of daysInRange) {
                const dailyDiscount: NewDailyDiscount = {
                    reportId: discount[0]!.id,
                    conventionId: discount[0]!.conventionId,
                    date: day,
                }
                dailyDiscounts.push(dailyDiscount)
            }

            await db.insert(discountDaily).values(dailyDiscounts)
        }
    } catch (e) {
        const error = e as Error
        console.error(error)
        throw error
    }
    revalidatePath('/dashboard/conventions')
}

export async function editCustomDiscount(
    data: z.infer<typeof customDiscountEditScheme>,
) {
    const user = auth()
    if (!user || !user.userId) {
        const error = new Error('Invalid user.')
        throw error
    }

    try {
        const parse = customDiscountEditScheme.parse(data)
        await db
            .update(conventionDiscountReports)
            .set({ name: parse.name, amount: parse.amount.toString() })
            .where(
                and(
                    eq(conventionDiscountReports.id, parse.id),
                    eq(conventionDiscountReports.creatorId, user.userId),
                ),
            )
    } catch (e) {
        const error = e as Error
        console.error(error)
        throw error
    }
    revalidatePath('/dashboard/conventions')
}
