import { Button } from '@/components/ui/button'
import { type Discount } from '@/server/db/schema'
import { type Row } from '@tanstack/react-table'
import { useState } from 'react'
import GenericDialog from '../dialogs/GenericDialog'
import EditDiscountForm from '../forms/EditDiscountForm'

interface EditDiscountButtonProps<TData extends Discount> {
    row: Row<TData>
}

export default function EditDiscountButton<TData extends Discount>({
    row,
}: EditDiscountButtonProps<TData>) {
    const [isEditOpen, setIsEditOpen] = useState(false)
    const discount = {
        ...row.original,
        amount: parseFloat(row.original.amount),
    }

    return (
        <>
            <GenericDialog
                isOpen={isEditOpen}
                setIsOpen={setIsEditOpen}
                title="Edit Discount"
                className="sm:max-w-lg p-8"
            >
                <EditDiscountForm data={discount} setIsOpen={setIsEditOpen} />
            </GenericDialog>
            <Button
                variant="ghost"
                className="hover:bg-transparent p-0 text-blue-500"
                onClick={() => setIsEditOpen(!isEditOpen)}
            >
                {row.getValue('name')}
            </Button>
        </>
    )
}
