import { deleteConvention } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dispatch, SetStateAction } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
    id: z.number(),
    creatorId: z.string(),
})

export default function DeleteConventionForm({
    id,
    creatorId,
    setIsOpen,
}: {
    id: number
    creatorId: string
    setIsOpen: Dispatch<SetStateAction<boolean>>
}) {
    const { toast } = useToast()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: id,
            creatorId: creatorId,
        },
    })

    const { reset } = form
    const isLoading = form.formState.isSubmitting

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            await deleteConvention(data)
            reset({}, { keepValues: true })
            setIsOpen(false)
            toast({
                title: 'Success',
                description: 'Successfully deleted convention.',
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
                        disabled={isLoading}
                        onClick={() => setIsOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="bg-red-500 hover:bg-red-600"
                        disabled={isLoading}
                    >
                        Delete
                    </Button>
                </div>
            </form>
        </Form>
    )
}
