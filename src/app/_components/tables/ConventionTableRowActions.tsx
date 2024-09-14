'use client'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Convention } from '@/server/db/schema'
import { type Row } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import GenericDialog from '../dialogs/GenericDialog'
import DeleteConventionForm from '../forms/DeleteConventionForm'

interface ConventionTableRowActionsProps<TData extends Convention> {
    row: Row<TData>
}

export default function ConventionTableRowActions<TData extends Convention>({
    row,
}: ConventionTableRowActionsProps<TData>) {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const id = row.original.id
    const creatorId = row.original.creatorId
    const name = row.original.name

    return (
        <>
            <GenericDialog
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                title="Delete Convention"
                description={`Are you sure you want to delete convention ${name}?`}
            >
                <DeleteConventionForm
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
