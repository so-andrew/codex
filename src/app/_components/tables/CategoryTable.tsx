'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { type Category } from '@/server/db/schema'
import { type CategoryTableRow } from '@/types'
import {
    type ColumnFiltersState,
    type ExpandedState,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import { columns } from './CategoryColumns'

export default function CategoryTable({
    data,
    categories,
}: {
    data: CategoryTableRow[]
    categories: Category[]
}) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [rowSelection, setRowSelection] = useState({})
    const [expanded, setExpanded] = useState<ExpandedState>({})

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        filterFromLeafRows: true,
        onRowSelectionChange: setRowSelection,
        onExpandedChange: setExpanded,
        getSubRows: (originalRow: CategoryTableRow) => {
            return originalRow.subcategories
        },
        state: {
            sorting,
            columnFilters,
            rowSelection,
            expanded,
        },
        meta: {
            categories: categories,
        },
    })

    const selectedRowsCount = Object.keys(rowSelection).length

    const getSelectedCategories = () => {
        const selectedRows = table.getSelectedRowModel().flatRows
        return selectedRows.map((row) => row.original.category)
    }

    return (
        <>
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter categories..."
                    value={
                        (table.getColumn('name')?.getFilterValue() as string) ??
                        ''
                    }
                    onChange={(event) =>
                        table
                            .getColumn('name')
                            ?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            style={{
                                                width:
                                                    header.id === 'name'
                                                        ? '65%'
                                                        : 'min-content',
                                            }}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="even:bg-gray-300/20"
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }
                                    //className={`pl-[${row.depth * 2}rem]`}
                                    style={{
                                        paddingLeft: `${row.depth * 2}rem`,
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="pl-6"
                                            style={{
                                                minWidth:
                                                    cell.column.columnDef
                                                        .minSize,
                                                maxWidth:
                                                    cell.column.columnDef
                                                        .maxSize,
                                            }}
                                            // style={{
                                            //     width: 'min-content',
                                            // }}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
            {selectedRowsCount > 0 && (
                <div
                    className="fixed bottom-0 left-1/4 right-1/4 flex items-center justify-between rounded-md border-t border-border bg-background p-4 shadow-lg transition-all duration-300 ease-in-out"
                    style={{
                        transform: `translateY(${selectedRowsCount > 0 ? '0' : '100%'})`,
                    }}
                >
                    <div className="flex flex-row items-center gap-4">
                        <div>
                            {selectedRowsCount} row
                            {selectedRowsCount !== 1 ? 's' : ''} selected
                        </div>
                        <Button
                            variant="ghost"
                            className="font-semibold text-purple-500"
                            onClick={() => table.toggleAllRowsSelected(false)}
                        >
                            Deselect all
                        </Button>
                    </div>
                    <div className="flex flex-row items-center gap-4">
                        {/* <Button
                            variant="outline"
                            onClick={() => {
                                console.log(getSelectedVariations())
                            }}
                        >
                            Console Log
                        </Button> */}
                        {/* <Button
                            variant="outline"
                            onClick={() =>
                                setIsEditPricesOpen(!isEditPricesOpen)
                            }
                        >
                            Edit Prices
                        </Button>*/}
                        {/* <Button
                           variant="destructive"
                           onClick={() =>
                               setIsDeleteProductsOpen(!isDeleteProductsOpen)
                           }
                       >
                           Delete Products
                       </Button> */}
                    </div>
                </div>
            )}
        </>
    )
}
