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
        color: 'hsl(var(--chart-2))',
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
    console.log(chartData)

    return (
        <Card className="h-full">
            <CardHeader className="space-y-1">
                <CardTitle className="text-lg">Payment Types</CardTitle>
                <CardDescription className="leading-none">
                    Based on gross sales
                </CardDescription>
            </CardHeader>
            <CardContent>
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
                            content={<ChartTooltipContent hideLabel />}
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
                <div className="flex flex-col justify-around mt-4 gap-1">
                    <div className="flex flex-row justify-between gap-2">
                        <div className="flex flex-row gap-3 items-center">
                            <div className="w-3 h-3 rounded-sm shrink-0 bg-[hsl(var(--chart-1))]" />
                            <h2 className="text-gray-500">Cash</h2>
                        </div>
                        <span className="font-semibold">
                            {moneyFormat.format(cashRevenue)}
                        </span>
                    </div>
                    <div className="flex flex-row justify-between gap-2">
                        <div className="flex flex-row gap-3 items-center">
                            <div className="w-3 h-3 rounded-sm shrink-0 bg-[hsl(var(--chart-2))]" />
                            <h2 className="text-gray-500">Card</h2>
                        </div>
                        <span className="font-semibold">
                            {moneyFormat.format(cardRevenue)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
