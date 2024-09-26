import CreateProduct from '@/app/_components/CreateProduct'
import ProductTable from '@/app/_components/tables/ProductTable'
import { getProductHierarchy, getUserCategories } from '@/server/queries'
import { type Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Products - Codex',
}

export default async function Products() {
    const tableRows = await getProductHierarchy()
    const { categories } = await getUserCategories()

    return (
        <div className="3xl:px-0 mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4 lg:px-20">
            <section className="flex flex-row items-center justify-between border-b pb-8">
                <h1 className="text-2xl font-semibold">Products</h1>
                <CreateProduct categories={categories} />
            </section>
            <div>
                <ProductTable data={tableRows} />
            </div>
        </div>
    )
}
