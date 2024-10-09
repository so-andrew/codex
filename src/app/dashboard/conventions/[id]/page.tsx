import EditConvention from '@/app/_components/EditConvention'
import { FormStoreProvider } from '@/app/providers/form-store-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { moneyFormat } from '@/lib/utils'
import {
    getConventionById,
    getConventionDiscounts,
    getConventionDiscountStats,
    getConventionReports,
    getConventionRevenue,
    getTopSellingVariations,
} from '@/server/queries'
import {
    type DailyRevenueChartData,
    type ProductsByCategory,
    type ReportsByProduct,
    type RevenueTypeChartData,
} from '@/types'
import { eachDayOfInterval } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { Info } from 'lucide-react'
import { redirect } from 'next/navigation'
import { type Metadata, type ResolvingMetadata } from 'next/types'
import ConventionTabs from '../_components/ConventionTabs'
import DailyRevenueStatsCard from '../_components/DailyRevenueStatsCard'
import ProductSalesStatsCard from '../_components/ProductSalesStatsCard'
import RevenueTypeStatsCard from '../_components/RevenueTypeStatsCard'
import StatsCarousel from '../_components/StatsCarousel'

type Props = {
    params: { id: string }
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata,
): Promise<Metadata> {
    const id = parseInt(params.id)
    const convention = await getConventionById(id)

    return {
        title: convention ? `${convention.name} - Codex` : '',
    }
}

export default async function page({ params }: { params: { id: string } }) {
    const conventionId = parseInt(params.id)
    const convention = await getConventionById(conventionId)

    if (!convention) {
        return redirect('/dashboard/conventions')
    }

    const reports = await getConventionReports(conventionId)
    const discounts = await getConventionDiscounts(conventionId)

    //console.log('discounts:', discounts)
    const {
        itemizedRevenue,
        totalRevenue: grossRevenue,
        revenueByCategory,
    } = await getConventionRevenue(conventionId)

    const { discountsStats, totalDiscountAmount } =
        await getConventionDiscountStats(conventionId)

    // console.log('total disc:', totalDiscountAmount)
    //console.log('stats:', discountsStats)

    //console.log('itemized:', itemizedRevenue)
    //console.log('total:', totalRevenue)
    //console.log('rbc:', revenueByCategory)

    const revenueByDay: Record<string, number> = {}
    const revenueByType: {
        cashRevenue: number[]
        cardRevenue: number[]
    } = { cashRevenue: [], cardRevenue: [] }
    for (const [dateKey, value] of revenueByCategory) {
        revenueByDay[dateKey] = 0
        let dailyCashRevenue = 0
        let dailyCardRevenue = 0
        Object.values(value).forEach((value) => {
            revenueByDay[dateKey]! += value.totalRevenue
            dailyCashRevenue += value.cashRevenue
            dailyCardRevenue += value.cardRevenue
        })
        revenueByType.cashRevenue.push(dailyCashRevenue)
        revenueByType.cardRevenue.push(dailyCardRevenue)
    }

    //const datesInRange = await getConventionDateRange(conventionId)
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const daysInRange = eachDayOfInterval({
        start: convention.startDate,
        end: convention.endDate,
    })

    // const dataset: Dataset = {
    //     label: 'Total Revenue',
    //     data: Object.values(revenueByDay),
    //     //backgroundColor: daysInRange.map(() => getColor(1)),
    // }

    // const pieChartData: ChartData = {
    //     labels: daysInRange.map((date) =>
    //         formatInTimeZone(date, timeZone, 'EEE, MMM d'),
    //     ),
    //     datasets: [dataset],
    // }

    const pieChartData: DailyRevenueChartData[] = daysInRange.map(
        (date, index) => {
            return {
                key: `day${index + 1}`,
                day: formatInTimeZone(date, timeZone, 'EEEE'),
                revenue: Object.values(revenueByDay)[index]!,
                fill: `hsl(var(--chart-${index + 1}))`,
            }
        },
    )

    const barChartData: RevenueTypeChartData[] = daysInRange.map(
        (date, index) => {
            return {
                key: `day${index + 1}`,
                day: formatInTimeZone(date, timeZone, 'EEEE'),
                cashRevenue: revenueByType.cashRevenue[index]!,
                cardRevenue: revenueByType.cardRevenue[index]!,
                //fill: `hsl(var(--chart-${index + 1}))`,
            }
        },
    )

    // const barChartDataOld: ChartData = {
    //     labels: daysInRange.map((date) =>
    //         formatInTimeZone(date, timeZone, 'EEE, MMM d'),
    //     ),
    //     datasets: [
    //         { label: 'Cash Sales', data: revenueByType.cashRevenue },
    //         { label: 'Card Sales', data: revenueByType.cardRevenue },
    //     ],
    // }

    const productSalesData = await getTopSellingVariations(conventionId)

    const totalRevenueString = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(grossRevenue - totalDiscountAmount)

    const products: Record<number, ReportsByProduct> = {}
    reports.map((report) => {
        const productId = report.productId ?? -1
        if (!products[productId]) {
            const reportByProduct: ReportsByProduct = {
                productId: report.productId ?? -1,
                productName: report.productName,
                categoryId: report.categoryId ?? -1,
                categoryName: report.categoryName ?? 'Uncategorized',
                reports: [],
            }
            products[productId] = reportByProduct
        }
        products[productId].reports.push(report)
    })

    const categories: Record<number, ProductsByCategory> = {}
    Object.values(products).map((product) => {
        product.reports.sort((a, b) => a.id - b.id)
        if (!categories[product.categoryId]) {
            const productByCategory: ProductsByCategory = {
                categoryId: product.categoryId,
                categoryName: product.categoryName,
                products: [],
            }
            categories[product.categoryId] = productByCategory
        }
        categories[product.categoryId]?.products.push(product)
    })
    const categorizedData = Object.values(categories)

    const startDateString = convention
        ? formatInTimeZone(convention.startDate, timeZone, 'EEEE, MMM d, yyyy')
        : 'N/A'

    const endDateString = convention
        ? formatInTimeZone(convention.endDate, timeZone, 'EEEE, MMM d, yyyy')
        : 'N/A'

    return (
        <FormStoreProvider>
            <section className="3xl:px-0 mx-auto flex max-w-screen-2xl flex-col gap-4 lg:px-20">
                <Collapsible>
                    <div className="flex flex-row flex-wrap justify-start items-stretch gap-4 px-6">
                        <Card className="w-full md:w-fit">
                            <CardHeader>
                                <CardTitle className="flex flex-row gap-4 justify-between items-center text-2xl font-semibold">
                                    {convention?.name}
                                    {convention && (
                                        <EditConvention
                                            convention={convention}
                                        />
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <h2 className="text-lg text-gray-500">
                                    {convention?.location}
                                </h2>
                                <h2 className="text-lg text-gray-500">
                                    {startDateString} - {endDateString}
                                </h2>
                            </CardContent>
                        </Card>
                        <Card className="flex flex-row w-full justify-between md:flex-col items-end md:items-start md:w-fit">
                            <CardHeader>
                                <CardTitle className="flex flex-col">
                                    <span className="text-lg text-gray-500">
                                        Total Revenue
                                    </span>
                                    <HoverCard>
                                        <HoverCardTrigger>
                                            <span className="text-2xl font-bold">
                                                {totalRevenueString}
                                            </span>
                                        </HoverCardTrigger>
                                        <HoverCardContent className="flex flex-col gap-4 p-6">
                                            <h1 className="text-lg">Details</h1>
                                            <div className="rounded-md border">
                                                <Table>
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell className="font-medium text-gray-500">
                                                                Gross Revenue
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {moneyFormat.format(
                                                                    grossRevenue,
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className="font-medium text-gray-500">
                                                                Discounts
                                                            </TableCell>
                                                            <TableCell className="text-red-500 text-right">
                                                                -
                                                                {moneyFormat.format(
                                                                    totalDiscountAmount,
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow className="bg-gray-300/20">
                                                            <TableCell className="font-bold text-gray-500">
                                                                Total
                                                            </TableCell>
                                                            <TableCell className="font-bold text-right">
                                                                {moneyFormat.format(
                                                                    grossRevenue -
                                                                        totalDiscountAmount,
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </div>
                                            {/* <p className="font-normal">
                                                Gross Revenue:{' '}
                                                <span className="font-semibold">
                                                    {moneyFormat.format(
                                                        grossRevenue,
                                                    )}
                                                </span>
                                            </p>
                                            <p className="font-normal">
                                                Discounts:{' '}
                                                <span className="font-semibold">
                                                    {moneyFormat.format(
                                                        totalDiscountAmount,
                                                    )}
                                                </span>
                                            </p> */}
                                        </HoverCardContent>
                                    </HoverCard>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CollapsibleTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="flex flex-row gap-2 justify-center items-center px-2"
                                    >
                                        <Info />
                                        <span>More Stats</span>
                                    </Button>
                                </CollapsibleTrigger>
                            </CardContent>
                        </Card>
                    </div>

                    <CollapsibleContent>
                        <StatsCarousel className="sm:hidden mt-4">
                            <ProductSalesStatsCard data={productSalesData} />
                            <DailyRevenueStatsCard data={pieChartData} />
                            <RevenueTypeStatsCard data={barChartData} />
                        </StatsCarousel>
                        <div className="px-6 mt-4 hidden sm:grid grid-cols-6 grid-flow-row gap-4">
                            <div className="col-span-4 row-span-2">
                                <ProductSalesStatsCard
                                    data={productSalesData}
                                />
                            </div>
                            <div className="col-span-2">
                                <DailyRevenueStatsCard data={pieChartData} />
                            </div>
                            <div className="col-span-2">
                                <RevenueTypeStatsCard data={barChartData} />
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
                <div className="px-6">
                    <Separator />
                </div>
                <ConventionTabs
                    data={categorizedData}
                    range={daysInRange}
                    revenue={revenueByCategory}
                    discounts={discounts}
                />
            </section>
        </FormStoreProvider>
    )
}
