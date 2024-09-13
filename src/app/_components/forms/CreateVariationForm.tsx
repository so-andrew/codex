import { zodResolver } from '@hookform/resolvers/zod'
import { type Dispatch, type SetStateAction } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createVariation } from '~/app/actions'
import { Button } from '~/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { type Product } from '~/server/db/schema'

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
    const form = useForm<z.infer<typeof variationSchema>>({
        resolver: zodResolver(variationSchema),
        defaultValues: {
            name: 'New Variation',
            price: 0,
            productId: data.id,
            baseProductName: data.name,
        },
    })

    const { formState } = form
    const { isSubmitting } = formState

    async function onSubmit(data: z.infer<typeof variationSchema>) {
        console.log(data)
        await createVariation(data)
        setIsOpen(false)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter price" {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>SKU</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter SKU (optional)"
                                    {...field}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="productId"
                    render={({ field }) => (
                        <FormControl>
                            <Input type="hidden" {...field} value={data.id} />
                        </FormControl>
                    )}
                />
                <FormField
                    control={form.control}
                    name="baseProductName"
                    render={({ field }) => (
                        <FormControl>
                            <Input type="hidden" {...field} value={data.name} />
                        </FormControl>
                    )}
                />
                <div className="flex flex-row gap-4 pt-4">
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
