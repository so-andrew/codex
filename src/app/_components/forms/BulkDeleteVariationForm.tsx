import { zodResolver } from '@hookform/resolvers/zod'
import { Dispatch, SetStateAction } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { bulkDeleteVariation } from '~/app/actions'
import { Button } from '~/components/ui/button'
import { Form } from '~/components/ui/form'
import { useToast } from '~/hooks/use-toast'
import { ProductVariation } from '~/server/db/schema'

const formSchema = z.object({
    data: z.array(
        z.object({
            id: z.number(),
            productId: z.number(),
            creatorId: z.string(),
        }),
    ),
})

export default function BulkEditVariationPriceForm({
    data,
    setIsOpen,
    toggleAllRowsSelected,
}: {
    data: ProductVariation[]
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
            await bulkDeleteVariation(data)
            reset({}, { keepValues: true })
            setIsOpen(false)
            toggleAllRowsSelected(false)
            toast({
                title: 'Success',
                description: 'Successfully deleted variations.',
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
