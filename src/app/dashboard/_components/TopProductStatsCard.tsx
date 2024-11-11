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
import { moneyFormat } from '@/lib/utils'
import { type ProductRevenue } from '@/types'
import { Bar, BarChart, Cell } from 'recharts'

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
                    <ChartContainer config={chartConfig} className="min-h-16">
                        <BarChart
                            accessibilityLayer
                            data={data}
                            margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                        >
                            <ChartTooltip
                                content={<ChartTooltipContent hideLabel />}
                            />
                            {/* <XAxis type="category" tick={false} /> */}
                            {/* <YAxis type="number" unit="$" /> */}
                            <Bar dataKey="revenue">
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={
                                            index === 0
                                                ? 'hsl(var(--chart-blue-3))'
                                                : index === data.length - 1
                                                  ? 'hsl(var(--chart-blue-1))'
                                                  : 'hsl(var(--chart-blue-5))'
                                        }
                                        radius={5}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="text-gray-500 text-center py-12">
                        No data for selected period
                    </div>
                )}
                {data?.length > 0 && (
                    <div className="flex flex-col mt-4 gap-1 mx-2">
                        <div className="flex flex-row justify-between gap-2">
                            <div className="flex flex-row gap-3 items-center">
                                <div className="w-3 h-3 rounded-sm shrink-0 bg-[hsl(var(--chart-blue-1))]" />
                                <span className="text-gray-500">
                                    {data.slice(-1)[0]?.name}
                                </span>
                            </div>
                            <div className="flex flex-row gap-2 font-semibold">
                                {moneyFormat.format(
                                    Number(data.slice(-1)[0]?.revenue),
                                )}
                                <div className="text-gray-500 font-light">{`(${data.slice(-1)[0]?.sales})`}</div>
                            </div>
                        </div>
                        <div className="flex flex-row justify-between gap-2">
                            <div className="flex flex-row gap-3 items-center">
                                <div className="w-3 h-3 rounded-sm shrink-0 bg-[hsl(var(--chart-blue-3))]" />
                                <span className="text-gray-500">
                                    {data[0]?.name}
                                </span>
                            </div>
                            <div className="flex flex-row gap-2 font-semibold">
                                {moneyFormat.format(Number(data[0]?.revenue))}
                                <div className="text-gray-500 font-light">{`(${data[0]?.sales})`}</div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
