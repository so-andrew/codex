import EditConvention from '@/app/_components/EditConvention'
import ProductSalesTable from '@/app/_components/tables/ProductSalesTable'
import { FormStoreProvider } from '@/app/providers/form-store-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import {
    getConventionById,
    getConventionReports,
    getConventionRevenue,
    getTopSellingVariations,
} from '@/server/queries'
import { type ProductsByCategory, type ReportsByProduct } from '@/types'
import { CollapsibleContent } from '@radix-ui/react-collapsible'
import { eachDayOfInterval } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { Info } from 'lucide-react'
import { type Metadata, type ResolvingMetadata } from 'next'
import { redirect } from 'next/navigation'
import ConventionTabs from '../_components/ConventionTabs'

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

    // const revenueSortedByTotalSales = itemizedRevenue.sort(
    //     (a, b) => b.totalSales - a.totalSales,
    // )
    //console.log(revenueSortedByTotalSales)

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

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const daysInRange = eachDayOfInterval({
        start: convention.startDate,
        end: convention.endDate,
    })

    const startDateString = convention
        ? formatInTimeZone(convention.startDate, timeZone, 'EEEE, MMM d, yyyy')
        : 'N/A'

    const endDateString = convention
        ? formatInTimeZone(convention.endDate, timeZone, 'EEEE, MMM d, yyyy')
        : 'N/A'

    return (
        <FormStoreProvider>
            <section className="3xl:px-0 mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4 lg:px-20">
                <Collapsible>
                    <div className="flex flex-row justify-between">
                        <div className="flex flex-row justify-start items-end gap-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl font-semibold">
                                        {convention.name}
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
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle className="text-lg text-gray-500">
                                        Total Revenue
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-row justify-between items-center text-lg pr-6">
                                        <span className="text-2xl font-bold">
                                            {totalRevenueString}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="flex flex-col justify-between items-end pl-6">
                            {convention && (
                                <EditConvention convention={convention} />
                            )}
                            <CollapsibleTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="flex flex-row gap-4 justify-center items-center px-4 py-4"
                                >
                                    <Info />
                                    <span>More Stats</span>
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                    </div>
                    <CollapsibleContent>
                        <div className="flex w-full space-x-4 py-4">
                            <Card className="w-3/4">
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Top Selling Items
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ProductSalesTable data={query} />
                                </CardContent>
                            </Card>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
                <Separator />
                <ConventionTabs
                    data={categorizedData}
                    range={daysInRange}
                    revenue={revenueByCategory}
                />
            </section>
        </FormStoreProvider>
    )
}
