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
import { dirtyValues } from '@/lib/utils'
import { type defaultValues, type ProductsByCategory } from '@/types'
import { ChevronDown, ChevronUp } from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const reportSchema = z.object({
    id: z.number(),
    key: z.string(),
    cashSales: z.number().int().min(0, 'Number must be nonnegative'),
    cardSales: z.number().int().min(0, 'Number must be nonnegative'),
})

const formSchema = z.object({
    reports: z.array(reportSchema),
})

export default function ReportTable({
    data,
    day,
}: {
    data: ProductsByCategory[]
    day: string
}) {
    const def: defaultValues = {}
    const startingRowExpandedState: Record<number, boolean> = {}

    for (const category of data) {
        for (const product of category.products) {
            startingRowExpandedState[product.productId] =
                product.reports.length > 1
            for (const report of product.reports) {
                def[report.reportId] = {
                    id: report.reportId,
                    key: day,
                    cashSales: report.reportSalesFigures[day]!.cashSales,
                    cardSales: report.reportSalesFigures[day]!.cashSales,
                }
            }
        }
    }
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>(
        startingRowExpandedState,
    )

    const form = useForm({
        // resolver: zodResolver(formSchema),
        defaultValues: def,
    })
    const { formState } = form
    const { isDirty, dirtyFields } = formState

    const toggleRow = (productId: number) => {
        setExpandedRows((prev) => ({
            ...prev,
            [productId]: !prev[productId],
        }))
    }

    async function onSubmit(
        data: Record<
            number,
            {
                cashSales: number | undefined
                cardSales: number | undefined
            }
        >,
    ) {
        //console.log(data)
        console.log(dirtyFields)
        const values = dirtyValues(dirtyFields, data)
        for (const [key, value] of Object.entries(values)) {
            console.log(key, value)
        }
    }

    return (
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
                                        <TableHead className="pl-12">
                                            Product
                                        </TableHead>
                                        <TableHead className="max-w-fit">
                                            Price
                                        </TableHead>
                                        <TableHead className="max-w-fit">
                                            Cash Sales
                                        </TableHead>
                                        <TableHead className="max-w-fit">
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
                                                    <TableCell>
                                                        {product.reports
                                                            .length > 1 ? (
                                                            <Button
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
                                                    {product.reports.length ===
                                                        1 && (
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
                                                        (report, index) => {
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
                                                                ).format(amount)
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
                {isDirty && (
                    <div
                        className="fixed bottom-0 left-1/4 right-1/4 flex items-center justify-between rounded-md border-t border-border bg-background p-4 shadow-lg transition-all duration-300 ease-in-out"
                        style={{
                            transform: `translateY(${isDirty ? '0' : '100%'})`,
                        }}
                    >
                        <Button
                            type="submit"
                            className="bg-purple-500 hover:bg-purple-600"
                        >
                            Save
                        </Button>
                    </div>
                )}
            </form>
        </Form>
    )
}
