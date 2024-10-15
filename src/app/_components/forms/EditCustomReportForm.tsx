import { editCustomReport } from '@/app/actions'
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
import { type ReportType } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { type Dispatch, type SetStateAction, useReducer } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const customProductReportSchema = z.object({
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
    conventionId: z.number(),
})

export default function EditCustomReportForm({
    report,
    setIsOpen,
}: {
    report: ReportType
    setIsOpen: Dispatch<SetStateAction<boolean>>
}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [value, setValue] = useReducer(
        (_: unknown, next: string) => {
            const digits = next.replace(/\D/g, '')
            return moneyFormat.format(Number(digits) / 100)
        },
        moneyFormat.format(parseFloat(report.price)),
    )

    const form = useForm<z.infer<typeof customProductReportSchema>>({
        resolver: zodResolver(customProductReportSchema),
        defaultValues: {
            id: report.id,
            name: report.name,
            price: parseFloat(report.price),
            conventionId: report.conventionId,
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

    async function onSubmit(data: z.infer<typeof customProductReportSchema>) {
        console.log(data)
        await editCustomReport(data)
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
                                    placeholder="Enter product name"
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
                        Save
                    </Button>
                </div>
            </form>
        </Form>
    )
}
