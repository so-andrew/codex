import CreateConvention from '@/app/_components/CreateConvention'
import ConventionTable from '@/app/_components/tables/ConventionTable'
import { getUserConventions } from '@/server/queries'
import { type Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Conventions - Codex',
}

export default async function Conventions() {
    const userConventions = await getUserConventions()

    return (
        <section className="3xl:px-0 mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4 lg:px-20">
            <section className="flex flex-row items-center justify-between border-b pb-8">
                <h1 className="text-2xl font-semibold">Conventions</h1>
                <CreateConvention />
            </section>
            <section>
                <ConventionTable data={userConventions} />
            </section>
        </section>
    )
}
