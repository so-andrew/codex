import { editDiscount } from '@/app/actions'
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
import {
    currencyDisplayHandleChange,
    formatAsCurrency,
    moneyFormat,
} from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { type Dispatch, type SetStateAction, useReducer } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
    id: z.number(),
    creatorId: z.string(),
    name: z
        .string()
        .min(2, { message: 'Must be at least 2 characters long' })
        .max(100, { message: 'Must be less than 100 characters long' }),
    amount: z.coerce
        .number({
            required_error: 'Amount is required',
            invalid_type_error: 'Amount must be a number',
        })
        .nonnegative(),
})

export default function EditDiscountForm({
    data,
    setIsOpen,
}: {
    data: z.infer<typeof formSchema>
    setIsOpen: Dispatch<SetStateAction<boolean>>
}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [value, setValue] = useReducer((_: any, next: string) => {
        return formatAsCurrency(next)
    }, moneyFormat.format(data.amount).slice(1))

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: data.id,
            creatorId: data.creatorId,
            name: data.name,
            amount: data.amount,
        },
    })

    const { formState, reset } = form
    const { isDirty, isSubmitting } = formState
    const { toast } = useToast()

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            await editDiscount(data)
            reset({}, { keepValues: true })

            toast({
                title: 'Success',
                description: 'Successfully edited discount.',
            })
        } catch (e) {
            const error = e as Error
            toast({
                title: error.name,
                description: error.message,
            })
        }
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
                                    placeholder="Enter discount name"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem className="w-40">
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter amount"
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
                                        setValue(moneyFormat.format(rounded))
                                    }}
                                    value={`${value.length > 0 ? '$' : ''}${value}`}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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
