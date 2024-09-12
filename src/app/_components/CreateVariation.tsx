'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { type ProductData } from '~/server/db/schema'
import GenericDialog from './dialogs/GenericDialog'
import CreateVariationForm from './forms/CreateVariationForm'

export default function CreateVariation({ product }: { product: ProductData }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <GenericDialog
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                title="Add Variation"
            >
                <CreateVariationForm data={product} setIsOpen={setIsOpen} />
            </GenericDialog>
            <Button
                className="bg-purple-500 font-semibold hover:bg-purple-600"
                onClick={() => setIsOpen(!isOpen)}
            >
                Add Variation
            </Button>
        </>
    )
}
