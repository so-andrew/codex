'use client'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { type TopSellingVariations } from '@/types'
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type PaginationState,
    type SortingState,
    useReactTable,
} from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { useMediaQuery } from 'usehooks-ts'
import { columns } from './ProductSalesColumns'

export default function ProductSalesTable({
    data,
}: {
    data: TopSellingVariations[]
}) {
    const isTablet = useMediaQuery('(min-width:768px)', {
        initializeWithValue: false,
    })

    const [sorting, setSorting] = useState<SortingState>([])
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 5,
    })

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
            pagination,
        },
        initialState: {
            sorting: [{ id: 'revenue', desc: true }],
        },
    })

    useEffect(() => {
        setPagination({
            pageIndex: pagination.pageIndex,
            pageSize: isTablet ? 8 : 5,
        })
    }, [isTablet, pagination.pageIndex])

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            // style={{
                                            //     width:
                                            //         header.id === 'name'
                                            //             ? '50%'
                                            //             : 'min-content',
                                            // }}
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
                        {table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                className="even:bg-gray-300/20"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="pl-6">
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 mt-4">
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
        </>
    )
}
