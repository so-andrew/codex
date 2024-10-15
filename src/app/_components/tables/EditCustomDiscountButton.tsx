import { Button } from '@/components/ui/button'
import { type DiscountReport } from '@/types'
import { useState } from 'react'
import GenericDialog from '../dialogs/GenericDialog'
import EditCustomDiscountForm from '../forms/EditCustomDiscountForm'

export default function EditCustomDiscountButton({
    discount,
}: {
    discount: DiscountReport
}) {
    const [isEditOpen, setIsEditOpen] = useState(false)
    return (
        <>
            <GenericDialog
                isOpen={isEditOpen}
                setIsOpen={setIsEditOpen}
                title="Edit Custom Discount"
            >
                <EditCustomDiscountForm
                    discount={discount}
                    setIsOpen={setIsEditOpen}
                />
            </GenericDialog>
            <Button
                variant="ghost"
                className="hover:bg-transparent p-0 text-blue-500"
                onClick={() => setIsEditOpen(!isEditOpen)}
            >
                {discount.name}
            </Button>
        </>
    )
}
