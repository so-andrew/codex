'use client'

import GenericDialog from '@/app/_components/dialogs/GenericDialog'
import CreateVariationForm from '@/app/_components/forms/CreateVariationForm'
import { Button } from '@/components/ui/button'
import { type Product } from '@/server/db/schema'
import { useState } from 'react'

export default function CreateVariation({ product }: { product: Product }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <GenericDialog
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                title="Add Variation"
                className="sm:max-w-lg p-8"
            >
                <CreateVariationForm data={product} setIsOpen={setIsOpen} />
            </GenericDialog>
            <Button
                className="font-semibold hover:bg-purple-600"
                onClick={() => setIsOpen(!isOpen)}
            >
                Add Variation
            </Button>
        </>
    )
}
