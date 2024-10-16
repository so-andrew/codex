'use client'
import { createProduct } from '@/app/actions'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { toast } from '@/hooks/use-toast'
import {
    cn,
    currencyDisplayHandleChange,
    formatAsCurrency,
    moneyFormat,
} from '@/lib/utils'
import { type Category } from '@/server/db/schema'
import { DevTool } from '@hookform/devtools'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useReducer, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

type Action = {
    type: 'set_value' | 'remove_value' | 'reset_all'
    index?: number
    value?: string
}

type State = string[]

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

const formSchema = z.object({
    name: z
        .string()
        .min(2, { message: 'Must be at least 2 characters long' })
        .max(100, { message: 'Must be less than 100 characters long' }),
    category: z.number(),
    price: z.coerce
        .number({
            invalid_type_error: 'Price must be a number',
        })
        .nonnegative(),
    variations: z.array(variationSchema),
})

export default function CreateProduct({
    categories,
}: {
    categories: Category[]
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [isComboboxOpen, setIsComboboxOpen] = useState(false)
    const [variationCount, setVariationCount] = useState(0)
    const [displayValues, dispatch] = useReducer(reducer, [] as State)

    function reducer(state: State, action: Action): State {
        //console.log(action)
        switch (action.type) {
            case 'set_value':
                //console.log('slice1:', ...state.slice(0, action.index))
                //console.log('slice2:', ...state.slice(action.index + 1))
                //console.log(action.index)
                if (typeof action.index === 'undefined')
                    throw new Error('Index required')

                const newArr = [
                    ...state.slice(0, action.index),
                    formatAsCurrency(action.value!),
                    ...state.slice(action.index + 1),
                ]
                console.log('newArr', newArr)
                return newArr
            case 'remove_value':
                if (typeof action.index === 'undefined')
                    throw new Error('Index required')
                return [
                    ...state.slice(0, action.index),
                    ...state.slice(action.index + 1),
                ]
            case 'reset_all':
                return []
        }
    }

    function setDisplayValue({
        index,
        target,
    }: {
        index: number
        target: EventTarget & HTMLInputElement
    }) {
        dispatch({ type: 'set_value', index: index, value: target.value })
    }

    function removeDisplayValue(index: number) {
        dispatch({
            type: 'remove_value',
            index: index,
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [value, setValue] = useReducer((_: any, next: string) => {
        return formatAsCurrency(next)
    }, '')

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            category: -1,
            price: 0,
            variations: [],
        },
    })

    const { reset, formState } = form
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
        try {
            await createProduct(data)
            setVariationCount(0)
            remove()
            setIsOpen(false)
            dispatch({ type: 'reset_all' })
            reset({}, { keepValues: false })
            toast({
                title: 'Success',
                description: 'Successfully created product.',
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
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-purple-500 hover:bg-purple-600">
                        Add Product
                    </Button>
                </DialogTrigger>
                <DialogContent
                    className="sm:max-w-xl p-8"
                    aria-describedby={undefined}
                >
                    <DialogHeader>
                        <DialogTitle>Add Product</DialogTitle>
                    </DialogHeader>
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
                                    <FormItem className="flex flex-col gap-2">
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Popover
                                                open={isComboboxOpen}
                                                onOpenChange={setIsComboboxOpen}
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={
                                                            isComboboxOpen
                                                        }
                                                        className="w-[200px] justify-between"
                                                    >
                                                        {field.value
                                                            ? categories.find(
                                                                  (category) =>
                                                                      category.id ===
                                                                      field.value,
                                                              )?.name
                                                            : 'Select category...'}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[200px] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search category..." />
                                                        <CommandList>
                                                            <CommandEmpty>
                                                                No category
                                                                found.
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {categories.map(
                                                                    (
                                                                        category,
                                                                    ) => (
                                                                        <CommandItem
                                                                            key={
                                                                                category.id
                                                                            }
                                                                            value={
                                                                                category.name
                                                                            }
                                                                            onSelect={() => {
                                                                                form.setValue(
                                                                                    'category',
                                                                                    category.id,
                                                                                )
                                                                                setIsComboboxOpen(
                                                                                    false,
                                                                                )
                                                                            }}
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    'mr-2 h-4 w-4',
                                                                                    field.value ===
                                                                                        category.id
                                                                                        ? 'opacity-100'
                                                                                        : 'opacity-0',
                                                                                )}
                                                                            />
                                                                            {
                                                                                category.name
                                                                            }
                                                                        </CommandItem>
                                                                    ),
                                                                )}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            {variationCount === 0 && (
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter price"
                                                    className="w-40"
                                                    {...field}
                                                    onChange={(event) => {
                                                        setValue(
                                                            event.target.value,
                                                        )
                                                        currencyDisplayHandleChange(
                                                            field.onChange,
                                                            event.target.value,
                                                        )
                                                    }}
                                                    onBlur={(event) => {
                                                        const digits =
                                                            formatAsCurrency(
                                                                event.target
                                                                    .value,
                                                            )
                                                        const rounded = Number(
                                                            parseFloat(
                                                                digits,
                                                            ).toFixed(2),
                                                        )
                                                        setValue(
                                                            moneyFormat.format(
                                                                rounded,
                                                            ),
                                                        )
                                                    }}
                                                    value={`${value.length > 0 ? '$' : ''}${value}`}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            {variationCount > 0 && (
                                <div className="flex flex-col gap-4 max-h-[33vh] overflow-y-auto pr-6 py-4">
                                    {fields.map((field, index) => (
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
                                                        {index === 0 && (
                                                            <FormLabel>
                                                                Variation Name
                                                            </FormLabel>
                                                        )}
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
                                                        {index === 0 && (
                                                            <FormLabel>
                                                                Price
                                                            </FormLabel>
                                                        )}
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter price"
                                                                {...field}
                                                                onChange={(
                                                                    event,
                                                                ) => {
                                                                    setDisplayValue(
                                                                        {
                                                                            index: index,
                                                                            target: event.target,
                                                                        },
                                                                    )
                                                                    currencyDisplayHandleChange(
                                                                        field.onChange,
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }}
                                                                onBlur={(
                                                                    event,
                                                                ) => {
                                                                    const digits =
                                                                        formatAsCurrency(
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    const rounded =
                                                                        Number(
                                                                            parseFloat(
                                                                                digits,
                                                                            ).toFixed(
                                                                                2,
                                                                            ),
                                                                        )
                                                                    setValue(
                                                                        moneyFormat.format(
                                                                            rounded,
                                                                        ),
                                                                    )
                                                                }}
                                                                value={
                                                                    displayValues[
                                                                        index
                                                                    ]
                                                                }
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() => {
                                                    removeDisplayValue(index)
                                                    removeVariation(index)
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex flex-row gap-4 pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={addVariation}
                                >
                                    Add Variation
                                </Button>
                                <Button
                                    type="submit"
                                    className=""
                                    disabled={isSubmitting}
                                >
                                    Create
                                </Button>
                            </div>
                        </form>
                        <DevTool control={form.control} />
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    )
}
