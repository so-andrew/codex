'use client'

import CreateCustomDiscount from '@/app/_components/CreateCustomDiscount'
import CreateCustomReport from '@/app/_components/CreateCustomReport'
import CreateCustomReportDropdown from '@/app/_components/CreateCustomReportDropdown'
import ReportTable from '@/app/_components/ReportTable'
import { useFormStore } from '@/app/providers/form-store-provider'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    DiscountReport,
    type DailyRevenueReport,
    type ProductsByCategory,
} from '@/types'
import { formatInTimeZone } from 'date-fns-tz'
import { useState } from 'react'

export default function ConventionTabs({
    data,
    range,
    revenue,
    discounts,
    conventionId,
    protectEdits,
}: {
    data: ProductsByCategory[]
    range: Date[]
    revenue: Map<string, Record<number, DailyRevenueReport>>
    discounts: DiscountReport[]
    conventionId: number
    protectEdits: boolean
}) {
    const { dirtyFormExists, setDirtyFormExists } = useFormStore(
        (state) => state,
    )

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const [tab, setTab] = useState(
        formatInTimeZone(range[0]!, timeZone, 'EEE, MMM d'),
    )
    const [clickedTab, setClickedTab] = useState('')
    const [isAlertOpen, setIsAlertOpen] = useState(false)

    const onTabChange = (value: string) => {
        if (dirtyFormExists) {
            //console.log('Form is dirty')
            setIsAlertOpen(true)
            setClickedTab(value)
        } else {
            //console.log('Form is clean')
            setTab(value)
            setClickedTab('')
        }
    }

    const onDialogContinue = () => {
        setIsAlertOpen(false)
        setTab(clickedTab)
        setClickedTab('')
    }

    const onDialogCancel = () => {
        setIsAlertOpen(false)
        setClickedTab('')
    }

    return (
        <>
            <Tabs value={tab} onValueChange={onTabChange} className="w-full">
                <div className="flex flex-row justify-between mx-6 gap-4 flex-wrap">
                    <TabsList className={`flex w-fit flex-row justify-start`}>
                        {range.map((day) => {
                            const dateString = formatInTimeZone(
                                day,
                                timeZone,
                                'EEE, MMM d',
                            )
                            return (
                                <TabsTrigger
                                    key={day.getDate()}
                                    value={dateString}
                                >
                                    {dateString}
                                </TabsTrigger>
                            )
                        })}
                    </TabsList>
                    <div className="md:hidden">
                        <CreateCustomReportDropdown
                            conventionId={conventionId}
                        />
                    </div>
                    <div className="hidden md:flex gap-4">
                        <CreateCustomReport conventionId={conventionId} />
                        <CreateCustomDiscount conventionId={conventionId} />
                    </div>
                </div>
                {range.map((day, index) => {
                    const dateString = formatInTimeZone(
                        day,
                        timeZone,
                        'EEE, MMM d',
                    )
                    return (
                        <TabsContent
                            key={index}
                            value={dateString}
                            className="mb-16"
                        >
                            {/* <Card className="pb-16 mx-0 lg:mx-6">
                                <CardContent className="flex flex-col gap-4">
                                    <ReportTable
                                        data={data}
                                        day={day}
                                        revenue={
                                            revenue.get(day.toISOString())!
                                        }
                                    />
                                </CardContent>
                            </Card> */}
                            <ReportTable
                                data={data}
                                day={day}
                                revenue={revenue.get(day.toISOString())!}
                                discounts={discounts}
                                protectEdits={protectEdits}
                            />
                        </TabsContent>
                    )
                })}
            </Tabs>
            <AlertDialog open={isAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unsaved Form Values</AlertDialogTitle>
                        <AlertDialogDescription>
                            There are unsaved values below. Press Cancel to go
                            back or Continue to discard changes.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={onDialogCancel}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={onDialogContinue}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
