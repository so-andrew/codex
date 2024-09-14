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
import { type ProductVariation } from '@/server/db/schema'
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnFiltersState,
    type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import GenericDialog from '../dialogs/GenericDialog'
import BulkDeleteVariationForm from '../forms/BulkDeleteVariationForm'
import BulkEditVariationPriceForm from '../forms/BulkEditVariationPriceForm'
import { columns } from './VariationColumns'

export default function VariationTable({ data }: { data: ProductVariation[] }) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [rowSelection, setRowSelection] = useState({})
    const [isEditPricesOpen, setIsEditPricesOpen] = useState(false)
    const [isDeleteVariationsOpen, setIsDeleteVariationsOpen] = useState(false)
    //const [editVariation, setEditVariation] = useState<ProductVariation | null>(null)

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        enableRowSelection: true,
        state: {
            sorting,
            columnFilters,
            rowSelection,
        },
    })

    const selectedRowsCount = Object.keys(rowSelection).length

    const getSelectedVariations = () => {
        const selectedRows = table.getSelectedRowModel().flatRows
        return selectedRows.map((row) => row.original)
    }

    // const handleRowClick = (
    //     e: React.MouseEvent,
    //     variation: ProductVariation,
    // ) => {
    //     console.log(e)
    //     console.log(e.target)
    //     console.log(e.target instanceof HTMLElement)

    //     if (
    //         e.target instanceof HTMLElement &&
    //         (e.target.closest('input[type="checkbox"]') ||
    //             e.target.closest('label') ||
    //             e.target.closest('button') ||
    //             e.target.closest('div') ||
    //             e.target.closest('svg'))
    //     ) {
    //         return
    //     }
    //     console.log(`Setting variation to ${variation.name}`)
    //     setEditVariation(variation)
    // }

    // const clearEditVariation = () => {
    //     console.log('Setting variation to null')
    //     setEditVariation(null)
    // }

    return (
        <div className="relative min-h-screen pb-24">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter variations..."
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
                                                minWidth:
                                                    header.column.columnDef
                                                        .minSize,
                                                maxWidth:
                                                    header.column.columnDef
                                                        .maxSize,
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
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }
                                    // onClick={(e) =>
                                    //     handleRowClick(e, row.original)
                                    // }
                                    className="cursor-pointer even:bg-slate-200/40"
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
                        <Button
                            variant="outline"
                            onClick={() =>
                                setIsEditPricesOpen(!isEditPricesOpen)
                            }
                        >
                            Edit Prices
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                setIsDeleteVariationsOpen(
                                    !isDeleteVariationsOpen,
                                )
                            }
                        >
                            Delete Variations
                        </Button>
                    </div>
                </div>
            )}
            {/* <GenericDialog
                isOpen={!!editVariation}
                setIsOpen={clearEditVariation}
                title="Edit Variation"
            >
                <EditVariationForm
                    id={editVariation ? editVariation.id : -1}
                    creatorId={editVariation ? editVariation.creatorId : ''}
                    productId={editVariation ? editVariation.productId : -1}
                    name={editVariation ? editVariation.name : ''}
                    price={editVariation ? parseInt(editVariation.price) : 0}
                    sku={
                        editVariation
                            ? (editVariation.sku ?? undefined)
                            : undefined
                    }
                    setIsOpen={clearEditVariation}
                />
            </GenericDialog> */}

            {/* <Dialog
                open={!!editVariation}
                onOpenChange={() => setEditVariation(null)}
            >
                <DialogContent
                    className="sm-max-w-[800px]"
                    aria-describedby={undefined}
                >
                    <DialogHeader className="space-y-4">
                        Edit Variation
                    </DialogHeader>
                    <EditVariationForm
                        id={editVariation ? editVariation.id : -1}
                        creatorId={editVariation ? editVariation.creatorId : ''}
                        productId={editVariation ? editVariation.productId : -1}
                        name={editVariation ? editVariation.name : ''}
                        price={
                            editVariation ? parseInt(editVariation.price) : 0
                        }
                        sku={
                            editVariation
                                ? (editVariation.sku ?? undefined)
                                : undefined
                        }
                        setIsOpen={clearEditVariation}
                    />
                </DialogContent>
            </Dialog> */}
            <GenericDialog
                isOpen={isEditPricesOpen}
                setIsOpen={setIsEditPricesOpen}
                title="Edit Prices"
            >
                <BulkEditVariationPriceForm
                    data={getSelectedVariations()}
                    setIsOpen={setIsEditPricesOpen}
                />
            </GenericDialog>
            <GenericDialog
                isOpen={isDeleteVariationsOpen}
                setIsOpen={setIsDeleteVariationsOpen}
                title="Delete Variations"
                description={`Are you sure you want to delete ${selectedRowsCount} variation${selectedRowsCount !== 1 ? 's' : ''}?`}
            >
                <BulkDeleteVariationForm
                    data={getSelectedVariations()}
                    setIsOpen={setIsDeleteVariationsOpen}
                    toggleAllRowsSelected={table.toggleAllRowsSelected}
                />
            </GenericDialog>
        </div>
    )
}
