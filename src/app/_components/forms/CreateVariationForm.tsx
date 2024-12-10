import { createVariation } from '@/app/actions'
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
import {
    currencyDisplayHandleChange,
    formatAsCurrency,
    moneyFormat,
} from '@/lib/utils'
import { type Product } from '@/server/db/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useReducer, type Dispatch, type SetStateAction } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const variationSchema = z.object({
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
    productId: z.number(),
    baseProductName: z.string(),
    sku: z
        .string()
        .min(4, { message: 'Must be at least 4 characters long' })
        .max(25, { message: 'Must be less that 25 characters long' })
        .optional(),
})

export default function CreateVariationForm({
    data,
    setIsOpen,
}: {
    data: Product
    setIsOpen: Dispatch<SetStateAction<boolean>>
}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [value, setValue] = useReducer((_: any, next: string) => {
        return formatAsCurrency(next)
    }, '')

    const form = useForm<z.infer<typeof variationSchema>>({
        resolver: zodResolver(variationSchema),
        defaultValues: {
            name: 'New Variation',
            price: 0,
            productId: data.id,
            baseProductName: data.name,
        },
    })

    const { reset, formState } = form
    const { isSubmitting } = formState

    async function onSubmit(data: z.infer<typeof variationSchema>) {
        await createVariation(data)
        setIsOpen(false)
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
                                    placeholder="Enter variation name"
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
                                            currencyDisplayHandleChange(
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
                        className="bg-purple-500 hover:bg-purple-600"
                        disabled={isSubmitting}
                    >
                        Create
                    </Button>
                </div>
            </form>
        </Form>
    )
}
