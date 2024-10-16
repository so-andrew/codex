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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { dirtyValues, moneyFormat } from '@/lib/utils'
import {
    type DailyRevenueReport,
    type defaultValues,
    type DiscountReport,
    type ProductsByCategory,
    type ReportOrDiscount,
    type SalesReportFormData,
} from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { isEqual } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { ChevronDown, ChevronUp, Info, TriangleAlert } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { editRecords } from '../actions'
import { useFormStore } from '../providers/form-store-provider'
import EditCustomDiscountButton from './tables/EditCustomDiscountButton'
import EditCustomReportButton from './tables/EditCustomReportButton'

const reportSchema = z.object({
    reportId: z.coerce.number(),
    date: z.date(),
    type: z.literal('product'),
    cashSales: z.number().int().min(0, 'Number must be nonnegative').optional(),
    cardSales: z.number().int().min(0, 'Number must be nonnegative').optional(),
})

const discountSchema = z.object({
    reportId: z.coerce.number(),
    date: z.date(),
    type: z.literal('discount'),
    cashDiscounts: z
        .number()
        .int()
        .min(0, 'Number must be nonnegative')
        .optional(),
    cardDiscounts: z
        .number()
        .int()
        .min(0, 'Number must be nonnegative')
        .optional(),
})

const generalReportSchema = z.object({
    reportId: z.coerce.number(),
    date: z.date(),
    cashSales: z.number().int().min(0, 'Number must be nonnegative').optional(),
    cardSales: z.number().int().min(0, 'Number must be nonnegative').optional(),
    cashDiscounts: z
        .number()
        .int()
        .min(0, 'Number must be nonnegative')
        .optional(),
    cardDiscounts: z
        .number()
        .int()
        .min(0, 'Number must be nonnegative')
        .optional(),
})

const formSchema = z.record(z.string(), generalReportSchema)

export default function ReportTable({
    data,
    day,
    revenue,
    discounts,
    protectEdits,
}: {
    data: ProductsByCategory[]
    day: Date
    revenue: Record<number, DailyRevenueReport>
    discounts: DiscountReport[]
    protectEdits: boolean
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
                //console.log(report)
                def.current[`prod${report.id.toString()}`] = {
                    reportId: report.id,
                    date: day,
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

    for (const discount of discounts) {
        def.current[`disc${discount.id.toString()}`] = {
            reportId: discount.id,
            date: day,
            cashDiscounts: discount.daily.find((daily) =>
                isEqual(daily.date, day),
            )!.cashDiscounts,
            cardDiscounts: discount.daily.find((daily) =>
                isEqual(daily.date, day),
            )!.cardDiscounts,
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
        const updates = []
        const values = dirtyValues(dirtyFields, data)
        console.log(values)
        for (const [id, formData] of Object.entries(values)) {
            try {
                let parse = {} as ReportOrDiscount
                if (id.startsWith('prod')) {
                    parse = reportSchema.parse({
                        reportId: id.slice(4),
                        date: day,
                        type: 'product',
                        cashSales:
                            (formData as SalesReportFormData).cashSales ??
                            undefined,
                        cardSales:
                            (formData as SalesReportFormData).cardSales ??
                            undefined,
                    })
                } else if (id.startsWith('disc')) {
                    parse = discountSchema.parse({
                        reportId: id.slice(4),
                        date: day,
                        type: 'discount',
                        cashDiscounts:
                            (formData as SalesReportFormData).cashDiscounts ??
                            undefined,
                        cardDiscounts:
                            (formData as SalesReportFormData).cardDiscounts ??
                            undefined,
                    })
                } else return
                updates.push(parse)
            } catch (e) {
                const error = e as Error
                console.error(error)
                toast({
                    title: error.name,
                    description: error.message,
                })
            }
        }
        //console.log(updates)
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
                        //console.log(category.products)
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
                                                            <div className="flex flex-row items-center">
                                                                {product.reports
                                                                    .length >
                                                                1 ? (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        className="px-2 mr-2"
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
                                                                    <span className="pl-10" />
                                                                )}
                                                                <span className="font-medium">
                                                                    {product
                                                                        .reports
                                                                        .length ===
                                                                        1 &&
                                                                    product
                                                                        .reports[0]!
                                                                        .custom ? (
                                                                        <EditCustomReportButton
                                                                            report={
                                                                                product
                                                                                    .reports[0]!
                                                                            }
                                                                        />
                                                                    ) : (
                                                                        <span>
                                                                            {
                                                                                product.productName
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </span>
                                                                {product.reports
                                                                    .length ===
                                                                    1 &&
                                                                    product
                                                                        .reports[0]!
                                                                        .custom && (
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger
                                                                                    asChild
                                                                                >
                                                                                    <Info
                                                                                        height={
                                                                                            20
                                                                                        }
                                                                                        className="text-gray-500 ml-4"
                                                                                    />
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    <p className="text-base">
                                                                                        Specific
                                                                                        to
                                                                                        this
                                                                                        convention
                                                                                        only
                                                                                    </p>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    )}
                                                                {product.productId <
                                                                    -1 && (
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger
                                                                                asChild
                                                                            >
                                                                                <TriangleAlert
                                                                                    height={
                                                                                        20
                                                                                    }
                                                                                    className="text-red-400 ml-4"
                                                                                />
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <span className="text-base">
                                                                                    <h1>
                                                                                        This
                                                                                        product
                                                                                        is
                                                                                        no
                                                                                        longer
                                                                                        in
                                                                                        your
                                                                                        Product
                                                                                        Library.
                                                                                    </h1>
                                                                                    <p>
                                                                                        Statistics
                                                                                        will
                                                                                        remain
                                                                                        visible
                                                                                        for
                                                                                        this
                                                                                        convention.
                                                                                    </p>
                                                                                </span>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        {product.reports
                                                            .length === 1 && (
                                                            <>
                                                                <TableCell>
                                                                    {moneyFormat.format(
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
                                                                        name={`prod${product.reports[0]!.id}.cashSales`}
                                                                        render={({
                                                                            field,
                                                                        }) => (
                                                                            <FormItem>
                                                                                <FormControl>
                                                                                    <TooltipProvider>
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger
                                                                                                asChild
                                                                                            >
                                                                                                <Input
                                                                                                    type="number"
                                                                                                    min="0"
                                                                                                    className={`w-16 lg:w-20 ${getFieldState(`prod${product.reports[0]!.id}.cashSales`).isDirty ? 'border-green-500 border-2' : ''}`}
                                                                                                    {...field}
                                                                                                    onChange={(
                                                                                                        e,
                                                                                                    ) => {
                                                                                                        console.log(
                                                                                                            'hi',
                                                                                                        )
                                                                                                        field.onChange(
                                                                                                            Number(
                                                                                                                e
                                                                                                                    .target
                                                                                                                    .value,
                                                                                                            ),
                                                                                                        )
                                                                                                    }}
                                                                                                    disabled={
                                                                                                        protectEdits
                                                                                                    }
                                                                                                />
                                                                                            </TooltipTrigger>
                                                                                            {protectEdits && (
                                                                                                <TooltipContent>
                                                                                                    <p className="text-base">
                                                                                                        These
                                                                                                        values
                                                                                                        are
                                                                                                        protected.
                                                                                                    </p>
                                                                                                </TooltipContent>
                                                                                            )}
                                                                                        </Tooltip>
                                                                                    </TooltipProvider>
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
                                                                        name={`prod${product.reports[0]!.id}.cardSales`}
                                                                        render={({
                                                                            field,
                                                                        }) => (
                                                                            <FormItem>
                                                                                <FormControl>
                                                                                    <TooltipProvider>
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger
                                                                                                asChild
                                                                                            >
                                                                                                <Input
                                                                                                    type="number"
                                                                                                    min="0"
                                                                                                    className={`w-16 lg:w-20 ${getFieldState(`prod${product.reports[0]!.id}.cardSales`).isDirty ? 'border-green-500 border-2' : ''}`}
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
                                                                                                    disabled={
                                                                                                        protectEdits
                                                                                                    }
                                                                                                />
                                                                                            </TooltipTrigger>
                                                                                            {protectEdits && (
                                                                                                <TooltipContent>
                                                                                                    <p className="text-base">
                                                                                                        These
                                                                                                        values
                                                                                                        are
                                                                                                        protected.
                                                                                                    </p>
                                                                                                </TooltipContent>
                                                                                            )}
                                                                                        </Tooltip>
                                                                                    </TooltipProvider>
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
                                                                    moneyFormat.format(
                                                                        amount,
                                                                    )
                                                                return (
                                                                    <TableRow
                                                                        key={
                                                                            report.id
                                                                        }
                                                                        className="cursor-pointer even:bg-gray-300/20"
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
                                                                                name={`prod${report.id}.cashSales`}
                                                                                render={({
                                                                                    field,
                                                                                }) => (
                                                                                    <FormItem>
                                                                                        <FormControl>
                                                                                            <TooltipProvider>
                                                                                                <Tooltip>
                                                                                                    <TooltipTrigger
                                                                                                        asChild
                                                                                                    >
                                                                                                        <Input
                                                                                                            type="number"
                                                                                                            min="0"
                                                                                                            className={`w-16 lg:w-20 ${getFieldState(`prod${report.id}.cashSales`).isDirty ? 'border-green-500 border-2' : ''}`}
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
                                                                                                            disabled={
                                                                                                                protectEdits
                                                                                                            }
                                                                                                        />
                                                                                                    </TooltipTrigger>
                                                                                                    {protectEdits && (
                                                                                                        <TooltipContent>
                                                                                                            <p className="text-base">
                                                                                                                These
                                                                                                                values
                                                                                                                are
                                                                                                                protected.
                                                                                                            </p>
                                                                                                        </TooltipContent>
                                                                                                    )}
                                                                                                </Tooltip>
                                                                                            </TooltipProvider>
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
                                                                                name={`prod${report.id}.cardSales`}
                                                                                render={({
                                                                                    field,
                                                                                }) => (
                                                                                    <FormItem>
                                                                                        <FormControl>
                                                                                            <TooltipProvider>
                                                                                                <Tooltip>
                                                                                                    <TooltipTrigger
                                                                                                        asChild
                                                                                                    >
                                                                                                        <Input
                                                                                                            type="number"
                                                                                                            min="0"
                                                                                                            className={`w-16 lg:w-20 ${getFieldState(`prod${report.id}.cardSales`).isDirty ? 'border-green-500 border-2' : ''}`}
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
                                                                                                            disabled={
                                                                                                                protectEdits
                                                                                                            }
                                                                                                        />
                                                                                                    </TooltipTrigger>
                                                                                                    {protectEdits && (
                                                                                                        <TooltipContent>
                                                                                                            <p className="text-base">
                                                                                                                These
                                                                                                                values
                                                                                                                are
                                                                                                                protected.
                                                                                                            </p>
                                                                                                        </TooltipContent>
                                                                                                    )}
                                                                                                </Tooltip>
                                                                                            </TooltipProvider>
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
                                                {moneyFormat.format(
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
                    {/* {
                        <div className="flex flex-col gap-4 pt-4 px-6">
                            <div className="flex flex-row items-center gap-4">
                                <h1 className="p-2 text-lg font-semibold">
                                    Other
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
                                <TableBody></TableBody>
                            </Table>
                        </div>
                    } */}
                    {
                        <div className="flex flex-col gap-4 pt-4 px-6">
                            <div className="flex flex-row items-center gap-4">
                                <h1 className="p-2 text-lg font-semibold">
                                    Discounts
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
                                            Discount
                                        </TableHead>
                                        <TableHead
                                            style={{ width: 'min-content' }}
                                        >
                                            Amount
                                        </TableHead>
                                        <TableHead
                                            style={{ width: 'min-content' }}
                                        >
                                            Cash Disc.
                                        </TableHead>
                                        <TableHead
                                            style={{ width: 'min-content' }}
                                        >
                                            Card Disc.
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {discounts.map((discount) => {
                                        return (
                                            <React.Fragment key={discount.id}>
                                                <TableRow className="cursor-pointer even:bg-gray-300/20">
                                                    <TableCell>
                                                        <span className="pl-10 font-medium">
                                                            {discount.custom ? (
                                                                <EditCustomDiscountButton
                                                                    discount={
                                                                        discount
                                                                    }
                                                                />
                                                            ) : (
                                                                <span>
                                                                    {
                                                                        discount.name
                                                                    }
                                                                </span>
                                                            )}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {moneyFormat.format(
                                                            parseFloat(
                                                                discount.amount,
                                                            ),
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <FormField
                                                            control={
                                                                form.control
                                                            }
                                                            name={`disc${discount.id}.cashDiscounts`}
                                                            render={({
                                                                field,
                                                            }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger
                                                                                    asChild
                                                                                >
                                                                                    <Input
                                                                                        type="number"
                                                                                        min="0"
                                                                                        className={`w-16 lg:w-20 ${getFieldState(`disc${discount.id}.cashDiscounts`).isDirty ? 'border-green-500 border-2' : ''}`}
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
                                                                                        disabled={
                                                                                            protectEdits
                                                                                        }
                                                                                    />
                                                                                </TooltipTrigger>
                                                                                {protectEdits && (
                                                                                    <TooltipContent>
                                                                                        <p className="text-base">
                                                                                            These
                                                                                            values
                                                                                            are
                                                                                            protected.
                                                                                        </p>
                                                                                    </TooltipContent>
                                                                                )}
                                                                            </Tooltip>
                                                                        </TooltipProvider>
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
                                                            name={`disc${discount.id}.cardDiscounts`}
                                                            render={({
                                                                field,
                                                            }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger>
                                                                                    <Input
                                                                                        type="number"
                                                                                        min="0"
                                                                                        className={`w-16 lg:w-20 ${getFieldState(`disc${discount.id}.cardDiscounts`).isDirty ? 'border-green-500 border-2' : ''}`}
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
                                                                                        disabled={
                                                                                            protectEdits
                                                                                        }
                                                                                    />
                                                                                </TooltipTrigger>
                                                                                {protectEdits && (
                                                                                    <TooltipContent>
                                                                                        <p className="text-base">
                                                                                            These
                                                                                            values
                                                                                            are
                                                                                            protected.
                                                                                        </p>
                                                                                    </TooltipContent>
                                                                                )}
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            </React.Fragment>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    }
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
                                    console.log('default', defaultValues)
                                    console.log(
                                        'curr',
                                        JSON.stringify(getValues()),
                                    )
                                    console.log(defaultValues === getValues())
                                }}
                            >
                                Log
                            </Button> */}
                            <Button
                                type="submit"
                                className="hover:bg-purple-600"
                            >
                                Save
                            </Button>
                        </div>
                    }
                </form>
                {/* <DevTool control={control} /> */}
            </Form>
        </>
    )
}
