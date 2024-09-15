import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type CategoryTableRow } from '@/types'
import { type Row } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import GenericDialog from '../dialogs/GenericDialog'
import DeleteCategoryForm from '../forms/DeleteCategoryForm'

interface CategoryTableRowActionsProps<TData extends CategoryTableRow> {
    row: Row<TData>
}

export default function CategoryTableRowActions<
    TData extends CategoryTableRow,
>({ row }: CategoryTableRowActionsProps<TData>) {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const id = row.original.category.id
    const creatorId = row.original.category.creatorId

    return (
        <>
            <GenericDialog
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                title="Delete"
                description={
                    `Are you sure you want to delete category ${row.original.category.name}?` +
                    (row.subRows.length > 0
                        ? '\nThis will also delete all subcategories.'
                        : '')
                }
            >
                <DeleteCategoryForm
                    id={id}
                    creatorId={creatorId}
                    setIsOpen={setIsDeleteOpen}
                />
            </GenericDialog>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4"></MoreHorizontal>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={() => setIsDeleteOpen(true)}
                        className="text-red-500"
                    >
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
