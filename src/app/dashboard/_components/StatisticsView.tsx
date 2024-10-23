'use client'

import { DateRangePicker } from '@/app/_components/DateRangePicker'
import { useDatePickerStore } from '@/app/providers/date-picker-store-provider'
import { type DashboardRevenueData } from '@/types'
import PaymentTypeStatsCard from './PaymentTypeStatsCard'
import PeriodRevenueStatsCard from './PeriodRevenueStatsCard'

export default function StatisticsView({
    data,
}: {
    data: DashboardRevenueData
}) {
    const { dateRange } = useDatePickerStore((state) => state)

    // const displayDateString = dateRange?.from
    //     ? dateRange.to
    //         ? `${format(dateRange.from, 'LLL dd, y')} - ${format(dateRange.to, 'LLL dd, y')}`
    //         : format(dateRange.from, 'LLL dd, y')
    //     : ''

    return (
        <div className="flex flex-col gap-6">
            <DateRangePicker />
            {/* <h2>{displayDateString}</h2> */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4 items-stretch">
                <div className="lg:col-span-2">
                    <PeriodRevenueStatsCard
                        revenue={data.totalRevenueByType.totalRevenue}
                        discounts={
                            data.totalDiscountsByType.totalDiscountAmount
                        }
                        previousRevenue={
                            data.previousRevenueByType.totalRevenue
                        }
                        previousDiscounts={
                            data.previousDiscountsByType.totalDiscountAmount
                        }
                        previousInterval={data.previousInterval}
                    />
                </div>
                {/* <div className="col-span-3 row-span-1">
                    <MonthlyRevenueStatsCard data={data.monthRevenueArray} />
                </div> */}
                <div className="lg:col-span-2">
                    <PaymentTypeStatsCard
                        cashRevenue={data.totalRevenueByType.cashRevenue}
                        cardRevenue={data.totalRevenueByType.cardRevenue}
                    />
                </div>
            </div>
        </div>
    )
}
