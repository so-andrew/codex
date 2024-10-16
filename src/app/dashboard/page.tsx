import { Button } from '@/components/ui/button'
import { getMonthlyRevenue } from '@/server/queries'
import { currentUser } from '@clerk/nextjs/server'

export default async function Dashboard() {
    const user = await currentUser()
    const test = await getMonthlyRevenue()
    console.log(test)

    return (
        <section className="3xl:px-0 mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4 lg:px-20">
            <h1 className="text-2xl font-semibold">{`Welcome back, ${user!.firstName}.`}</h1>
            <div className="border-b pb-8">
                <div className="flex flex-row gap-6">
                    <Button className="">Add Convention</Button>
                    <Button variant="secondary">Add Product</Button>
                </div>
            </div>
            <section></section>
        </section>
    )
}
