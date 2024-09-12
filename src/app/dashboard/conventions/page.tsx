import { currentUser } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import CreateConvention from '~/app/_components/CreateConvention'
import ConventionTable from '~/app/_components/tables/ConventionTable'
import { columns } from '~/app/dashboard/conventions/columns'
import { db } from '~/server/db'
import { conventions } from '~/server/db/schema'

export default async function Conventions() {
    const user = await currentUser()
    const userConventions = await db.query.conventions.findMany({
        where: eq(conventions.creatorId, user!.id),
    })

    return (
        <section className="3xl:px-0 mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4 lg:px-20">
            <section className="flex flex-row items-center justify-between border-b pb-8">
                <h1 className="text-2xl font-semibold">Conventions</h1>
                <CreateConvention />
            </section>
            <section>
                <ConventionTable columns={columns} data={userConventions} />
            </section>
        </section>
    )
}
