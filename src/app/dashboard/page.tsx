import { Button } from '@/components/ui/button'
import { currentUser } from '@clerk/nextjs/server'

export default async function Dashboard() {
    const user = await currentUser()

    return (
        <section className="3xl:px-0 mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4 lg:px-20">
            <h1 className="text-2xl font-semibold">{`Welcome back, ${user!.firstName}.`}</h1>
            <section className="border-b pb-8">
                <div className="flex flex-row gap-6">
                    <Button className="bg-purple-500 hover:bg-purple-600">
                        Add Convention
                    </Button>
                    <Button className="bg-gray-100 text-purple-500 hover:bg-purple-100">
                        Add Product
                    </Button>
                </div>
            </section>
        </section>
    )
}
