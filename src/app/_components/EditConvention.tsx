'use client'
import { editConvention } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { type Convention } from '@/server/db/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { differenceInCalendarDays, format, isEqual } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z
    .object({
        id: z.number(),
        name: z
            .string()
            .min(2, { message: 'Must be at least 2 characters long' })
            .max(100, { message: 'Must be less than 100 characters long' }),
        location: z
            .string()
            .min(2, { message: 'Must be at least 2 characters long' })
            .max(100, { message: 'Must be less than 100 characters long' }),
        length: z.number(),
        dateRange: z.object(
            {
                from: z.date(),
                to: z.date().optional(),
            },
            {
                required_error: 'Date range required',
            },
        ),
        protectEdits: z.boolean(),
        // .refine((data) => data.from <= data.to, {
        //     message: 'Start date must be before or equal to end date',
        //     path: ['dateRange'],
        // }),
    })
    .refine(
        (schema) => {
            return schema.dateRange.to
                ? differenceInCalendarDays(
                      schema.dateRange.to,
                      schema.dateRange.from,
                  ) +
                      1 ===
                      schema.length
                : schema.length === 1
        },
        {
            message:
                'Cannot change length of convention here, please create a new convention.',
            path: ['dateRange'],
        },
    )

export default function EditConvention({
    convention,
}: {
    convention: Convention
}) {
    const [isOpen, setIsOpen] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        mode: 'onChange',
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: convention.id,
            name: convention.name,
            location: convention.location,
            length: convention.length,
            dateRange: {
                from: convention.startDate,
                to: convention.endDate,
            },
            protectEdits: convention.protectEdits,
        },
    })

    const { reset, formState } = form
    const { isDirty, isSubmitting, isValid } = formState

    const { toast } = useToast()

    async function onSubmit(data: z.infer<typeof formSchema>) {
        console.log(data)
        try {
            await editConvention(data)
            reset({}, { keepValues: true })
            setIsOpen(false)
            toast({
                title: 'Success',
                description: 'Successfully edited convention.',
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
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    {/* <Button className="bg-purple-500 hover:bg-purple-600">
                        Edit
                    </Button> */}
                    <Button variant="outline">Edit</Button>
                </DialogTrigger>
                <DialogContent
                    className="sm:max-w-lg"
                    aria-describedby={undefined}
                >
                    <DialogHeader>
                        <DialogTitle>Edit Convention</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-8"
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
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter location"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dateRange"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Dates</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        id="date"
                                                        variant={'outline'}
                                                        className={cn(
                                                            'w-[240px] pl-3 text-left font-normal',
                                                            !field.value &&
                                                                'text-muted-foreground',
                                                        )}
                                                    >
                                                        {field.value.from ? (
                                                            field.value.to ? (
                                                                <>
                                                                    {format(
                                                                        field
                                                                            .value
                                                                            .from,
                                                                        'LLL dd, y',
                                                                    )}{' '}
                                                                    -{' '}
                                                                    {format(
                                                                        field
                                                                            .value
                                                                            .to,
                                                                        'LLL dd, y',
                                                                    )}
                                                                </>
                                                            ) : (
                                                                format(
                                                                    field.value
                                                                        .from,
                                                                    'LLL dd, y',
                                                                )
                                                            )
                                                        ) : (
                                                            <span>
                                                                Pick a date
                                                            </span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    initialFocus
                                                    mode="range"
                                                    defaultMonth={
                                                        field.value?.from
                                                    }
                                                    footer={
                                                        field.value
                                                            ? `${field.value.from ? format(field.value.from, 'LLL dd, y') : 'undefined'} - ${field.value.to ? format(field.value.to, 'LLL dd, y') : 'undefined'}`
                                                            : 'No date selected.'
                                                    }
                                                    selected={field.value}
                                                    onSelect={(
                                                        range,
                                                        selectedDay,
                                                    ) => {
                                                        console.log(
                                                            'range:',
                                                            range,
                                                        )
                                                        console.log(
                                                            'field.value:',
                                                            field.value,
                                                        )
                                                        console.log(
                                                            'selectedDay:',
                                                            selectedDay,
                                                        )
                                                        console.log(
                                                            field.value.from ===
                                                                selectedDay,
                                                        )
                                                        console.log(
                                                            isEqual(
                                                                field.value
                                                                    .from,
                                                                selectedDay,
                                                            ),
                                                        )
                                                        if (
                                                            !range &&
                                                            isEqual(
                                                                field.value
                                                                    .from,
                                                                selectedDay,
                                                            )
                                                        ) {
                                                            field.onChange({
                                                                from: field
                                                                    .value.from,
                                                                to: undefined,
                                                            })
                                                        } else {
                                                            field.onChange(
                                                                range ??
                                                                    field.value,
                                                            )
                                                        }
                                                    }}
                                                    numberOfMonths={2}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="protectEdits"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-2 leading-none">
                                            <FormLabel>Protect Edits</FormLabel>

                                            <FormDescription>
                                                Enable to prevent accidental
                                                changes.
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600"
                                disabled={!isDirty || isSubmitting || !isValid}
                            >
                                Save
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
