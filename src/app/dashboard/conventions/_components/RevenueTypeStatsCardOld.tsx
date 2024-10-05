'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { type ChartData } from '@/types'
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Colors,
    Legend,
    LinearScale,
    Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
    Colors,
)

export default function RevenueTypeStatsCardOld({
    barChartData,
    className,
}: {
    barChartData: ChartData
    className?: string
}) {
    return (
        <div
            className={cn(
                'flex max-sm:grow max-sm:h-auto space-x-4',
                className,
            )}
        >
            <Card className="flex flex-col w-full">
                <CardHeader>
                    <CardTitle className="text-lg">Revenue By Type</CardTitle>
                </CardHeader>
                <CardContent className="relative flex-1">
                    <Bar
                        data={barChartData}
                        options={{
                            indexAxis: 'y',
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                x: {
                                    stacked: true,
                                },
                                y: {
                                    stacked: true,
                                },
                            },
                            plugins: {
                                legend: { position: 'bottom' },
                                tooltip: {
                                    callbacks: {
                                        label: function (context) {
                                            let label =
                                                context.dataset.label ?? ''

                                            if (label) {
                                                label += ': '
                                            }
                                            if (context.parsed.x !== null) {
                                                label += new Intl.NumberFormat(
                                                    'en-US',
                                                    {
                                                        style: 'currency',
                                                        currency: 'USD',
                                                    },
                                                ).format(context.parsed.x)
                                            }
                                            return label
                                        },
                                    },
                                },
                            },
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
