import { zodResolver } from '@hookform/resolvers/zod'
import { type Dispatch, type SetStateAction } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { useToast } from '~/hooks/use-toast'

const formSchema = z.object({
    id: z.number(),
    productId: z.number(),
    creatorId: z.string(),
    price: z.coerce
        .number({
            required_error: 'Price is required',
            invalid_type_error: 'Price must be a number',
        })
        .nonnegative(),
})

export default function EditVariationPriceForm({
    id,
    productId,
    creatorId,
    price,
    setIsOpen,
}: {
    id: number
    productId: number
    creatorId: string
    name: string
    price: number
    setIsOpen: Dispatch<SetStateAction<boolean>>
}) {
    const { toast } = useToast()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: id,
            productId: productId,
            creatorId: creatorId,
            price: price,
        },
    })

    const { formState, reset } = form
    const { isDirty, isSubmitting } = formState

    async function onSubmit(data: z.infer<typeof formSchema>) {
        console.log(data)
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col space-y-4"
            >
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                                <Input placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex flex-row gap-4 pt-4">
                    <Button
                        type="submit"
                        className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600"
                        disabled={!isDirty || isSubmitting}
                    >
                        Save
                    </Button>
                </div>
            </form>
        </Form>
    )
}
