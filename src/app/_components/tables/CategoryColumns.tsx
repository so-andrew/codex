import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { type CategoryTableRow } from '@/types'
import { type ColumnDef } from '@tanstack/react-table'
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ChevronDown,
    ChevronUp,
} from 'lucide-react'
import CategoryTableRowActions from './CategoryTableRowActions'
import EditCategoryButton from './EditCategoryButton'

export const columns: ColumnDef<CategoryTableRow>[] = [
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
        accessorFn: (row) => row.category.name,
        id: 'name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="ml-6 font-semibold"
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
        cell: ({ row, table }) => {
            //const category = row.original.category
            return (
                <div
                    className="flex items-center font-medium"
                    style={{
                        paddingLeft: `${row.depth * 2}rem`,
                    }}
                >
                    {row.getCanExpand() ? (
                        <Button
                            variant="ghost"
                            className="ml-[-1rem] mr-2 px-2 focus:outline-none"
                            onClick={row.getToggleExpandedHandler()}
                        >
                            {row.getIsExpanded() ? (
                                <ChevronUp className="h-4 w-4 text-purple-500" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-purple-500" />
                            )}
                        </Button>
                    ) : (
                        <span className="mr-2 h-4 w-4"></span>
                    )}
                    <EditCategoryButton row={row} meta={table.options.meta!} />
                </div>
                // row.depth === 0 ? (
                //     <Link href={`/dashboard/products/${product.id}`}>
                //         {product.name} {row.depth}
                //     </Link>
                // ) : (
                //     <span className="ml-4">{product.name}</span>
                // )
            )
        },
    },
    {
        accessorFn: (row) => row.category.productCount,
        id: 'count',
        header: ({ column }) => {
            return (
                <>
                    {/* <span className="mr-6 h-4 w-4"></span> */}
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                        className="text-right font-semibold"
                    >
                        Items
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
            const category = row.original.category
            return <div className="pl-12">{category.productCount}</div>
        },
        minSize: 20,
        maxSize: 20,
        size: 20,
    },
    {
        id: 'actions',
        cell: ({ row }) => <CategoryTableRowActions row={row} />,
        minSize: 35,
        maxSize: 35,
        size: 35,
    },
]
