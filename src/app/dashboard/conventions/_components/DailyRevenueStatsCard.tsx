'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import { type Config, type DailyRevenueChartData } from '@/types'
import { Pie, PieChart } from 'recharts'

const chartConfig = (pieChartData: DailyRevenueChartData[]) => {
    const config: Config = {
        revenue: { label: 'Revenue' },
    } satisfies ChartConfig
    for (const data of pieChartData) {
        config[data.key] = { label: data.day, fill: data.fill }
    }
    return config
}

export default function DailyRevenueStatsCard({
    data,
}: {
    data: DailyRevenueChartData[]
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Revenue By Day</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                <ChartContainer
                    config={chartConfig(data)}
                    className="mx-auto max-sm:min-h-[325px] min-h-[200px] w-full"
                >
                    <PieChart>
                        <Pie data={data} dataKey="revenue" innerRadius={40} />
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
