'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { moneyFormat } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useReducer, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createDiscount } from '../actions'

const formSchema = z.object({
    name: z
        .string()
        .min(2, { message: 'Must be at least 2 characters long' })
        .max(100, { message: 'Must be less than 100 characters long' }),
    amount: z.coerce
        .number({
            required_error: 'Price is required',
            invalid_type_error: 'Price must be a number',
        })
        .nonnegative(),
})

export default function CreateDiscount() {
    const [isOpen, setIsOpen] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [value, setValue] = useReducer((_: any, next: string) => {
        const digits = next.replace(/\D/g, '')
        return moneyFormat.format(Number(digits) / 100)
    }, '$0.00')

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: 'New Discount',
            amount: 0,
        },
    })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    function handleChange(change: Function, formatted: string) {
        const digits = formatted.replace(/\D/g, '')
        const value = Number(digits) / 100
        change(value)
    }

    async function onSubmit(data: z.infer<typeof formSchema>) {
        await createDiscount(data)
        setIsOpen(false)
    }

    return (
        <div className="flex flex-row gap-6">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-purple-500 hover:bg-purple-600">
                        Add Discount
                    </Button>
                </DialogTrigger>
                <DialogContent
                    className="sm:max-w-lg"
                    aria-describedby={undefined}
                >
                    <DialogHeader>
                        <DialogTitle>Add Discount</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col gap-2">
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter discount name"
                                                {...field}
                                            ></Input>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="$0.00"
                                                className="w-40"
                                                {...field}
                                                onChange={(event) => {
                                                    setValue(event.target.value)
                                                    handleChange(
                                                        field.onChange,
                                                        event.target.value,
                                                    )
                                                }}
                                                value={value}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Create</Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
