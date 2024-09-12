'use client'

import { type Row } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { type ProductVariation } from '~/server/db/schema'
import GenericDialog from '../dialogs/GenericDialog'
import DeleteVariationForm from '../forms/DeleteVariationForm'

interface VariationTableRowActionsProps<TData extends ProductVariation> {
    row: Row<TData>
}

export default function VariationTableRowActions<
    TData extends ProductVariation,
>({ row }: VariationTableRowActionsProps<TData>) {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const id = row.original.id
    const creatorId = row.original.creatorId
    const productId = row.original.productId

    return (
        <>
            <GenericDialog
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                title="Delete"
                description={`Are you sure you want to delete variation ${row.original.name}?`}
            >
                <DeleteVariationForm
                    id={id}
                    productId={productId}
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