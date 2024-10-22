'use client'

import { DateRangePicker } from '@/app/_components/DateRangePicker'
import { useDatePickerStore } from '@/app/providers/date-picker-store-provider'
import { DashboardRevenueData } from '@/types'
import { format } from 'date-fns'
import PeriodRevenueStatsCard from './PeriodRevenueStatsCard'

export default function StatisticsView({
    data,
}: {
    data: DashboardRevenueData
}) {
    const { dateRange } = useDatePickerStore((state) => state)

    const displayDateString = dateRange?.from
        ? dateRange.to
            ? `${format(dateRange.from, 'LLL dd, y')} - ${format(dateRange.to, 'LLL dd, y')}`
            : format(dateRange.from, 'LLL dd, y')
        : ''

    return (
        <div className="flex flex-col gap-6">
            <DateRangePicker />
            <h2>{displayDateString}</h2>
            <div className="grid grid-cols-6 grid-flow-row gap-4">
                <div className="col-span-2 row-span-1">
                    <PeriodRevenueStatsCard
                        revenue={data.totalRevenue}
                        discounts={data.totalDiscounts}
                        previousRevenue={data.previousRevenue}
                        previousDiscounts={data.previousDiscounts}
                    />
                </div>
                {/* <div className="col-span-3 row-span-1">
                    <MonthlyRevenueStatsCard data={data.monthRevenueArray} />
                </div> */}
            </div>
        </div>
    )
}
