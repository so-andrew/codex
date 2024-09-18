'use client'

import ReportTable from '@/app/_components/ReportTable'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type ProductsByCategory } from '@/types'
import { formatInTimeZone } from 'date-fns-tz'
import { useState } from 'react'

export default function ConventionTabs({
    data,
    range,
}: {
    data: ProductsByCategory[]
    range: Date[]
}) {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const [tab, setTab] = useState(
        formatInTimeZone(range[0]!, timeZone, 'EEE, MMM d'),
    )

    const onTabChange = (value: unknown) => {
        console.log(value)
    }

    return (
        <Tabs value={tab} onValueChange={onTabChange} className="w-full">
            <TabsList className={`flex w-fit flex-row justify-start`}>
                {range.map((day) => {
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
            {range.map((day, index) => {
                const dateString = formatInTimeZone(day, timeZone, 'EEE, MMM d')
                return (
                    <TabsContent key={index} value={dateString}>
                        <Card className="pb-16">
                            <CardContent className="flex flex-col gap-4">
                                <ReportTable
                                    data={data}
                                    day={day.toISOString()}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                )
            })}
        </Tabs>
    )
}
