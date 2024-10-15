import { addCustomDiscount } from '@/app/actions'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { moneyFormat } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { type Dispatch, type SetStateAction, useReducer } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const customDiscountReportSchema = z.object({
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

export default function CreateCustomDiscountForm({
    conventionId,
    setIsOpen,
}: {
    conventionId: number
    setIsOpen: Dispatch<SetStateAction<boolean>>
}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [value, setValue] = useReducer((_: any, next: string) => {
        const digits = next.replace(/\D/g, '')
        return moneyFormat.format(Number(digits) / 100)
    }, '$0.00')

    const form = useForm<z.infer<typeof customDiscountReportSchema>>({
        resolver: zodResolver(customDiscountReportSchema),
        defaultValues: {
            name: 'Custom Discount',
            amount: 0,
            conventionId: conventionId,
        },
    })

    const { formState } = form
    const { isSubmitting } = formState

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    function handleChange(change: Function, formatted: string) {
        const digits = formatted.replace(/\D/g, '')
        const value = Number(digits) / 100
        change(value)
    }

    async function onSubmit(data: z.infer<typeof customDiscountReportSchema>) {
        console.log(data)
        await addCustomDiscount(data)
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
                                    placeholder="Enter discount name"
                                    {...field}
                                />
                            </FormControl>
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
                        </FormItem>
                    )}
                />
                <div className="flex flex-row gap-4 pt-4">
                    <Button
                        type="submit"
                        className="hover:bg-purple-600"
                        disabled={isSubmitting}
                    >
                        Create
                    </Button>
                </div>
            </form>
        </Form>
    )
}
