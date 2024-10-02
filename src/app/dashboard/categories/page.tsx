import CreateCategory from '@/app/_components/CreateCategory'
import CategoryTable from '@/app/_components/tables/CategoryTable'
import { getCategoryHierarchy, getUserCategories } from '@/server/queries'
import { type Metadata } from 'next/types'

export const metadata: Metadata = {
    title: 'Categories - Codex',
}

export default async function page() {
    const hierarchy = await getCategoryHierarchy()
    const filteredHierarchy = hierarchy.filter((row) => row.category.id !== -1)
    const { categories } = await getUserCategories()

    return (
        <div className="3xl:px-0 mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4 lg:px-20">
            <section className="flex flex-row items-center justify-between border-b pb-8 gap-4">
                <h1 className="text-2xl font-semibold">Categories</h1>
                <CreateCategory categories={categories} />
            </section>
            <div>
                <CategoryTable
                    data={filteredHierarchy}
                    categories={categories}
                />
            </div>
        </div>
    )
}
