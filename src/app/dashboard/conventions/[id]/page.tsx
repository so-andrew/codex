import EditConvention from '@/app/_components/EditConvention'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getConventionById, getConventionReports } from '@/server/queries'
import { eachDayOfInterval } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { redirect } from 'next/navigation'

export default async function page({ params }: { params: { id: string } }) {
    const convention = await getConventionById(parseInt(params.id))
    const reports = await getConventionReports(parseInt(params.id))

    if (!convention) {
        redirect('/dashboard/conventions')
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const daysInRange = eachDayOfInterval({
        start: convention.startDate,
        end: convention.endDate,
    })

    const startDateString = convention
        ? formatInTimeZone(convention.startDate, timeZone, 'EEEE, MMM d, yyyy')
        : 'N/A'

    const endDateString = convention
        ? formatInTimeZone(convention.endDate, timeZone, 'EEEE, MMM d, yyyy')
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
                {convention && <EditConvention convention={convention} />}
            </section>

            <Tabs
                defaultValue={formatInTimeZone(
                    daysInRange[0]!,
                    timeZone,
                    'EEE, MMM d',
                )}
                className="w-fit"
            >
                <TabsList className={`flex flex-row justify-start`}>
                    {daysInRange.map((day) => {
                        const dateString = formatInTimeZone(
                            day,
                            timeZone,
                            'EEE, MMM d',
                        )
                        return (
                            <TabsTrigger key={day.getDate()} value={dateString}>
                                {dateString}
                            </TabsTrigger>
                        )
                    })}
                </TabsList>
                {daysInRange.map((day) => {
                    const dateString = formatInTimeZone(
                        day,
                        timeZone,
                        'EEE, MMM d',
                    )
                    return (
                        <TabsContent key={day.getDate()} value={dateString}>
                            <div className="flex flex-col gap-4 pt-4">
                                <h1>{dateString}</h1>
                            </div>
                        </TabsContent>
                    )
                })}
            </Tabs>

            {/* <section className="flex flex-col gap-4">
                {categories.map((category) => {
                    return <h1 key={category.id}>{category.name}</h1>
                })}
            </section> */}
        </section>
    )
}
