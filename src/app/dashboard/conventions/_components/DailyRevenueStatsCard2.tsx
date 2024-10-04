'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import { type DailyRevenueChartData } from '@/types'
import { Pie, PieChart } from 'recharts'

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
type config = {
    [x: string]: {
        label: string
        fill?: string
    }
}

const chartConfig = (pieChartData: DailyRevenueChartData[]) => {
    const config: config = { revenue: { label: 'Revenue' } }
    for (const data of pieChartData) {
        config[data.key] = { label: data.day, fill: data.fill }
    }
    return config
}

// const chartConfig = {
//     revenue: {
//         label: 'Revenue',
//     },
//     day1: {
//         label: 'Day 1',
//         color: 'hsl(var(--chart-1))',
//     },
//     day2: {
//         label: 'Day 2',
//         color: 'hsl(var(--chart-2))',
//     },
//     day3: {
//         label: 'Day 3',
//         color: 'hsl(var(--chart-3))',
//     },
// } satisfies ChartConfig

export default function DailyRevenueStatsCard2({
    pieChartData,
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
                    config={chartConfig(pieChartData)}
                    className="mx-auto min-h-[200px] w-full"
                >
                    <PieChart>
                        <Pie data={pieChartData} dataKey="revenue" />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent nameKey="key" />}
                        />
                        <ChartLegend
                            content={<ChartLegendContent nameKey="key" />}
                            className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
