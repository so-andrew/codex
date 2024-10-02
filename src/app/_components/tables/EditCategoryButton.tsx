import { Button } from '@/components/ui/button'
import { type Category } from '@/server/db/schema'
import { type CategoryTableRow } from '@/types'
import { type Row, type TableMeta } from '@tanstack/react-table'
import { useState } from 'react'
import GenericDialog from '../dialogs/GenericDialog'
import EditCategoryForm from '../forms/EditCategoryForm'

interface EditCategoryButtonProps<TData extends CategoryTableRow> {
    row: Row<TData>
    meta: TableMeta<CategoryTableRow>
}

export default function EditCategoryButton<TData extends CategoryTableRow>({
    row,
    meta,
}: EditCategoryButtonProps<TData>) {
    const [isEditOpen, setIsEditOpen] = useState(false)
    const data = row.original.category
    const categories = Object.values(meta)[0] as Category[]

    return (
        <>
            <GenericDialog
                isOpen={isEditOpen}
                setIsOpen={setIsEditOpen}
                title="Edit Category"
            >
                <EditCategoryForm
                    data={data}
                    categories={categories}
                    setIsOpen={setIsEditOpen}
                ></EditCategoryForm>
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
