import GenericDialog from '@/app/_components/dialogs/GenericDialog'
import EditVariationForm from '@/app/_components/forms/EditVariationForm'
import { Button } from '@/components/ui/button'
import { type ProductVariation } from '@/server/db/schema'
import { type Row } from '@tanstack/react-table'
import { useState } from 'react'

interface EditVariationButtonProps<TData extends ProductVariation> {
    row: Row<TData>
}

export default function EditVariationButton<TData extends ProductVariation>({
    row,
}: EditVariationButtonProps<TData>) {
    const [isEditOpen, setIsEditOpen] = useState(false)
    const variation = {
        ...row.original,
        price: parseFloat(row.original.price),
        sku: row.original.sku ?? undefined,
    }

    return (
        <>
            <GenericDialog
                isOpen={isEditOpen}
                setIsOpen={setIsEditOpen}
                title="Edit Variation"
                className="sm:max-w-lg p-8"
            >
                <EditVariationForm data={variation} setIsOpen={setIsEditOpen} />
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
