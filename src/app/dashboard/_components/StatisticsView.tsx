'use client'

import { DateRangePicker } from '@/app/_components/DateRangePicker'
import { useDatePickerStore } from '@/app/providers/date-picker-store-provider'
import { type DashboardRevenueData } from '@/types'
import { isBefore } from 'date-fns'
import ConventionsStatsCard from './ConventionsStatsCard'
import PaymentTypeStatsCard from './PaymentTypeStatsCard'
import PeriodRevenueStatsCard from './PeriodRevenueStatsCard'
import TopCategoryStatsCard from './TopCategoryStatsCard'
import TopProductStatsCard from './TopProductStatsCard'

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

    console.log(data.productRevenueMap)

    return (
        <div className="flex flex-col gap-6">
            <DateRangePicker />
            {/* <h2>{displayDateString}</h2> */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-6 2xl:grid-cols-8 gap-4 items-stretch">
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
                <div className="lg:col-span-2 lg:row-start-2">
                    <TopProductStatsCard
                        data={Array.from(data.productRevenueMap.values()).sort(
                            (a, b) => a.revenue - b.revenue,
                        )}
                    />
                </div>
                <div className="lg:col-span-2 lg:row-start-2">
                    <TopCategoryStatsCard
                        data={Array.from(data.categoryRevenueMap.values()).sort(
                            (a, b) => a.revenue - b.revenue,
                        )}
                    />
                </div>
                <div className="lg:col-span-2">
                    <ConventionsStatsCard
                        data={data.conventionsInPeriod.sort((a, b) =>
                            isBefore(a.startDate, b.startDate) ? -1 : 1,
                        )}
                    />
                </div>
            </div>
        </div>
    )
}
