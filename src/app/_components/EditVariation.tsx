import { DialogHeader } from '@/components/ui/dialog'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { formatAsCurrency } from '@/lib/utils'
import { type ProductVariation } from '@/server/db/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogTitle } from '@radix-ui/react-dialog'
import { useReducer } from 'react'
import { Button } from 'react-day-picker'
import { Form, useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
    id: z.number(),
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

export default function EditVariation({
    variation,
    isOpen,
    onOpenChange,
}: {
    variation: ProductVariation
    isOpen: boolean
    onOpenChange: () => void
}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [value, setValue] = useReducer((_: any, next: string) => {
        return formatAsCurrency(next)
    }, `\$${variation.price}`)

    const form = useForm<z.infer<typeof formSchema>>({
        mode: 'onChange',
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: variation.productId,
            name: variation.name,
            price: parseInt(variation.price),
        },
    })

    const { reset, formState } = form
    const { isDirty, isSubmitting } = formState
    const { toast } = useToast()

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    function handleChange(change: Function, formatted: string) {
        const digits = formatted.replace(/\D/g, '')
        const value = Number(digits) / 100
        change(value)
    }

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            //await EditVariation(data)
            reset({}, { keepValues: true })
            toast({
                title: 'Success',
                description: 'Successfully edited variation.',
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
        <div className="flex flex-row gap-6">
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent
                    className="sm:max-w-[800px]"
                    aria-describedby={undefined}
                >
                    <DialogHeader>
                        <DialogTitle>Edit Variation</DialogTitle>
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
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="$0.00"
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
                            <FormField
                                control={form.control}
                                name="id"
                                render={({ field }) => (
                                    <FormControl>
                                        <Input
                                            type="hidden"
                                            {...field}
                                            value={variation.productId}
                                        />
                                    </FormControl>
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
                </DialogContent>
            </Dialog>
        </div>
    )
}
