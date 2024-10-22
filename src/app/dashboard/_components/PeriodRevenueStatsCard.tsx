import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { moneyFormat } from '@/lib/utils'
import { ArrowBigDown, ArrowBigUp, Slash } from 'lucide-react'

export default function PeriodRevenueStatsCard({
    revenue,
    discounts,
    previousRevenue,
    previousDiscounts,
}: {
    revenue: number
    discounts: number
    previousRevenue: number
    previousDiscounts: number
}) {
    const netSales = revenue - discounts
    const previousNet = previousRevenue - previousDiscounts
    const percentChange = (netSales - previousNet) / previousNet
    console.log(percentChange)
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-gray-500">Net Sales</h2>
                        <span className="font-semibold">
                            {moneyFormat.format(netSales)}
                        </span>
                    </div>
                    {isFinite(percentChange) && (
                        <Badge
                            className={`${percentChange === 0 ? 'bg-gray-200 text-gray-600 hover:bg-gray-200' : percentChange > 0 ? 'bg-green-200 text-green-600 hover:bg-green-200' : 'bg-red-200 text-red-600 hover:bg-red-200'} flex flex-row gap-1 font-semibold`}
                        >
                            <div>
                                {percentChange > 0 && <ArrowBigUp />}
                                {percentChange < 0 && <ArrowBigDown />}
                                {percentChange == 0 && <Slash size={8} />}
                            </div>
                            <div>
                                {percentChange.toLocaleString(undefined, {
                                    style: 'percent',
                                    minimumFractionDigits: 2,
                                })}
                            </div>
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
