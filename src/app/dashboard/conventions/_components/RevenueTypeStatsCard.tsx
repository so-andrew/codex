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

export default function RevenueTypeStatsCard({
    barChartData,
    className,
}: {
    barChartData: ChartData
    className?: string
}) {
    console.log(barChartData)
    return (
        <div className={cn('flex grow h-auto space-x-4', className)}>
            <Card className="flex flex-col justify-start">
                <CardHeader>
                    <CardTitle className="text-lg">Revenue By Type</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col justify-between gap-4">
                        <Bar
                            data={barChartData}
                            options={{
                                responsive: true,
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
                                },
                            }}
                            // style={{
                            //     position: 'relative',
                            //     //height: '100vh',
                            // }}
                        />
                        {/* <div>
                            {barChartData.labels.map((label, index) => {
                                const cashRevenue = moneyFormat.format(
                                    barChartData.datasets[0]!.data[index]!,
                                )
                                const cardRevenue = moneyFormat.format(
                                    barChartData.datasets[1]!.data[index]!,
                                )

                                return (
                                    <h2 key={index}>
                                        <span className="text-gray-500">
                                            {label}
                                        </span>
                                        <span className="font-semibold">
                                            {`${cashRevenue}, ${cardRevenue}`}
                                        </span>
                                    </h2>
                                )
                            })}
                        </div> */}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
