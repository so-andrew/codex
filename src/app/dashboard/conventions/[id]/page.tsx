import EditConvention from '@/app/_components/EditConvention'
import { FormStoreProvider } from '@/app/providers/form-store-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getConventionById, getConventionReportsNew } from '@/server/queries'
import { type ProductsByCategory, type ReportsByProduct } from '@/types'
import { eachDayOfInterval } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { redirect } from 'next/navigation'
import ConventionTabs from '../_components/ConventionTabs'

export default async function page({ params }: { params: { id: string } }) {
    const conventionId = parseInt(params.id)
    const convention = await getConventionById(conventionId)

    if (!convention) {
        redirect('/dashboard/conventions')
    }

    // const reports = await getConventionReports(conventionId)
    // console.log('reports:', reports)
    const reports = await getConventionReportsNew(conventionId)
    //console.log('reports:', reports)

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
    //console.log('categorizedData:', categorizedData[0]?.products[0]?.reports[0])

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
                <section className="flex flex-row justify-between border-b pb-8">
                    {/* <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-semibold">
                            {convention?.name}
                        </h1>
                        <h2 className="text-lg text-gray-500">
                            {convention?.location}
                        </h2>
                        <h2 className="text-lg text-gray-500">
                            {startDateString} - {endDateString}
                        </h2>
                    </div> */}
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
                    {convention && <EditConvention convention={convention} />}
                </section>
                <ConventionTabs data={categorizedData} range={daysInRange} />
            </section>
        </FormStoreProvider>
    )
}
