import { currentUser } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import CreateConvention from '~/app/_components/CreateConvention'
import { db } from '~/server/db'
import { conventions } from '~/server/db/schema'

export default async function Conventions() {
    const user = await currentUser()
    const userConventions = await db.query.conventions.findMany({
        where: eq(conventions.creatorId, user!.id),
    })

    return (
        <section className="3xl:px-0 mx-auto flex max-w-[1440px] flex-col gap-4 px-8 py-4 lg:px-20">
            <section className="flex flex-row justify-between border-b pb-8">
                <h1 className="text-2xl font-semibold">Conventions</h1>
                <CreateConvention />
            </section>
        </section>
    )
}
