import { Button } from '@/components/ui/button'
import { moneyFormat } from '@/lib/utils'
import { type TopSellingVariations } from '@/types'
import { type ColumnDef } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

export const columns: ColumnDef<TopSellingVariations>[] = [
    {
        accessorFn: (row) => {
            return row.variationName
                ? `${row.variationName} (${row.productName})`
                : `${row.productName}`
        },
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
            const variationName = row.original.variationName
            const productName = row.original.productName

            return variationName && variationName !== 'Default' ? (
                <div className="font-medium">
                    {variationName}{' '}
                    <span className="max-xl:hidden text-sm font-normal text-gray-500">{`(${productName})`}</span>
                </div>
            ) : (
                <div className="font-medium">{productName}</div>
            )
        },
    },
    {
        accessorKey: 'totalSales',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="font-semibold"
                >
                    Sales
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
            return <div className="font-medium">{row.original.totalSales}</div>
        },
    },
    {
        accessorKey: 'totalRevenue',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="font-semibold"
                >
                    Revenue
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
            const amount = row.original.totalRevenue
            const formatted = moneyFormat.format(amount)

            return <div className="font-medium">{formatted}</div>
        },
    },
]
