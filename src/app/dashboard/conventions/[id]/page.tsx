import EditConvention from '@/app/_components/EditConvention'
import { FormStoreProvider } from '@/app/providers/form-store-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import {
    getConventionById,
    getConventionReports,
    getConventionRevenue,
    getTopSellingVariations,
} from '@/server/queries'
import {
    type ChartData,
    type Dataset,
    type ProductsByCategory,
    type ReportsByProduct,
} from '@/types'
import { eachDayOfInterval } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { Info } from 'lucide-react'
import { type Metadata, type ResolvingMetadata } from 'next'
import { redirect } from 'next/navigation'
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
        redirect('/dashboard/conventions')
    }

    const reports = await getConventionReports(conventionId)
    const { itemizedRevenue, totalRevenue, revenueByCategory } =
        await getConventionRevenue(conventionId)

    //console.log(revenueByCategory)
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

    const dataset: Dataset = {
        label: 'Total Revenue',
        data: Object.values(revenueByDay),
        //backgroundColor: daysInRange.map(() => getColor(1)),
    }

    const pieChartData: ChartData = {
        labels: daysInRange.map((date) =>
            formatInTimeZone(date, timeZone, 'EEE, MMM d'),
        ),
        datasets: [dataset],
    }

    const barChartData: ChartData = {
        labels: daysInRange.map((date) =>
            formatInTimeZone(date, timeZone, 'EEE, MMM d'),
        ),
        datasets: [
            { label: 'Cash Sales', data: revenueByType.cashRevenue },
            { label: 'Card Sales', data: revenueByType.cardRevenue },
        ],
    }

    //console.log(barChartData)

    const query = await getTopSellingVariations(conventionId)
    //console.log('query', query)

    const totalRevenueString = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(totalRevenue)

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
                                    {convention.name}
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
                                    <span className="text-2xl font-bold">
                                        {totalRevenueString}
                                    </span>
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
                            <ProductSalesStatsCard data={query} />
                            <DailyRevenueStatsCard
                                pieChartData={pieChartData}
                                className="max-sm:h-full max-sm:w-full"
                            />
                            <RevenueTypeStatsCard
                                barChartData={barChartData}
                                className="max-sm:h-full max-sm:w-full"
                            />
                        </StatsCarousel>
                        <div className="px-6 mt-4 hidden sm:flex flex-row flex-wrap justify-start gap-4">
                            <ProductSalesStatsCard data={query} />
                            <DailyRevenueStatsCard
                                pieChartData={pieChartData}
                            />
                            <RevenueTypeStatsCard barChartData={barChartData} />
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
                />
            </section>
        </FormStoreProvider>
    )
}
