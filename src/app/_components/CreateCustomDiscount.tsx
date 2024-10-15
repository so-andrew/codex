'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'
import GenericDialog from './dialogs/GenericDialog'
import CreateCustomDiscountForm from './forms/CreateCustomDiscountForm'

export default function CreateCustomDiscount({
    conventionId,
}: {
    conventionId: number
}) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <GenericDialog
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                title="Add Custom Discount"
            >
                <CreateCustomDiscountForm
                    conventionId={conventionId}
                    setIsOpen={setIsOpen}
                />
            </GenericDialog>
            <Button
                variant="secondary"
                className="font-semibold"
                onClick={() => setIsOpen(!isOpen)}
            >
                Add Custom Discount
            </Button>
        </>
    )
}
