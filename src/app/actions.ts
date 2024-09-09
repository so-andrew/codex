'use server'
import { currentUser } from '@clerk/nextjs/server'
import { randomBytes } from 'crypto'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { z, type ZodError } from 'zod'
import { db } from '~/server/db'
import {
    type Convention,
    conventions,
    type Product,
    products,
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
    name: z.string().min(2).max(256),
    category: z.string().optional(),
    price: z.string(),
})

export async function createProduct(formData: FormData) {
    const user = await currentUser()
    console.log(formData)

    if (user) {
        try {
            const parse = productScheme.parse({
                name: formData.get('name'),
                category: formData.get('category'),
                price: formData.get('price'),
            })

            await db.insert(products).values({
                name: parse.name,
                category: parse.category,
                price: parse.price,
                creatorId: user.id,
            })
        } catch (e) {
            const error = e as ZodError
            if (!error.isEmpty) return error.format()
        }
        return revalidatePath('/dashboard/products')
    }
}

export async function deleteProduct(product: Product) {
    const user = await currentUser()
    if (user && user.id === product.creatorId) {
        await db.delete(products).where(eq(products.id, product.id))
    }
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

            await db.insert(conventions).values({
                name: parse.name,
                location: parse.location,
                startDate: parse.dateRange.from.toISOString(),
                endDate: parse.dateRange.to.toISOString(),
                creatorId: user.id,
            })
        } catch (e) {
            const error = e as ZodError
            if (!error.isEmpty) {
                return error.format()
            }
        }
        return revalidatePath('/dashboard/conventions')
    }
}

export async function deleteConvention(convention: Convention) {
    const user = await currentUser()
    if (user && user.id === convention.creatorId) {
        await db.delete(conventions).where(eq(conventions.id, convention.id))
    }
    revalidatePath('/dashboard/conventions')
}
