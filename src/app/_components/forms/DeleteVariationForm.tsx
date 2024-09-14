'use client'

import { deleteVariation } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { type Dispatch, type SetStateAction } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
    id: z.number(),
    productId: z.number(),
    creatorId: z.string(),
})

export default function DeleteVariationForm({
    id,
    productId,
    creatorId,
    setIsOpen,
}: {
    id: number
    productId: number
    creatorId: string
    setIsOpen: Dispatch<SetStateAction<boolean>>
}) {
    const { toast } = useToast()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: id,
            productId: productId,
            creatorId: creatorId,
        },
    })

    const { reset } = form
    const isLoading = form.formState.isSubmitting

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            await deleteVariation(data)
            reset({}, { keepValues: true })
            toast({
                title: 'Success',
                description: 'Successfully deleted variation.',
            })
        } catch (e) {
            const error = e as Error
            toast({
                title: error.name,
                description: error.message,
            })
        }
        setIsOpen(false)
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
