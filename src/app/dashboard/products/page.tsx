import { currentUser } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm'
import CreateProduct from '~/app/_components/CreateProduct'
import ProductTable from '~/app/_components/tables/ProductTable'
import { db } from '~/server/db'
import {
    type ProductData,
    products,
    type ProductVariation,
    productVariations,
} from '~/server/db/schema'

export default async function Products() {
    const user = await currentUser()
    // const userProductsWithVariations = await db.query.products.findMany({
    //     where: eq(products.creatorId, user!.id),
    //     with: {
    //         productVariations: true,
    //     },
    // })

    // const userProducts = await db.query.products.findMany({
    //     where: eq(products.creatorId, user!.id),
    // })

    const userProducts = (await db
        .select()
        .from(products)
        .where(eq(products.creatorId, user!.id))) as ProductData[]

    const userProductsAndVariations = await Promise.all(
        userProducts.map(async (product) => {
            const availableVariations =
                (await db.query.productVariations.findMany({
                    where: and(
                        eq(productVariations.productId, product.id),
                        eq(productVariations.creatorId, user!.id),
                    ),
                })) as ProductVariation[]
            product.variations = availableVariations
            return product
        }),
    )

    console.log(userProductsAndVariations)

    return (
        <section className="3xl:px-0 mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4 lg:px-20">
            <section className="flex flex-row justify-between border-b pb-8">
                <h1 className="text-2xl font-semibold">Products</h1>
                <CreateProduct />
            </section>
            <section>
                <ProductTable data={userProductsAndVariations} />
            </section>
        </section>
    )
}
