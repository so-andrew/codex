import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { type ProductTableRow } from '@/types'
import { type ColumnDef } from '@tanstack/react-table'
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ChevronDown,
    ChevronUp,
} from 'lucide-react'
import Link from 'next/link'
import ProductTableRowActions from './ProductTableRowActions'

export const columns: ColumnDef<ProductTableRow>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
                className="ml-4"
            />
        ),
        cell: ({ row }) => {
            return row.depth === 0 ? (
                <div className="flex flex-row items-center gap-4">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                        className="grow-0"
                    />
                    {row.getCanExpand() &&
                        row.original.variations &&
                        row.original.variations.length > 1 && (
                            <Button
                                variant="ghost"
                                className="grow-0 px-2"
                                onClick={row.getToggleExpandedHandler()}
                            >
                                {row.getIsExpanded() ? (
                                    <ChevronUp className="h-4 w-4 text-purple-500" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-purple-500" />
                                )}
                            </Button>
                        )}
                </div>
            ) : undefined
        },
        minSize: 35,
        maxSize: 35,
    },
    {
        accessorFn: (row) => row.product.name,
        id: 'name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="font-semibold"
                >
                    Name
                    {column.getIsSorted() === 'asc' ? (
                        <ArrowUp className="ml-2 h-4 w-4" />
                    ) : column.getIsSorted() === 'desc' ? (
                        <ArrowDown className="ml-2 h-4 w-4" />
                    ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                </Button>
            )
        },
        cell: ({ row }) => {
            const product = row.original.product
            return (
                // <span className={`pl-[${row.depth * 2}rem]`}>
                //     {row.getValue('name')}
                // </span>
                row.depth === 0 ? (
                    <Link
                        href={`/dashboard/products/${product.id}`}
                        className="text-blue-500 font-medium"
                    >
                        {product.name}
                    </Link>
                ) : (
                    <span className="ml-4">{product.name}</span>
                )
            )
        },
    },
    {
        accessorKey: 'categoryName',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="font-semibold"
                >
                    Category
                    {column.getIsSorted() === 'asc' ? (
                        <ArrowUp className="ml-2 h-4 w-4" />
                    ) : column.getIsSorted() === 'desc' ? (
                        <ArrowDown className="ml-2 h-4 w-4" />
                    ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                </Button>
            )
        },
        cell: ({ row }) => {
            const product = row.original.product
            return 'category' in product ? (
                <span>{row.original.categoryName}</span>
            ) : undefined
        },
    },
    {
        accessorFn: (row) => {
            if (row.product.price) {
                return row.product.price
            } else {
                const prices = row.variations.map((variation) =>
                    parseFloat(variation.product.price!),
                )
                return Math.min(...prices)
            }
        },
        id: 'price',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="font-semibold"
                >
                    Price
                    {column.getIsSorted() === 'asc' ? (
                        <ArrowUp className="ml-2 h-4 w-4" />
                    ) : column.getIsSorted() === 'desc' ? (
                        <ArrowDown className="ml-2 h-4 w-4" />
                    ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                </Button>
            )
        },
        cell: ({ row }) => {
            const product = row.original.product
            if (product.price) {
                const amount = parseFloat(product.price)
                const formatted = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                }).format(amount)
                return <div className="font-medium">{formatted}</div>
            } else {
                const variations = row.originalSubRows
                if (!variations) {
                    return
                }
                const prices = variations.map((variation) =>
                    parseFloat(variation.product.price!),
                )
                let formattedAmount = ''
                if (Math.max(...prices) === Math.min(...prices)) {
                    formattedAmount = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                    }).format(prices[0]!)
                } else {
                    const formattedMin = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                    }).format(Math.min(...prices))
                    const formattedMax = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                    }).format(Math.max(...prices))
                    formattedAmount = `${formattedMin} - ${formattedMax}`
                }
                return <div className="font-medium">{formattedAmount}</div>
            }
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <ProductTableRowActions row={row} />,
        minSize: 35,
        maxSize: 35,
    },
]
