import CreateVariation from '@/app/_components/CreateVariation'
import EditProduct from '@/app/_components/EditProduct'
import VariationTable from '@/app/_components/tables/VariationTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type Product, type ProductVariation } from '@/server/db/schema'
import {
    getProductById,
    getUserCategories,
    getUserProductVariations,
} from '@/server/queries'
import { type Metadata, type ResolvingMetadata } from 'next'
import { redirect } from 'next/navigation'

type Props = {
    params: { id: string }
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata,
): Promise<Metadata> {
    const id = parseInt(params.id)
    const product = await getProductById(id)

    return {
        title: product ? `${product.name} - Codex` : '',
    }
}

export default async function page({ params }: { params: { id: string } }) {
    const product = (await getProductById(parseInt(params.id))) as Product
    const { categories, categoryMap } = await getUserCategories()

    if (!product) {
        redirect('/dashboard/products')
    }

    const variations = (await getUserProductVariations(
        product.id,
    )) as ProductVariation[]

    console.log(variations)

    let formattedAmount = ''

    if (variations.length > 1) {
        const prices = variations.map((variation) =>
            parseFloat(variation.price),
        )
        if (Math.max(...prices) === Math.min(...prices)) {
            formattedAmount = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(prices[0]!)
        } else {
            const formattedMin = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(Math.min(...prices))
            const formattedMax = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(Math.max(...prices))
            formattedAmount = `${formattedMin} - ${formattedMax}`
        }
    } else {
        formattedAmount = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(parseInt(variations[0]!.price))
    }

    return (
        <section className="3xl:px-0 mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4 lg:px-20">
            <section className="flex flex-row justify-between border-b pb-8">
                <Card>
                    <CardHeader>
                        <CardTitle className=" flex flex-row gap-4 px-2 text-2xl">
                            <span>{product?.name}</span>
                            <EditProduct
                                product={product}
                                categories={categories}
                            />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-row justify-between gap-2 px-2">
                            <span className="text-lg text-gray-500">
                                {product
                                    ? (categoryMap.get(product.category) ?? '')
                                    : ''}
                            </span>
                            <span className="text-lg text-gray-500">
                                {formattedAmount}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </section>
            <section>
                <div className="flex flex-row justify-between items-center">
                    <h2 className="text-xl font-bold">Variations</h2>
                    <CreateVariation product={product} />
                </div>
                <VariationTable data={variations} />
            </section>
        </section>
    )
}
