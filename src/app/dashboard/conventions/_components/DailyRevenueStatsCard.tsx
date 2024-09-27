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
        <div className={cn('flex grow h-auto space-x-4', className)}>
            <Card className="w-fit flex flex-col justify-start">
                <CardHeader>
                    <CardTitle className="text-lg">Revenue By Day</CardTitle>
                </CardHeader>
                <CardContent>
                    <Pie
                        data={pieChartData}
                        options={{
                            responsive: true,
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
