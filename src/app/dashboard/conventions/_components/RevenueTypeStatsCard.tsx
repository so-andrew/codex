'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import { type RevenueTypeChartData } from '@/types'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

// const chartConfig = (pieChartData: RevenueTypeChartData[]) => {
//     const config: Config = {
//         cardRenue: { label: 'Card' },
//     } satisfies ChartConfig
//     for (const data of pieChartData) {
//         config[data.key] = { label: data.day, fill: data.fill }
//     }
//     return config
// }

const chartConfig = {
    cashRevenue: {
        label: 'Cash',
        color: 'hsl(var(--chart-1))',
    },
    cardRevenue: {
        label: 'Card',
        color: 'hsl(var(--chart-2))',
    },
} satisfies ChartConfig

export default function RevenueTypeStatsCard({
    data,
}: {
    data: RevenueTypeChartData[]
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Revenue By Type</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto max-sm:min-h-[325px] min-h-[150px] w-full"
                >
                    <BarChart accessibilityLayer data={data}>
                        <CartesianGrid vertical={false} />
                        <XAxis type="category" dataKey="day" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar
                            dataKey="cashRevenue"
                            //stackId="a"
                            fill="var(--color-cashRevenue)"
                            radius={4}
                        />
                        <Bar
                            dataKey="cardRevenue"
                            //stackId="a"
                            fill="var(--color-cardRevenue)"
                            radius={4}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
