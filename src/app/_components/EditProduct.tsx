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
    FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { useToast } from '~/hooks/use-toast'
import { type ProductData } from '~/server/db/schema'
import { editProduct } from '../actions'

const formSchema = z.object({
    id: z.number(),
    name: z
        .string()
        .min(2, { message: 'Must be at least 2 characters long' })
        .max(100, { message: 'Must be less than 100 characters long' }),
    category: z.string().optional(),
})

type EditProductProps = {
    product: ProductData
}

export default function EditProduct({ product }: EditProductProps) {
    const [isOpen, setIsOpen] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        mode: 'onChange',
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: product.id,
            name: product.name,
            category: product.category ?? 'Uncategorized',
        },
    })

    const { reset, formState } = form
    const { isDirty, isSubmitting } = formState

    const { toast } = useToast()

    async function onSubmit(data: z.infer<typeof formSchema>) {
        console.log(data)
        try {
            await editProduct(data)
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
        <div className="flex flex-row gap-4">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-purple-500 hover:bg-purple-600">
                        Edit Product
                    </Button>
                </DialogTrigger>
                <DialogContent
                    className="sm:max-w-[800px]"
                    aria-describedby={undefined}
                >
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex flex-col space-y-4"
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
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Uncategorized"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* {variationCount === 1 && (
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="0.00"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )} */}
                            <FormField
                                control={form.control}
                                name="id"
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
                            {/* {variationCount > 0 &&
                        fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="flex flex-row items-end gap-8"
                            >
                                <FormField
                                    control={form.control}
                                    key={index}
                                    name={`variations.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Variation Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    key={index + 1}
                                    name={`variations.${index}.price`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="button"
                                    onClick={() => removeVariation(index)}
                                >
                                    Remove
                                </Button>
                            </div>
                        ))} */}
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
                </DialogContent>
            </Dialog>
        </div>
    )
}