'use client'

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
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type ProductsByCategory } from '@/types'
import { formatInTimeZone } from 'date-fns-tz'
import { useState } from 'react'

export default function ConventionTabs({
    data,
    range,
}: {
    data: ProductsByCategory[]
    range: Date[]
}) {
    //const { dirtyStates, setDirtyState } = useFormStore((state) => state)
    const { dirtyFormExists, setDirtyFormExists } = useFormStore(
        (state) => state,
    )

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const [tab, setTab] = useState(
        formatInTimeZone(range[0]!, timeZone, 'EEE, MMM d'),
    )
    const [clickedTab, setClickedTab] = useState('')

    const [isAlertOpen, setIsAlertOpen] = useState(false)

    // const formStates: Record<string, boolean> = {}
    // for (const date of range) {
    //     const ds = formatInTimeZone(date, timeZone, 'EEE, MMM d')
    //     formStates[ds] = false
    //     //setDirtyState(ds, false)
    // }

    // const [formDirtyState, setFormDirtyState] =
    //     useState<Record<string, boolean>>(formStates)

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

    // const setFormDirty = ({
    //     key,
    //     isDirty,
    // }: {
    //     key: string
    //     isDirty: boolean
    // }) => {
    //     setFormDirtyState((prev) => ({
    //         ...prev,
    //         [key]: isDirty,
    //     }))
    //     console.log(key, formDirtyState[key])
    // }

    return (
        <>
            <Tabs value={tab} onValueChange={onTabChange} className="w-full">
                <TabsList className={`flex w-fit flex-row justify-start`}>
                    {range.map((day) => {
                        const dateString = formatInTimeZone(
                            day,
                            timeZone,
                            'EEE, MMM d',
                        )
                        return (
                            <TabsTrigger key={day.getDate()} value={dateString}>
                                {dateString}
                            </TabsTrigger>
                        )
                    })}
                </TabsList>
                {range.map((day, index) => {
                    const dateString = formatInTimeZone(
                        day,
                        timeZone,
                        'EEE, MMM d',
                    )
                    return (
                        <TabsContent key={index} value={dateString}>
                            <Card className="pb-16">
                                <CardContent className="flex flex-col gap-4">
                                    <ReportTable
                                        data={data}
                                        day={day.toISOString()}
                                    />
                                </CardContent>
                            </Card>
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
