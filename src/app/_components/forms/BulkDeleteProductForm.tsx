import { bulkDeleteProduct } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { type Product } from '@/server/db/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { type Dispatch, type SetStateAction } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
    data: z.array(
        z.object({
            id: z.number(),
            creatorId: z.string(),
        }),
    ),
})

export default function BulkDeleteProductForm({
    data,
    setIsOpen,
    toggleAllRowsSelected,
}: {
    data: Product[]
    setIsOpen: Dispatch<SetStateAction<boolean>>
    toggleAllRowsSelected: (arg: boolean) => void
}) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            data: data,
        },
    })

    const { toast } = useToast()
    const { formState, reset } = form
    const { isSubmitting } = formState

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            await bulkDeleteProduct(data)
            reset({}, { keepValues: true })
            setIsOpen(false)
            toggleAllRowsSelected(false)
            toast({
                title: 'Success',
                description: 'Successfully deleted products.',
            })
        } catch (e) {
            const error = e as Error
            toast({
                title: error.name,
                description: error.message,
            })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex w-full flex-row justify-center sm:space-x-6">
                    <Button
                        variant="outline"
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setIsOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="bg-red-500 hover:bg-red-600"
                        disabled={isSubmitting}
                    >
                        Delete
                    </Button>
                </div>
            </form>
        </Form>
    )
}
