import { bulkEditVariation } from '@/app/actions'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { currencyDisplayHandleChange, formatAsCurrency } from '@/lib/utils'
import { type ProductVariation } from '@/server/db/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useReducer, type Dispatch, type SetStateAction } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
    data: z.array(
        z.object({
            id: z.number(),
            productId: z.number(),
            creatorId: z.string(),
        }),
    ),
    price: z.coerce
        .number({
            required_error: 'Price is required',
            invalid_type_error: 'Price must be a number',
        })
        .nonnegative(),
})

export default function BulkEditVariationPriceForm({
    data,
    setIsOpen,
}: {
    data: ProductVariation[]
    setIsOpen: Dispatch<SetStateAction<boolean>>
}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [value, setValue] = useReducer((_: any, next: string) => {
        return formatAsCurrency(next)
    }, '')

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            data: data,
            price: 0,
        },
    })

    const { toast } = useToast()
    const { formState, reset } = form
    const { isDirty, isSubmitting } = formState

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            await bulkEditVariation(data)
            reset({}, { keepValues: true })
            setIsOpen(false)
            toast({
                title: 'Success',
                description: 'Successfully edited product.',
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
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col space-y-6"
            >
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter price"
                                    {...field}
                                    onChange={(event) => {
                                        setValue(event.target.value)
                                        currencyDisplayHandleChange(
                                            field.onChange,
                                            event.target.value,
                                        )
                                    }}
                                    value={`${value.length > 0 ? '$' : ''}${value}`}
                                />
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
