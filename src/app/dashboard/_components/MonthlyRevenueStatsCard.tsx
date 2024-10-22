'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import { type Config, type MonthlyRevenueChartData } from '@/types'
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts'

const chartConfig = (lineChartData: MonthlyRevenueChartData[]) => {
    const config: Config = {
        revenue: { label: 'Revenue' },
    } satisfies ChartConfig
    // for (const data of lineChartData) {
    //     config[data.month] = { label: data.month, fill: data.fill }
    // }
    return config
}

export default function MonthlyRevenueStatsCard({
    data,
}: {
    data: MonthlyRevenueChartData[]
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Revenue By Month</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                <ChartContainer
                    config={chartConfig(data)}
                    className="mx-auto max-sm:min-h-[325px] min-h-[200px] w-full"
                >
                    <LineChart
                        accessibilityLayer
                        data={data}
                        margin={{ left: 12, right: 12 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            //tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Line
                            dataKey="revenue"
                            type="natural"
                            //stroke="var(--chart-1)"
                            //dot={{ fill: 'var(--chart-1)' }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
