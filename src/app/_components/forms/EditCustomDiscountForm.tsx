import { editCustomDiscount } from '@/app/actions'
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
import { type DiscountReport } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { type Dispatch, type SetStateAction, useReducer } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const customDiscountReportSchema = z.object({
    id: z.number(),
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
    conventionId: z.number(),
})

export default function EditCustomDiscountForm({
    discount,
    setIsOpen,
}: {
    discount: DiscountReport
    setIsOpen: Dispatch<SetStateAction<boolean>>
}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [value, setValue] = useReducer(
        (_: unknown, next: string) => {
            return formatAsCurrency(next)
        },
        moneyFormat.format(parseFloat(discount.amount)).slice(1),
    )

    const form = useForm<z.infer<typeof customDiscountReportSchema>>({
        resolver: zodResolver(customDiscountReportSchema),
        defaultValues: {
            id: discount.id,
            name: discount.name,
            amount: parseFloat(discount.amount),
            conventionId: discount.conventionId,
        },
    })

    const { reset, formState } = form
    const { isSubmitting } = formState

    async function onSubmit(data: z.infer<typeof customDiscountReportSchema>) {
        await editCustomDiscount(data)
        setIsOpen(false)
        reset({}, { keepValues: false })
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
                        className="hover:bg-purple-600"
                        disabled={isSubmitting}
                    >
                        Save
                    </Button>
                </div>
            </form>
        </Form>
    )
}
