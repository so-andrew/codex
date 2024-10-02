'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { type ChartData } from '@/types'
import { ArcElement, Chart as ChartJS, Colors, Legend, Tooltip } from 'chart.js'
import { useEffect, useRef } from 'react'
import { Pie } from 'react-chartjs-2'
import { useMediaQuery } from 'usehooks-ts'

ChartJS.register(ArcElement, Tooltip, Legend, Colors)

export default function DailyRevenueStatsCard({
    pieChartData,
    className,
}: {
    pieChartData: ChartData
    className?: string
}) {
    const isDesktop = useMediaQuery('(min-width:1280px)', {
        initializeWithValue: false,
    })

    const legendPositionRef = useRef('bottom')

    useEffect(() => {
        legendPositionRef.current = isDesktop ? 'bottom' : 'right'
    }, [isDesktop])

    console.log(pieChartData)

    return (
        <div className={cn('flex max-sm:grow h-auto space-x-4', className)}>
            <Card className="flex flex-col w-full">
                <CardHeader>
                    <CardTitle className="text-lg">Revenue By Day</CardTitle>
                </CardHeader>
                <CardContent className="relative flex-1">
                    <Pie
                        data={pieChartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            layout: {
                                padding: { left: 10, right: 10 },
                            },
                            plugins: {
                                legend: {
                                    position:
                                        legendPositionRef.current as never,
                                },
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
