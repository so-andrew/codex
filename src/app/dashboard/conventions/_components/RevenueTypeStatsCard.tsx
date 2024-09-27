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
        <div
            className={cn(
                'flex max-sm:grow max-sm:h-auto space-x-4',
                className,
            )}
        >
            <Card className="flex flex-col justify-start">
                <CardHeader>
                    <CardTitle className="text-lg">Revenue By Type</CardTitle>
                </CardHeader>
                <CardContent>
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
                    />
                </CardContent>
            </Card>
        </div>
    )
}
