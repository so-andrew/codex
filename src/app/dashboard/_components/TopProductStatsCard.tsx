import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import { type ProductRevenue } from '@/types'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'

const chartConfig = {
    revenue: {
        label: 'Revenue',
        color: 'hsl(var(--chart-1))',
    },
} satisfies ChartConfig

export default function TopProductStatsCard({
    data,
}: {
    data: ProductRevenue[]
}) {
    console.log(data)
    return (
        <Card className="h-full">
            <CardHeader className="space-y-1">
                <CardTitle className="text-lg">Top Selling Products</CardTitle>
                <CardDescription className="leading-none">
                    Based on gross sales
                </CardDescription>
            </CardHeader>
            <CardContent>
                {data?.length ? (
                    <ChartContainer config={chartConfig}>
                        <BarChart
                            accessibilityLayer
                            data={data}
                            margin={{ top: 0, bottom: 0, left: -20, right: 0 }}
                        >
                            <ChartTooltip
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <XAxis type="category" tick={false} />
                            <YAxis type="number" unit="$" />
                            <Bar
                                dataKey="revenue"
                                fill="var(--color-revenue)"
                            />
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="text-gray-500 text-center py-12">
                        No data for selected period
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
