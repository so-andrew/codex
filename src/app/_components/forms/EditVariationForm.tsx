import { editVariation } from '@/app/actions'
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
import { formatAsCurrency, moneyFormat } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useReducer, type Dispatch, type SetStateAction } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
    id: z.number(),
    productId: z.number(),
    creatorId: z.string(),
    name: z
        .string()
        .min(2, { message: 'Must be at least 2 characters long' })
        .max(100, { message: 'Must be less than 100 characters long' }),
    price: z.coerce
        .number({
            required_error: 'Price is required',
            invalid_type_error: 'Price must be a number',
        })
        .nonnegative(),
    sku: z
        .string()
        .min(4, { message: 'Must be at least 4 characters long' })
        .max(25, { message: 'Must be less that 25 characters long' })
        .optional(),
})

export default function EditVariationForm({
    data,
    setIsOpen,
}: {
    data: z.infer<typeof formSchema>
    setIsOpen: (() => void) | Dispatch<SetStateAction<boolean>>
}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [value, setValue] = useReducer((_: any, next: string) => {
        return formatAsCurrency(next)
    }, moneyFormat.format(data.price).slice(1))

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: data.id,
            productId: data.productId,
            creatorId: data.creatorId,
            name: data.name,
            price: data.price,
            sku: data.sku ?? undefined,
        },
    })

    const { formState, reset } = form
    const { isDirty, isSubmitting } = formState
    const { toast } = useToast()

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    function handleChange(change: Function, formatted: string) {
        const digits = formatAsCurrency(formatted)
        const value = Number(parseFloat(digits).toFixed(2))
        change(value)
    }

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            await editVariation(data)
            reset({}, { keepValues: true })
            if (typeof setIsOpen === 'function') {
                setIsOpen(false)
            }
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
                className="space-y-6 pt-2"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter product name"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex flex-row gap-8 justify-between">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem className="w-40">
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter price"
                                        {...field}
                                        onChange={(event) => {
                                            setValue(event.target.value)
                                            handleChange(
                                                field.onChange,
                                                event.target.value,
                                            )
                                        }}
                                        onBlur={(event) => {
                                            const digits = formatAsCurrency(
                                                event.target.value,
                                            )
                                            const rounded = Number(
                                                parseFloat(digits).toFixed(2),
                                            )
                                            setValue(
                                                moneyFormat.format(rounded),
                                            )
                                        }}
                                        value={`${value.length > 0 ? '$' : ''}${value}`}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                            <FormItem className="flex-grow">
                                <FormLabel>SKU</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter SKU (optional)"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex flex-row gap-4 pt-2">
                    <Button
                        type="submit"
                        className="hover:bg-purple-600 disabled:bg-gray-600"
                        disabled={!isDirty || isSubmitting}
                    >
                        Save
                    </Button>
                </div>
            </form>
        </Form>
    )
}
