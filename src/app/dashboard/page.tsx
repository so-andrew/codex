import { currentUser } from "@clerk/nextjs/server"
import { Button } from "~/components/ui/button"

export default async function Dashboard(){

    const user = await currentUser()

    return(
        <section className="mx-auto max-w-[1440px] px-8 lg:px-20 3xl:px-0 flex flex-col gap-4 py-8">
            <h1 className="font-semibold text-2xl">{`Welcome back, ${user!.firstName}.`}</h1>
            <section className="border-b pb-8">
                <div className="flex flex-row gap-6">
                    <Button className="bg-purple-500 hover:bg-purple-600">Add Convention</Button>
                    <Button className="bg-gray-100 text-purple-500 hover:bg-purple-100">Add Product</Button>
                </div>
            </section>
        </section>
    )
}