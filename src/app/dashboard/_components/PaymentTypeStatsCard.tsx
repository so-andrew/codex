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
import { Bar, BarChart, XAxis, YAxis } from 'recharts'

const chartConfig = {
    cash: {
        label: 'Cash',
        color: 'hsl(var(--chart-1))',
    },
    card: {
        label: 'Card',
        color: 'hsl(var(--chart-blue-1))',
    },
} satisfies ChartConfig

export default function PaymentTypeStatsCard({
    cashRevenue,
    cardRevenue,
}: {
    cashRevenue: number
    cardRevenue: number
}) {
    const chartData = [{ cash: cashRevenue, card: cardRevenue }]
    const cashPercent = cashRevenue / (cashRevenue + cardRevenue)
    const cardPercent = cardRevenue / (cashRevenue + cardRevenue)

    return (
        <Card className="h-full">
            <CardHeader className="space-y-1">
                <CardTitle className="text-lg">Payment Types</CardTitle>
                <CardDescription className="leading-none">
                    Based on gross sales
                </CardDescription>
            </CardHeader>
            <CardContent>
                {cashRevenue > 0 && cardRevenue > 0 ? (
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-auto h-8"
                    >
                        <BarChart
                            accessibilityLayer
                            data={chartData}
                            layout="vertical"
                            barSize={30}
                            stackOffset="expand"
                            margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                        >
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        hideLabel
                                        formatter={(value, name) => (
                                            <div className="flex gap-2 w-full items-center">
                                                <div
                                                    className={`h-2.5 w-2.5 shrink-0 rounded-[2px] ${name === 'card' ? 'bg-[--color-card]' : 'bg-[--color-cash]'}`}
                                                    style={
                                                        {
                                                            '--color-bg': `var(--color-${name}),`,
                                                        } as React.CSSProperties
                                                    }
                                                />
                                                <div className="flex flex-row w-full justify-between">
                                                    <div className="text-muted-foreground">
                                                        {chartConfig[
                                                            name as keyof typeof chartConfig
                                                        ]?.label || name}
                                                    </div>
                                                    <div className="font-mono">
                                                        {`\$${value as string}`}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    />
                                }
                            />
                            {/* <ChartLegend content={<ChartLegendContent />} /> */}
                            <XAxis type="number" hide />
                            <YAxis type="category" hide />
                            <Bar
                                dataKey="cash"
                                stackId="a"
                                fill="var(--color-cash)"
                                radius={[5, 0, 0, 5]}
                            />
                            <Bar
                                dataKey="card"
                                stackId="a"
                                fill="var(--color-card)"
                                radius={[0, 5, 5, 0]}
                            />
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="h-8 text-gray-500 text-center">
                        No data for selected period
                    </div>
                )}
                <div className="flex flex-col justify-around mt-4 gap-1">
                    <div className="flex flex-row justify-between gap-2">
                        <div className="flex flex-row gap-3 items-center">
                            <div className="w-3 h-3 rounded-sm shrink-0 bg-[hsl(var(--chart-1))]" />
                            <h2 className="text-gray-500">Cash</h2>
                        </div>

                        <span className="font-semibold">
                            {moneyFormat.format(cashRevenue)}
                            <span className="text-gray-500 font-light">
                                {isFinite(cashPercent)
                                    ? ` (${cashPercent.toLocaleString(
                                          undefined,
                                          {
                                              style: 'percent',
                                              maximumFractionDigits: 2,
                                          },
                                      )})`
                                    : ''}
                            </span>
                        </span>
                    </div>
                    <div className="flex flex-row justify-between gap-2">
                        <div className="flex flex-row gap-3 items-center">
                            <div className="w-3 h-3 rounded-sm shrink-0 bg-[hsl(var(--chart-blue-1))]" />
                            <h2 className="text-gray-500">Card</h2>
                        </div>

                        <span className="font-semibold">
                            {moneyFormat.format(cardRevenue)}
                            <span className="text-gray-500 font-light">
                                {isFinite(cardPercent)
                                    ? ` (${cardPercent.toLocaleString(
                                          undefined,
                                          {
                                              style: 'percent',
                                              maximumFractionDigits: 2,
                                          },
                                      )})`
                                    : ''}
                            </span>
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
