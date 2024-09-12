'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
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
import { createProduct } from '../actions'

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
})

// const schemaWithNoVariations = z.object({
//     name: z
//         .string()
//         .min(2, { message: 'Must be at least 2 characters long' })
//         .max(100, { message: 'Must be less than 100 characters long' }),
//     category: z.string().optional(),
//     price: z.coerce
//         .number({
//             required_error: 'Price is required',
//             invalid_type_error: 'Price must be a number',
//         })
//         .nonnegative(),
//     hasVariations: z.literal(false),
// })

// const schemaWithVariations = z.object({
//     name: z
//         .string()
//         .min(2, { message: 'Must be at least 2 characters long' })
//         .max(100, { message: 'Must be less than 100 characters long' }),
//     category: z.string().optional(),
//     variations: z.array(variationSchema).nonempty(),
//     hasVariations: z.literal(true),
// })

// const formSchema = z.discriminatedUnion('hasVariations', [
//     schemaWithVariations,
//     schemaWithNoVariations,
// ])

const formSchema = z.object({
    name: z
        .string()
        .min(2, { message: 'Must be at least 2 characters long' })
        .max(100, { message: 'Must be less than 100 characters long' }),
    category: z.string().optional(),
    price: z.coerce
        .number({
            invalid_type_error: 'Price must be a number',
        })
        .nonnegative(),
    variations: z.array(variationSchema),
})

//type FormSchema = z.infer<typeof formSchema>

export default function CreateProduct() {
    const [isOpen, setIsOpen] = useState(false)
    const [variationCount, setVariationCount] = useState(0)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            category: '',
            price: 0,
            variations: [],
        },
    })

    //const { register, control } = form
    const { formState } = form
    const { isSubmitting } = formState

    const { fields, append, remove } = useFieldArray({
        name: 'variations',
        control: form.control,
    })

    function addVariation() {
        setVariationCount(variationCount + 1)
        append({ name: `New Variation`, price: 0 })
    }

    function removeVariation(index: number) {
        setVariationCount((variationCount) => Math.max(0, variationCount - 1))
        remove(index)
    }

    async function onSubmit(data: z.infer<typeof formSchema>) {
        console.log(data)
        await createProduct(data)
        setVariationCount(0)
        remove()
        setIsOpen(false)
    }

    return (
        <div className="flex flex-row gap-4">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-purple-500 hover:bg-purple-600">
                        Add Product
                    </Button>
                </DialogTrigger>
                <DialogContent
                    className="sm:max-w-[800px]"
                    aria-describedby={undefined}
                >
                    <DialogHeader>
                        <DialogTitle>Add Product</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            // action={async (formData) => {
                            //     console.log(formData)
                            //     await createProduct(formData)
                            //     setVariationCount(0)
                            //     //remove()
                            //     setIsOpen(false)
                            // }}
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
                            {/* <FormField
                                control={form.control}
                                name="hasVariations"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                type="hidden"
                                                {...field}
                                                value={(
                                                    variationCount > 0
                                                ).toString()}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            /> */}
                            {variationCount === 0 && (
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
                            )}

                            {variationCount > 0 &&
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
                                                    <FormLabel>
                                                        Variation Name
                                                    </FormLabel>
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
                                            onClick={() =>
                                                removeVariation(index)
                                            }
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}

                            <div className="flex flex-row gap-4 pt-4">
                                <Button type="button" onClick={addVariation}>
                                    Add Variation
                                </Button>
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
                </DialogContent>
            </Dialog>
        </div>
    )
}
