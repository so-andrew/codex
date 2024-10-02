import ProductSalesTable from '@/app/_components/tables/ProductSalesTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type TopSellingVariations } from '@/types'

export default function ProductSalesStatsCard({
    data,
}: {
    data: TopSellingVariations[]
}) {
    return (
        <div className="flex h-full space-x-4">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-lg">Top Selling Items</CardTitle>
                </CardHeader>
                <CardContent className="relative h-auto lg:h-full">
                    <ProductSalesTable data={data} />
                </CardContent>
            </Card>
        </div>
    )
}
