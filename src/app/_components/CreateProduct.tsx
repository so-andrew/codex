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
import { cn, moneyFormat } from '@/lib/utils'
import { type Category } from '@/server/db/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useReducer, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [value, setValue] = useReducer((_: any, next: string) => {
        const digits = next.replace(/\D/g, '')
        return moneyFormat.format(Number(digits) / 100)
    }, '$0.00')

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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    function handleChange(change: Function, formatted: string) {
        const digits = formatted.replace(/\D/g, '')
        const value = Number(digits) / 100
        change(value)
    }

    async function onSubmit(data: z.infer<typeof formSchema>) {
        console.log(data)
        try {
            await createProduct(data)
            setVariationCount(0)
            remove()
            setIsOpen(false)
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
        <div className="flex flex-row gap-4">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-purple-500 hover:bg-purple-600">
                        Add Product
                    </Button>
                </DialogTrigger>
                <DialogContent
                    className="sm:max-w-lg"
                    aria-describedby={undefined}
                >
                    <DialogHeader>
                        <DialogTitle>Add Product</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
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
                                                        className="w=[200px] justify-between"
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
                                                <PopoverContent className="w=[200px] p-0">
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
                                                    placeholder="$0.00"
                                                    className="w-40"
                                                    {...field}
                                                    onChange={(event) => {
                                                        setValue(
                                                            event.target.value,
                                                        )
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
                                                        <Input
                                                            placeholder="$0.00"
                                                            {...field}
                                                            onChange={(
                                                                event,
                                                            ) => {
                                                                setValue(
                                                                    event.target
                                                                        .value,
                                                                )
                                                                handleChange(
                                                                    field.onChange,
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }}
                                                            value={value}
                                                        />
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
