import { eq } from 'drizzle-orm'
import CreateProduct from '~/app/_components/CreateProduct'
import ProductTable from '~/app/_components/tables/ProductTable'
import { db } from '~/server/db/index'
import {
    products,
    productVariations,
    type Product,
    type ProductVariation,
} from '~/server/db/schema'
import { type ProductTableRow, type ProductWithVariations } from '~/types'

export default async function Products() {
    //const userProducts = (await getUserProducts()) as ProductData[]

    // const userProductsAndVariations = await Promise.all(
    //     userProducts.map(async (product) => {
    //         const availableVariations = (await getUserProductVariations(
    //             product.id,
    //         )) as ProductVariation[]
    //         product.variations = availableVariations
    //         return product
    //     }),
    // )
    //console.log(userProductsAndVariations)

    const query = await db
        .select()
        .from(products)
        .leftJoin(
            productVariations,
            eq(products.id, productVariations.productId),
        )

    //console.log(query)

    const result = query.reduce<
        Record<number, { product: Product; variations: ProductVariation[] }>
    >((acc, row) => {
        const product = row.product
        const variation = row.productVariations

        if (!acc[product.id]) {
            acc[product.id] = { product, variations: [] }
        }

        if (variation) {
            acc[product.id]!.variations.push(variation)
        }

        return acc
    }, {})

    const userProductsAndVariations = Object.values(
        result,
    ) as ProductWithVariations[]

    const tableRows: ProductTableRow[] = []

    for (const p of userProductsAndVariations) {
        const product = p.product
        const variations = p.variations

        const variationRows: ProductTableRow[] = []
        for (const v of variations) {
            variationRows.push({
                product: v,
                variations: [],
            })
        }
        tableRows.push({
            product: product,
            variations: variationRows,
        })
    }

    return (
        <section className="3xl:px-0 mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4 lg:px-20">
            <section className="flex flex-row items-center justify-between border-b pb-8">
                <h1 className="text-2xl font-semibold">Products</h1>
                <CreateProduct />
            </section>
            <section>
                <ProductTable data={tableRows} />
            </section>
        </section>
    )
}
