import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { type Convention } from '@/server/db/schema'
import { type ColumnDef } from '@tanstack/react-table'
import { formatInTimeZone } from 'date-fns-tz'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import ConventionTableRowActions from './ConventionTableRowActions'

export const columns: ColumnDef<Convention>[] = [
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
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        minSize: 35,
        maxSize: 35,
    },
    {
        accessorKey: 'name',
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
            const convention = row.original
            return (
                <Link
                    href={`/dashboard/conventions/${convention.id}`}
                    className="text-blue-500 font-medium"
                >
                    {row.getValue('name')}
                </Link>
            )
        },
    },
    {
        accessorKey: 'location',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="font-semibold"
                >
                    Location
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
    },
    {
        accessorKey: 'startDate',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="font-semibold"
                >
                    Start Date
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
        cell: ({ getValue }) => {
            const date = getValue() as Date
            return (
                <span>
                    {formatInTimeZone(
                        date,
                        Intl.DateTimeFormat().resolvedOptions().timeZone,
                        'yyyy-MM-dd',
                    )}
                </span>
            )
        },
        minSize: 35,
        maxSize: 35,
    },
    {
        accessorKey: 'endDate',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="font-semibold"
                >
                    End Date
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
        cell: ({ getValue }) => {
            const date = getValue() as Date
            return (
                <span>
                    {formatInTimeZone(
                        date,
                        Intl.DateTimeFormat().resolvedOptions().timeZone,
                        'yyyy-MM-dd',
                    )}
                </span>
            )
        },
        minSize: 35,
        maxSize: 35,
    },
    {
        id: 'actions',
        cell: ({ row }) => <ConventionTableRowActions row={row} />,
        minSize: 50,
        maxSize: 50,
    },
]
