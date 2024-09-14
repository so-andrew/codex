'use client'

import { deleteConvention } from '@/app/actions'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Convention } from '@/server/db/schema'
import { MoreHorizontal } from 'lucide-react'

export default function ConventionDropdownMenu({
    convention,
}: {
    convention: Convention
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4"></MoreHorizontal>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() =>
                        navigator.clipboard.writeText(convention.id.toString())
                    }
                >
                    Copy Convention ID
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => deleteConvention(convention)}
                    className="text-red-500"
                >
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
