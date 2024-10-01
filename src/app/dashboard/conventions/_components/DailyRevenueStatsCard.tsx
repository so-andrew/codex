'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { type ChartData } from '@/types'
import { ArcElement, Chart as ChartJS, Colors, Legend, Tooltip } from 'chart.js'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, Colors)

export default function DailyRevenueStatsCard({
    pieChartData,
    className,
}: {
    pieChartData: ChartData
    className?: string
}) {
    return (
        <div className={cn('flex max-sm:grow h-auto space-x-4', className)}>
            <Card className="flex flex-col justify-start max-sm:w-full">
                <CardHeader>
                    <CardTitle className="text-lg">Revenue By Day</CardTitle>
                </CardHeader>
                <CardContent className="h-full">
                    <Pie
                        data={pieChartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            layout: {
                                padding: { left: 10, right: 10 },
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
                                            if (context.parsed !== null) {
                                                label += new Intl.NumberFormat(
                                                    'en-US',
                                                    {
                                                        style: 'currency',
                                                        currency: 'USD',
                                                    },
                                                ).format(context.parsed)
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
