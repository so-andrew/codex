'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
} from '@/components/ui/chart'
import { type DailyRevenueChartData } from '@/types'
import { Pie, PieChart } from 'recharts'

const chartConfig = {
    revenue: {
        label: 'Revenue',
    },
} satisfies ChartConfig

export default function DailyRevenueStatsCard2({
    pieChartData,
    className,
}: {
    pieChartData: DailyRevenueChartData[]
}) {
    console.log(pieChartData)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Revenue By Day</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto min-h-[200px]"
                >
                    <PieChart>
                        <Pie data={pieChartData} dataKey="revenue" />
                        <ChartLegend
                            content={<ChartLegendContent nameKey="day" />}
                            className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
