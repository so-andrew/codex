'use client'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import GenericDialog from './dialogs/GenericDialog'
import CreateCustomDiscountForm from './forms/CreateCustomDiscountForm'
import CreateCustomReportForm from './forms/CreateCustomReportForm'

export default function CreateCustomReportDropdown({
    conventionId,
}: {
    conventionId: number
}) {
    const [isProductOpen, setIsProductOpen] = useState(false)
    const [isDiscountOpen, setIsDiscountOpen] = useState(false)

    return (
        <>
            <GenericDialog
                isOpen={isProductOpen}
                setIsOpen={setIsProductOpen}
                title="Add Custom Product"
                className="sm:max-w-lg p-8"
            >
                <CreateCustomReportForm
                    conventionId={conventionId}
                    setIsOpen={setIsProductOpen}
                />
            </GenericDialog>
            <GenericDialog
                isOpen={isDiscountOpen}
                setIsOpen={setIsDiscountOpen}
                title="Add Custom Discount"
                className="sm:max-w-lg p-8"
            >
                <CreateCustomDiscountForm
                    conventionId={conventionId}
                    setIsOpen={setIsDiscountOpen}
                />
            </GenericDialog>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-6 w-6"></MoreHorizontal>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsProductOpen(true)}>
                        Add Custom Product
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsDiscountOpen(true)}>
                        Add Custom Discount
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
