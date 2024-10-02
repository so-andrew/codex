import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { dirtyValues } from '@/lib/utils'
import {
    type DailyRevenueReport,
    type defaultValues,
    type ProductsByCategory,
    type SalesReportFormData,
} from '@/types'
import { DevTool } from '@hookform/devtools'
import { zodResolver } from '@hookform/resolvers/zod'
import { isEqual } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { ChevronDown, ChevronUp } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { editRecords } from '../actions'
import { useFormStore } from '../providers/form-store-provider'

const reportSchema = z.object({
    id: z.coerce.number(),
    key: z.date(),
    cashSales: z.number().int().min(0, 'Number must be nonnegative').optional(),
    cardSales: z.number().int().min(0, 'Number must be nonnegative').optional(),
})

const formSchema = z.record(z.string(), reportSchema)

export default function ReportTable({
    data,
    day,
    revenue,
}: {
    data: ProductsByCategory[]
    day: Date
    revenue: Record<number, DailyRevenueReport>
}) {
    const { dirtyFormExists, setDirtyFormExists } = useFormStore(
        (state) => state,
    )
    const { toast } = useToast()

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const dayString = useRef<string>(
        formatInTimeZone(day, timeZone, 'EEE, MMM d'),
    )

    const def = useRef<defaultValues>({})
    const startingRowExpandedState: Record<number, boolean> = {}

    for (const category of data) {
        for (const product of category.products) {
            startingRowExpandedState[product.productId] =
                product.reports.length > 1
            for (const report of product.reports) {
                def.current[report.id.toString()] = {
                    id: report.id,
                    key: day,
                    cashSales: report.revenues.find((revenue) =>
                        isEqual(revenue.date, day),
                    )!.cashSales,
                    cardSales: report.revenues.find((revenue) =>
                        isEqual(revenue.date, day),
                    )!.cardSales,
                }
            }
        }
    }

    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>(
        startingRowExpandedState,
    )

    const form = useForm<defaultValues>({
        resolver: zodResolver(formSchema),
        defaultValues: def.current,
    })

    const { formState, reset, getValues, control, getFieldState } = form
    const { dirtyFields, isSubmitSuccessful, defaultValues } = formState

    const toggleRow = (productId: number) => {
        setExpandedRows((prev) => ({
            ...prev,
            [productId]: !prev[productId],
        }))
    }

    async function onSubmit(data: z.infer<typeof formSchema>) {
        //console.log(data)
        const updates = []
        const values = dirtyValues(dirtyFields, data)
        for (const [productId, formData] of Object.entries(values)) {
            try {
                const parse = reportSchema.parse({
                    id: productId,
                    key: day,
                    cashSales:
                        (formData as SalesReportFormData).cashSales ??
                        undefined,
                    cardSales:
                        (formData as SalesReportFormData).cardSales ??
                        undefined,
                })
                updates.push(parse)
            } catch (e) {
                const error = e as Error
                toast({
                    title: error.name,
                    description: error.message,
                })
            }
        }
        console.log(updates)
        await editRecords(updates)
    }

    useEffect(() => {
        if (isSubmitSuccessful) {
            reset(
                {},
                {
                    keepValues: true,
                    keepDirty: false,
                    keepDefaultValues: false,
                },
            )
        }
    }, [isSubmitSuccessful, reset])

    useEffect(() => {
        setDirtyFormExists(Object.keys(dirtyFields).length > 0)
    }, [dirtyFields, setDirtyFormExists])

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    {/* Iterate over categories -> products -> variations */}
                    {data.map((category) => {
                        return (
                            <div
                                key={category.categoryId}
                                className="flex flex-col gap-4 pt-4 px-6"
                            >
                                <div className="flex flex-row items-center gap-4">
                                    <h1 className="p-2 text-lg font-semibold">
                                        {category.categoryName}
                                    </h1>
                                    <Badge
                                        variant="secondary"
                                        className="py-1 rounded-xl"
                                    >
                                        {dayString.current}
                                    </Badge>
                                </div>
                                <Table className="rounded-md border">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead
                                                className="pl-12"
                                                style={{ width: '60%' }}
                                            >
                                                Product
                                            </TableHead>
                                            <TableHead
                                                style={{ width: 'min-content' }}
                                            >
                                                Price
                                            </TableHead>
                                            <TableHead
                                                style={{ width: 'min-content' }}
                                            >
                                                Cash Sales
                                            </TableHead>
                                            <TableHead
                                                style={{ width: 'min-content' }}
                                            >
                                                Card Sales
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {category.products.map((product) => {
                                            return (
                                                <React.Fragment
                                                    key={product.productId}
                                                >
                                                    <TableRow className="cursor-pointer even:bg-gray-300/20">
                                                        <TableCell
                                                            colSpan={
                                                                product.reports
                                                                    .length > 1
                                                                    ? 4
                                                                    : 1
                                                            }
                                                        >
                                                            {product.reports
                                                                .length > 1 ? (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    className="px-2"
                                                                    onClick={() =>
                                                                        toggleRow(
                                                                            product.productId,
                                                                        )
                                                                    }
                                                                >
                                                                    {expandedRows[
                                                                        product
                                                                            .productId
                                                                    ] ? (
                                                                        <ChevronUp className="h-4 w-4 text-purple-500" />
                                                                    ) : (
                                                                        <ChevronDown className="h-4 w-4 text-purple-500" />
                                                                    )}
                                                                </Button>
                                                            ) : (
                                                                <span className="pl-8" />
                                                            )}
                                                            <span className="pl-2 font-medium">
                                                                {
                                                                    product.productName
                                                                }
                                                            </span>
                                                        </TableCell>
                                                        {product.reports
                                                            .length === 1 && (
                                                            <>
                                                                <TableCell>
                                                                    {new Intl.NumberFormat(
                                                                        'en-US',
                                                                        {
                                                                            style: 'currency',
                                                                            currency:
                                                                                'USD',
                                                                        },
                                                                    ).format(
                                                                        parseFloat(
                                                                            product
                                                                                .reports[0]!
                                                                                .price,
                                                                        ),
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <FormField
                                                                        control={
                                                                            form.control
                                                                        }
                                                                        name={`${product.reports[0]!.id}.cashSales`}
                                                                        render={({
                                                                            field,
                                                                        }) => (
                                                                            <FormItem>
                                                                                <FormControl>
                                                                                    <Input
                                                                                        type="number"
                                                                                        min="0"
                                                                                        className={`w-16 lg:w-20 ${getFieldState(`${product.reports[0]!.id}.cashSales`).isDirty ? 'border-green-500 border-2' : ''}`}
                                                                                        {...field}
                                                                                        onChange={(
                                                                                            e,
                                                                                        ) => {
                                                                                            field.onChange(
                                                                                                Number(
                                                                                                    e
                                                                                                        .target
                                                                                                        .value,
                                                                                                ),
                                                                                            )
                                                                                        }}
                                                                                    />
                                                                                </FormControl>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <FormField
                                                                        control={
                                                                            form.control
                                                                        }
                                                                        name={`${product.reports[0]!.id}.cardSales`}
                                                                        render={({
                                                                            field,
                                                                        }) => (
                                                                            <FormItem>
                                                                                <FormControl>
                                                                                    <Input
                                                                                        type="number"
                                                                                        min="0"
                                                                                        className={`w-16 lg:w-20 ${getFieldState(`${product.reports[0]!.id}.cardSales`).isDirty ? 'border-green-500 border-2' : ''}`}
                                                                                        {...field}
                                                                                        onChange={(
                                                                                            e,
                                                                                        ) => {
                                                                                            field.onChange(
                                                                                                Number(
                                                                                                    e
                                                                                                        .target
                                                                                                        .value,
                                                                                                ),
                                                                                            )
                                                                                        }}
                                                                                    />
                                                                                </FormControl>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </TableCell>
                                                            </>
                                                        )}
                                                    </TableRow>
                                                    {expandedRows[
                                                        product.productId
                                                    ] &&
                                                        product.reports.map(
                                                            (report) => {
                                                                const amount =
                                                                    parseFloat(
                                                                        report.price,
                                                                    )
                                                                const formatted =
                                                                    new Intl.NumberFormat(
                                                                        'en-US',
                                                                        {
                                                                            style: 'currency',
                                                                            currency:
                                                                                'USD',
                                                                        },
                                                                    ).format(
                                                                        amount,
                                                                    )
                                                                return (
                                                                    <TableRow
                                                                        key={
                                                                            report.id
                                                                        }
                                                                        className="cursor-pointer even:bg-slate-200/40"
                                                                    >
                                                                        <TableCell className="pl-12 lg:pl-20">
                                                                            {
                                                                                report.name
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {
                                                                                formatted
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <FormField
                                                                                control={
                                                                                    form.control
                                                                                }
                                                                                name={`${report.id}.cashSales`}
                                                                                render={({
                                                                                    field,
                                                                                }) => (
                                                                                    <FormItem>
                                                                                        <FormControl>
                                                                                            <Input
                                                                                                type="number"
                                                                                                min="0"
                                                                                                className={`w-16 lg:w-20 ${getFieldState(`${report.id}.cashSales`).isDirty ? 'border-green-500 border-2' : ''}`}
                                                                                                {...field}
                                                                                                onChange={(
                                                                                                    e,
                                                                                                ) => {
                                                                                                    field.onChange(
                                                                                                        Number(
                                                                                                            e
                                                                                                                .target
                                                                                                                .value,
                                                                                                        ),
                                                                                                    )
                                                                                                }}
                                                                                            />
                                                                                        </FormControl>
                                                                                    </FormItem>
                                                                                )}
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <FormField
                                                                                control={
                                                                                    form.control
                                                                                }
                                                                                name={`${report.id}.cardSales`}
                                                                                render={({
                                                                                    field,
                                                                                }) => (
                                                                                    <FormItem>
                                                                                        <FormControl>
                                                                                            <Input
                                                                                                type="number"
                                                                                                min="0"
                                                                                                className={`w-16 lg:w-20 ${getFieldState(`${report.id}.cardSales`).isDirty ? 'border-green-500 border-2' : ''}`}
                                                                                                {...field}
                                                                                                onChange={(
                                                                                                    e,
                                                                                                ) => {
                                                                                                    field.onChange(
                                                                                                        Number(
                                                                                                            e
                                                                                                                .target
                                                                                                                .value,
                                                                                                        ),
                                                                                                    )
                                                                                                }}
                                                                                            />
                                                                                        </FormControl>
                                                                                    </FormItem>
                                                                                )}
                                                                            />
                                                                        </TableCell>
                                                                    </TableRow>
                                                                )
                                                            },
                                                        )}
                                                </React.Fragment>
                                            )
                                        })}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow className="even:bg-gray-300/20">
                                            <TableCell
                                                colSpan={3}
                                                className="py-4 pl-12 font-bold"
                                            >
                                                Total
                                            </TableCell>
                                            <TableCell>
                                                {new Intl.NumberFormat(
                                                    'en-US',
                                                    {
                                                        style: 'currency',
                                                        currency: 'USD',
                                                    },
                                                ).format(
                                                    revenue[
                                                        category.categoryId
                                                    ]!.totalRevenue,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </div>
                        )
                    })}
                    {
                        <div
                            className="fixed bottom-0 left-4 right-4 lg:left-1/4 lg:right-1/4 flex items-center justify-between rounded-md border-t border-border bg-background p-4 shadow-lg transition-all duration-300 ease-in-out"
                            style={{
                                transform: `translateY(${Object.keys(dirtyFields).length > 0 ? '0' : '100%'})`,
                            }}
                        >
                            {/* <span>{`isDirty: ${isDirty}, getValues() === defaultValues = ${getValues() === defaultValues}, number of changes: ${Object.keys(dirtyFields).length}`}</span> */}
                            <span>{`${Object.keys(dirtyFields).length} changed field${Object.keys(dirtyFields).length !== 1 ? 's' : ''}`}</span>

                            {/* <Button
                                type="button"
                                onClick={() => {
                                    //console.log(defaultValues)
                                    console.log(JSON.stringify(getValues()))
                                    console.log(defaultValues === getValues())
                                }}
                            >
                                Log
                            </Button> */}
                            <Button
                                type="submit"
                                className="bg-purple-500 hover:bg-purple-600"
                            >
                                Save
                            </Button>
                        </div>
                    }
                </form>
                <DevTool control={control} />
            </Form>
        </>
    )
}
