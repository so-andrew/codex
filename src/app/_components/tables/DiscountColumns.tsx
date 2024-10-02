import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { type Discount } from '@/server/db/schema'
import { type ColumnDef } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import DiscountTableRowActions from './DiscountTableRowActions'
import EditDiscountButton from './EditDiscountButton'

export const columns: ColumnDef<Discount>[] = [
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
            return (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="grow-0"
                />
            )
        },
        minSize: 15,
        maxSize: 15,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => {
            return (
                <>
                    {/* <span className="mr-6 h-4 w-4"></span> */}
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
                </>
            )
        },
        cell: ({ row }) => <EditDiscountButton row={row} />,
    },
    {
        accessorFn: (row) => parseFloat(row.amount),
        id: 'amount',
        header: ({ column }) => {
            return (
                <>
                    {/* <span className="mr-6 h-4 w-4"></span> */}
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                        className="font-semibold"
                    >
                        Amount
                        {column.getIsSorted() === 'asc' ? (
                            <ArrowUp className="ml-2 h-4 w-4" />
                        ) : column.getIsSorted() === 'desc' ? (
                            <ArrowDown className="ml-2 h-4 w-4" />
                        ) : (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                    </Button>
                </>
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.original.amount)
            const formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(amount)

            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <DiscountTableRowActions row={row} />,
        minSize: 40,
        maxSize: 40,
    },
]
