import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Discount } from '@/server/db/schema'
import { type Row } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import GenericDialog from '../dialogs/GenericDialog'
import DeleteDiscountForm from '../forms/DeleteDiscountForm'

interface DiscountTableRowActionsProps<TData extends Discount> {
    row: Row<TData>
}

export default function DiscountTableRowActions<TData extends Discount>({
    row,
}: DiscountTableRowActionsProps<TData>) {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const discount = row.original

    return (
        <>
            <GenericDialog
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                title="Delete"
                description={`Are you sure you want to delete discount ${discount.name}?`}
            >
                <DeleteDiscountForm
                    data={discount}
                    setIsOpen={setIsDeleteOpen}
                />
            </GenericDialog>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4"></MoreHorizontal>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsDeleteOpen(!isDeleteOpen)
                        }}
                        className="text-red-500"
                    >
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
