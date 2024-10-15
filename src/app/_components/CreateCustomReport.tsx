'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'
import GenericDialog from './dialogs/GenericDialog'
import CreateCustomReportForm from './forms/CreateCustomReportForm'

export default function CreateCustomReport({
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
                title="Add Custom Product"
            >
                <CreateCustomReportForm
                    conventionId={conventionId}
                    setIsOpen={setIsOpen}
                />
            </GenericDialog>
            <Button
                className="hover:bg-purple-600 font-semibold"
                onClick={() => setIsOpen(!isOpen)}
            >
                Add Custom Product
            </Button>
        </>
    )
}
