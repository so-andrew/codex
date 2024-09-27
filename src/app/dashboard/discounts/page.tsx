import CreateDiscount from '@/app/_components/CreateDiscount'
import DiscountTable from '@/app/_components/tables/DiscountTable'
import { getUserDiscounts } from '@/server/queries'

import { type Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Discounts - Codex',
}

export default async function page() {
    const discounts = await getUserDiscounts()

    return (
        <div className="3xl:px-0 mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4 lg:px-20">
            <section className="flex flex-row items-center justify-between border-b pb-8 gap-4">
                <h1 className="text-2xl font-semibold">Discounts</h1>
                <CreateDiscount />
            </section>
            <div>
                <DiscountTable data={discounts} />
            </div>
        </div>
    )
}
