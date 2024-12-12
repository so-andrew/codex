import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn, moneyFormat } from '@/lib/utils'
import {
    addDays,
    format,
    formatDuration,
    interval,
    type Interval,
    intervalToDuration,
    isEqual,
} from 'date-fns'
import { ArrowBigDown, ArrowBigUp, Slash } from 'lucide-react'

const neutralClass = 'bg-gray-200 text-gray-600 hover:bg-gray-200'
const increaseClass = 'bg-green-200 text-green-600 hover:bg-green-200'
const decreaseClass = 'bg-red-200 text-red-600 hover:bg-red-200'

export default function PeriodRevenueStatsCard({
    revenue,
    discounts,
    previousRevenue,
    previousDiscounts,
    previousInterval,
}: {
    revenue: number
    discounts: number
    previousRevenue: number
    previousDiscounts: number
    previousInterval: Interval
}) {
    // Percent change calculations
    const netSales = revenue - discounts
    const previousNet = previousRevenue - previousDiscounts
    const percentNetChange = (netSales - previousNet) / previousNet
    const percentGrossChange = (revenue - previousRevenue) / previousRevenue

    const netBadgeClass = `${isFinite(percentNetChange) ? (percentNetChange > 0 ? increaseClass : percentNetChange < 0 ? decreaseClass : neutralClass) : neutralClass}`
    const grossBadgeClass = `${isFinite(percentNetChange) ? (percentNetChange > 0 ? increaseClass : percentNetChange < 0 ? decreaseClass : neutralClass) : neutralClass}`

    const inclusiveInterval = interval(
        previousInterval.start,
        addDays(previousInterval.end, 1),
    )

    // // Interval length display
    // console.log(
    //     JSON.stringify(previousInterval),
    //     intervalToDuration(inclusiveInterval).days,
    // )

    const previousString = intervalToDuration(previousInterval).days
        ? formatDuration(intervalToDuration(inclusiveInterval), {
              format: ['years', 'months', 'weeks', 'days'],
              delimiter: ', ',
          })
        : format(previousInterval?.start, 'EEEE')

    const previousDayString = previousInterval?.start
        ? previousInterval.end
            ? isEqual(previousInterval.start, previousInterval.end)
                ? format(previousInterval.start, 'LLL dd')
                : `${format(previousInterval.start, 'LLL dd')} - ${format(previousInterval.end, 'LLL dd')}`
            : format(previousInterval.start, 'LLL dd')
        : ''

    return (
        <Card className="h-full">
            <CardHeader className="space-y-1">
                <CardTitle className="text-lg">Key Metrics</CardTitle>
                {previousString && (
                    <CardDescription className="leading-none">
                        {`vs. previous ${previousString}`}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent>
                <div className="flex flex-col justify-around gap-4">
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex flex-col gap-0">
                            <h2 className="text-gray-500">Gross Sales</h2>
                            <span className="font-semibold">
                                {moneyFormat.format(revenue)}
                            </span>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Badge
                                        className={cn(
                                            grossBadgeClass,
                                            'flex flex-row gap-1 font-semibold text-sm h-fit py-1 rounded-lg',
                                        )}
                                    >
                                        <div>
                                            {isFinite(percentGrossChange) ? (
                                                percentGrossChange > 0 ? (
                                                    <ArrowBigUp />
                                                ) : percentGrossChange < 0 ? (
                                                    <ArrowBigDown />
                                                ) : (
                                                    <Slash size={8} />
                                                )
                                            ) : (
                                                <ArrowBigUp />
                                            )}
                                        </div>
                                        <div>
                                            {isFinite(percentGrossChange)
                                                ? percentGrossChange.toLocaleString(
                                                      undefined,
                                                      {
                                                          style: 'percent',
                                                          minimumFractionDigits: 2,
                                                      },
                                                  )
                                                : 'N/A'}
                                        </div>
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent className="p-4 mb-2">
                                    <h2 className="text-base font-semibold">
                                        Vs. previous period
                                    </h2>
                                    <p className="text-sm">
                                        {previousDayString}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex flex-col gap-0">
                            <h2 className="text-gray-500">Net Sales</h2>
                            <span className="font-semibold">
                                {moneyFormat.format(netSales)}
                            </span>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Badge
                                        className={cn(
                                            netBadgeClass,
                                            'flex flex-row gap-1 font-semibold text-sm h-fit py-1 rounded-lg',
                                        )}
                                    >
                                        <div>
                                            {isFinite(percentNetChange) ? (
                                                percentNetChange > 0 ? (
                                                    <ArrowBigUp />
                                                ) : percentNetChange < 0 ? (
                                                    <ArrowBigDown />
                                                ) : (
                                                    <Slash size={8} />
                                                )
                                            ) : (
                                                <ArrowBigUp />
                                            )}
                                        </div>
                                        <div>
                                            {isFinite(percentNetChange)
                                                ? percentNetChange.toLocaleString(
                                                      undefined,
                                                      {
                                                          style: 'percent',
                                                          minimumFractionDigits: 2,
                                                      },
                                                  )
                                                : 'N/A'}
                                        </div>
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent className="p-4 mb-2">
                                    <h2 className="text-base font-semibold">
                                        Vs. previous period
                                    </h2>
                                    <p className="text-sm">
                                        {previousDayString}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
