'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '~/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { type ProductData } from '~/server/db/schema'
import { createVariation } from '../actions'

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
})

export default function CreateVariation({ product }: { product: ProductData }) {
    const [isOpen, setIsOpen] = useState(false)

    const form = useForm<z.infer<typeof variationSchema>>({
        resolver: zodResolver(variationSchema),
        defaultValues: {
            name: 'New Variation',
            price: 0,
            productId: product.id,
            baseProductName: product.name,
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
        <div className="flex flex-row gap-4">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-purple-500 hover:bg-purple-600">
                        Add Variation
                    </Button>
                </DialogTrigger>
                <DialogContent
                    className="sm:max-w-[800px]"
                    aria-describedby={undefined}
                >
                    <DialogHeader>
                        <DialogTitle>Add Variation</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
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
                                            <Input
                                                placeholder="Enter price"
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
                                        <Input
                                            type="hidden"
                                            {...field}
                                            value={product.id}
                                        />
                                    </FormControl>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="baseProductName"
                                render={({ field }) => (
                                    <FormControl>
                                        <Input
                                            type="hidden"
                                            {...field}
                                            value={product.name}
                                        />
                                    </FormControl>
                                )}
                            />
                            <Button
                                type="submit"
                                className="bg-purple-500 hover:bg-purple-600"
                                disabled={isSubmitting}
                            >
                                Create
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
