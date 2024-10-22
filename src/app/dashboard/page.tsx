'use client'
import { Button } from '@/components/ui/button'
import { DashboardRevenueData, MonthlyRevenueChartData } from '@/types'
import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { getRevenueDateRange } from '../actions'
import { useDatePickerStore } from '../providers/date-picker-store-provider'
import StatisticsView from './_components/StatisticsView'

export default function Dashboard() {
    const user = useUser().user
    const { dateRange, setDateRange } = useDatePickerStore((state) => state)
    const [data, setData] = useState<DashboardRevenueData>({
        monthRevenueArray: [] as MonthlyRevenueChartData[],
        monthDiscountArray: {} as Map<string, number>,
        totalRevenue: 0,
        totalDiscounts: 0,
        previousRevenue: 0,
        previousDiscounts: 0,
    })

    useEffect(() => {
        const updateData = async () => {
            if (dateRange) {
                const {
                    monthRevenueMap,
                    monthDiscountMap,
                    totalRevenue,
                    totalDiscounts,
                    previousTotalRevenue,
                    previousTotalDiscounts,
                } = await getRevenueDateRange({
                    start: dateRange.from ?? new Date(),
                    end: dateRange.to,
                })
                console.log(
                    'rev:',
                    monthRevenueMap,
                    'disc:',
                    monthDiscountMap,
                    'total rev:',
                    totalRevenue,
                    'total disc:',
                    totalDiscounts,
                    'prev rev:',
                    previousTotalRevenue,
                    'prev disc:',
                    previousTotalDiscounts,
                )
                const dataArray = Array.from(monthRevenueMap.entries()).map(
                    (entry, index) => {
                        return {
                            month: entry[0],
                            revenue: entry[1],
                            //fill: `hsl(var(--chart-${index + 1}))`,
                        }
                    },
                ) as MonthlyRevenueChartData[]
                //setMonthlyRevenueChartData(dataArray)
                setData({
                    monthRevenueArray: dataArray,
                    monthDiscountArray: monthDiscountMap,
                    totalRevenue: totalRevenue,
                    totalDiscounts: totalDiscounts,
                    previousRevenue: previousTotalRevenue,
                    previousDiscounts: previousTotalDiscounts,
                })
            }
        }
        updateData().catch((error) => {
            console.error(error)
        })
    }, [dateRange])

    //const test = await getMonthlyRevenue()
    //console.log(test)

    // useEffect(() => {
    //     console.log(data)
    //     const dataArray = Array.from(data.entries()).map((entry, index) => {
    //         return {
    //             month: entry[0],
    //             revenue: entry[1],
    //             //fill: `hsl(var(--chart-${index + 1}))`,
    //         }
    //     }) as MonthlyRevenueChartData[]
    //     setMonthlyRevenueChartData(dataArray)
    // }, [data])

    return (
        <section className="3xl:px-0 mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4 lg:px-20">
            <h1 className="text-2xl font-semibold">{`Welcome back, ${user?.firstName}.`}</h1>
            <div className="border-b pb-8">
                <div className="flex flex-row gap-6">
                    <Button className="">Add Convention</Button>
                    <Button variant="secondary">Add Product</Button>
                </div>
            </div>
            <section>
                <StatisticsView data={data} />
            </section>
        </section>
    )
}
