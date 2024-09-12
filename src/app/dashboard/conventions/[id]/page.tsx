import { currentUser } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm'
import ConventionDropdownMenu from '~/app/_components/ConventionDropdownMenu'
import { db } from '~/server/db'
import { conventions } from '~/server/db/schema'

export default async function page({ params }: { params: { id: string } }) {
    const user = await currentUser()
    const convention = await db.query.conventions.findFirst({
        where: and(
            eq(conventions.id, parseInt(params.id)),
            eq(conventions.creatorId, user!.id),
        ),
    })

    const startDateString = convention
        ? new Date(Date.parse(convention.startDate)).toLocaleDateString(
              'en-US',
              {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
              },
          )
        : 'N/A'
    const endDateString = convention
        ? new Date(Date.parse(convention.endDate)).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          })
        : 'N/A'

    return (
        <section className="3xl:px-0 mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4 lg:px-20">
            <section className="flex flex-row justify-between border-b pb-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold">
                        {convention?.name}
                    </h1>
                    <h2 className="text-lg text-gray-500">
                        {convention?.location}
                    </h2>
                    <h2 className="text-lg text-gray-500">
                        {startDateString} - {endDateString}
                    </h2>
                </div>

                {/* <Card>
                    <CardHeader>
                        <CardTitle>{}</CardTitle>
                    </CardHeader>
                </Card> */}
                {convention && (
                    <ConventionDropdownMenu convention={convention} />
                )}
            </section>
        </section>
    )
}
