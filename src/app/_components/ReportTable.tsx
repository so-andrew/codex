'use client'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { dirtyValues } from '@/lib/utils'
import {
    type defaultValues,
    type ProductsByCategory,
    type SalesReportFormData,
} from '@/types'
import { ChevronDown, ChevronUp } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { editRecords } from '../actions'

const reportSchema = z.object({
    id: z.coerce.number(),
    key: z.string(),
    cashSales: z.number().int().min(0, 'Number must be nonnegative').optional(),
    cardSales: z.number().int().min(0, 'Number must be nonnegative').optional(),
})

const formSchema = z.array(reportSchema)

export default function ReportTable({
    data,
    day,
}: {
    data: ProductsByCategory[]
    day: string
}) {
    const def = useRef<defaultValues>({})
    const startingRowExpandedState: Record<number, boolean> = {}

    for (const category of data) {
        for (const product of category.products) {
            startingRowExpandedState[product.productId] =
                product.reports.length > 1
            for (const report of product.reports) {
                def.current[report.reportId] = {
                    id: report.reportId,
                    key: day,
                    cashSales: report.reportSalesFigures[day]!.cashSales,
                    cardSales: report.reportSalesFigures[day]!.cardSales,
                }
            }
        }
    }

    // const category = data.find((element) =>
    //     element.products.find((product) =>
    //         product.reports.find((report) => report.reportId === 61),
    //     ),
    // )

    // const product = category?.products.find(
    //     (product) => product.productId === 40,
    // )
    // console.log(product)

    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>(
        startingRowExpandedState,
    )

    const { toast } = useToast()

    const form = useForm({
        // resolver: zodResolver(formSchema),
        defaultValues: def.current,
    })
    const { formState, reset, getValues } = form
    const { isDirty, dirtyFields, isSubmitSuccessful, defaultValues } =
        formState

    const toggleRow = (productId: number) => {
        setExpandedRows((prev) => ({
            ...prev,
            [productId]: !prev[productId],
        }))
    }

    async function onSubmit(data: Record<number, SalesReportFormData>) {
        //console.log(data)
        const updates = []

        console.log(defaultValues)
        console.log(getValues())

        //console.log(dirtyFields)
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

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    {/* Iterate over categories -> products -> variations */}
                    {data.map((category) => {
                        return (
                            <div
                                key={category.categoryId}
                                className="flex flex-col gap-4 pt-4"
                            >
                                <h1 className="p-2 text-lg font-semibold">
                                    {category.categoryName}
                                </h1>
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
                                                            <span className="pl-2">
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
                                                                                .reportPrice,
                                                                        ),
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <FormField
                                                                        control={
                                                                            form.control
                                                                        }
                                                                        name={`${product.reports[0]!.reportId}.cashSales`}
                                                                        render={({
                                                                            field,
                                                                        }) => (
                                                                            <FormItem>
                                                                                <FormControl>
                                                                                    <Input
                                                                                        type="number"
                                                                                        min="0"
                                                                                        className="w-20"
                                                                                        // defaultValue={
                                                                                        //     entry
                                                                                        //         .reports[0]!
                                                                                        //         .reportSalesFigures[
                                                                                        //         entry
                                                                                        //             .reports[0]!
                                                                                        //             .key
                                                                                        //     ]
                                                                                        //         ?.cashSales ??
                                                                                        //     0
                                                                                        // }
                                                                                        {...field}
                                                                                        onChange={(
                                                                                            e,
                                                                                        ) => {
                                                                                            console.log(
                                                                                                product
                                                                                                    .reports[0]!
                                                                                                    .reportName,
                                                                                                e
                                                                                                    .target
                                                                                                    .value,
                                                                                            )
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
                                                                        name={`${product.reports[0]!.reportId}.cardSales`}
                                                                        render={({
                                                                            field,
                                                                        }) => (
                                                                            <FormItem>
                                                                                <FormControl>
                                                                                    <Input
                                                                                        type="number"
                                                                                        min="0"
                                                                                        className="w-20"
                                                                                        // defaultValue={
                                                                                        //     entry
                                                                                        //         .reports[0]!
                                                                                        //         .reportSalesFigures[
                                                                                        //         entry
                                                                                        //             .reports[0]!
                                                                                        //             .key
                                                                                        //     ]
                                                                                        //         ?.cardSales ??
                                                                                        //     0
                                                                                        // }
                                                                                        {...field}
                                                                                        onChange={(
                                                                                            e,
                                                                                        ) => {
                                                                                            console.log(
                                                                                                product
                                                                                                    .reports[0]!
                                                                                                    .reportName,
                                                                                                e
                                                                                                    .target
                                                                                                    .value,
                                                                                            )
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
                                                                        report.reportPrice,
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
                                                                            report.reportId
                                                                        }
                                                                        className="cursor-pointer even:bg-slate-200/40"
                                                                    >
                                                                        <TableCell className="pl-20">
                                                                            {
                                                                                report.reportName
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
                                                                                name={`${report.reportId}.cashSales`}
                                                                                render={({
                                                                                    field,
                                                                                }) => (
                                                                                    <FormItem>
                                                                                        <FormControl>
                                                                                            <Input
                                                                                                type="number"
                                                                                                min="0"
                                                                                                className="w-20"
                                                                                                // defaultValue={
                                                                                                //     report
                                                                                                //         .reportSalesFigures[
                                                                                                //         report
                                                                                                //             .key
                                                                                                //     ]
                                                                                                //         ?.cashSales ??
                                                                                                //     0
                                                                                                // }
                                                                                                {...field}
                                                                                                onChange={(
                                                                                                    e,
                                                                                                ) => {
                                                                                                    console.log(
                                                                                                        report.reportName,
                                                                                                        e
                                                                                                            .target
                                                                                                            .value,
                                                                                                    )
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
                                                                                name={`${report.reportId}.cardSales`}
                                                                                render={({
                                                                                    field,
                                                                                }) => (
                                                                                    <FormItem>
                                                                                        <FormControl>
                                                                                            <Input
                                                                                                type="number"
                                                                                                min="0"
                                                                                                className="w-20"
                                                                                                // defaultValue={
                                                                                                //     report
                                                                                                //         .reportSalesFigures[
                                                                                                //         report
                                                                                                //             .key
                                                                                                //     ]
                                                                                                //         ?.cardSales ??
                                                                                                //     0
                                                                                                // }
                                                                                                {...field}
                                                                                                onChange={(
                                                                                                    e,
                                                                                                ) => {
                                                                                                    console.log(
                                                                                                        report.reportName,
                                                                                                        e
                                                                                                            .target
                                                                                                            .value,
                                                                                                    )
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
                                </Table>
                            </div>
                        )
                    })}
                    {
                        <div
                            className="fixed bottom-0 left-1/4 right-1/4 flex items-center justify-between rounded-md border-t border-border bg-background p-4 shadow-lg transition-all duration-300 ease-in-out"
                            style={{
                                transform: `translateY(${Object.keys(dirtyFields).length > 0 ? '0' : '100%'})`,
                            }}
                        >
                            {/* <span>{`isDirty: ${isDirty}, getValues() === defaultValues = ${getValues() === defaultValues}, number of changes: ${Object.keys(dirtyFields).length}`}</span> */}
                            <span>{`${Object.keys(dirtyFields).length} changed field${Object.keys(dirtyFields).length !== 1 ? 's' : ''}`}</span>

                            {/* <Button
                                type="button"
                                onClick={() => {
                                    console.log(defaultValues)
                                    console.log(getValues())
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
            </Form>
        </>
    )
}
