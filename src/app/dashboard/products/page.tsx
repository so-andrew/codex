import { currentUser } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import CreateProduct from '~/app/_components/CreateProduct'
import ProductTable from '~/app/_components/ProductTable'
import { columns } from '~/app/dashboard/products/columns'
import { db } from '~/server/db'
import { products } from '~/server/db/schema'

export default async function Products() {
    const user = await currentUser()
    const userProducts = await db.query.products.findMany({
        where: eq(products.creatorId, user!.id),
    })

    return (
        <section className="3xl:px-0 mx-auto flex max-w-[1440px] flex-col gap-4 px-8 py-4 lg:px-20">
            <section className="flex flex-row justify-between border-b pb-8">
                <h1 className="text-2xl font-semibold">Products</h1>
                <CreateProduct />
            </section>
            <section>
                <ProductTable columns={columns} data={userProducts} />
            </section>
        </section>
    )
}
