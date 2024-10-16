'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'

export default function MonthlyRevenueStatsCard({ data }: { data: unknown[] }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                <ChartContainer></ChartContainer>
            </CardContent>
        </Card>
    )
}
