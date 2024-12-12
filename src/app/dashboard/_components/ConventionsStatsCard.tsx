import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { type ConventionInfo } from '@/types'
import { formatInTimeZone } from 'date-fns-tz'
import Link from 'next/link'

export default function ConventionsStatsCard({
    data,
}: {
    data: ConventionInfo[]
}) {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    return (
        <Card className="h-60">
            <CardHeader className="space-y-1">
                <CardTitle className="text-lg">Conventions</CardTitle>
                <CardDescription className="leading-none">
                    In selected period
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 overflow-y-auto mr-2">
                <div className="space-y-2">
                    {data.map((convention) => {
                        const startDateString = convention
                            ? formatInTimeZone(
                                  convention.startDate,
                                  timeZone,
                                  'MMM d',
                              )
                            : 'N/A'

                        const endDateString = convention
                            ? formatInTimeZone(
                                  convention.endDate,
                                  timeZone,
                                  'MMM d',
                              )
                            : 'N/A'

                        return (
                            <div key={convention.id}>
                                <Link
                                    href={`/dashboard/conventions/${convention.id}`}
                                    className="text-blue-500 font-medium"
                                >
                                    {convention.name}
                                </Link>
                                <div className="font-light text-muted-foreground">
                                    {convention.location} ({startDateString}-
                                    {endDateString})
                                </div>
                            </div>
                        )
                    })}
                </div>
                {!data?.length && (
                    <div className="text-gray-500 text-center py-12">
                        No conventions in selected period
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
