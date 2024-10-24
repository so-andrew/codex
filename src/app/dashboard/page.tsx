'use client'
import { Button } from '@/components/ui/button'
import {
    type DashboardRevenueData,
    type MonthlyRevenueChartData,
    type ProductRevenue,
    type TotalDiscountsByType,
    type TotalRevenueByType,
} from '@/types'
import { useUser } from '@clerk/nextjs'
import { interval } from 'date-fns'
import { useEffect, useState } from 'react'
import { getRevenueDateRange } from '../actions'
import { useDatePickerStore } from '../providers/date-picker-store-provider'
import StatisticsView from './_components/StatisticsView'

const initialRevenueByType: TotalRevenueByType = {
    cashRevenue: 0,
    cardRevenue: 0,
    totalRevenue: 0,
}

const initialDiscountsByType: TotalDiscountsByType = {
    cashDiscountAmount: 0,
    cardDiscountAmount: 0,
    totalDiscountAmount: 0,
}

export default function Dashboard() {
    const { user } = useUser()
    const { dateRange } = useDatePickerStore((state) => state)
    const [data, setData] = useState<DashboardRevenueData>({
        monthRevenueArray: [] as MonthlyRevenueChartData[],
        monthDiscountArray: {} as Map<string, number>,
        totalRevenueByType: initialRevenueByType,
        totalDiscountsByType: initialDiscountsByType,
        previousRevenueByType: initialRevenueByType,
        previousDiscountsByType: initialDiscountsByType,
        previousInterval: interval(new Date(), new Date()),
        productRevenueMap: new Map<string, ProductRevenue>(),
    })

    useEffect(() => {
        const updateData = async () => {
            if (dateRange) {
                const {
                    monthRevenueMap,
                    monthDiscountMap,
                    totalRevenueByType,
                    totalDiscountsByType,
                    previousInterval,
                    previousRevenueByType,
                    previousDiscountsByType,
                    productRevenueMap,
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
                    totalRevenueByType.totalRevenue,
                    'total disc:',
                    totalDiscountsByType.totalDiscountAmount,
                    'prev rev:',
                    previousRevenueByType.totalRevenue,
                    'prev disc:',
                    previousDiscountsByType.totalDiscountAmount,
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
                setData({
                    monthRevenueArray: dataArray,
                    monthDiscountArray: monthDiscountMap,
                    totalRevenueByType: totalRevenueByType,
                    totalDiscountsByType: totalDiscountsByType,
                    previousRevenueByType: previousRevenueByType,
                    previousDiscountsByType: previousDiscountsByType,
                    previousInterval: previousInterval,
                    productRevenueMap: productRevenueMap,
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
            {user ? (
                <h1 className="text-2xl font-semibold">{`Welcome back, ${user?.firstName}.`}</h1>
            ) : (
                <h1 className="text-2xl font-semibold">Loading...</h1>
            )}
            <div className="border-b pb-8">
                <div className="flex flex-row gap-6">
                    <Button className="">Add Convention</Button>
                    <Button variant="secondary">Add Product</Button>
                </div>
            </div>
            <section className="mb-10">
                <StatisticsView data={data} />
            </section>
        </section>
    )
}
