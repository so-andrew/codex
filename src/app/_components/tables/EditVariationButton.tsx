'use client'

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
    const { id, creatorId, productId, name, price, sku } = row.original

    return (
        <>
            <GenericDialog
                isOpen={isEditOpen}
                setIsOpen={setIsEditOpen}
                title="Edit Variation"
            >
                <EditVariationForm
                    id={id}
                    creatorId={creatorId}
                    productId={productId}
                    name={name}
                    price={parseInt(price)}
                    sku={sku ?? undefined}
                    setIsOpen={setIsEditOpen}
                />
            </GenericDialog>
            <Button
                variant="ghost"
                className="p-0"
                onClick={() => setIsEditOpen(!isEditOpen)}
            >
                {row.getValue('name')}
            </Button>
        </>
    )
}
