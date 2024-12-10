'use client'

import { editProduct } from '@/app/actions'
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
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { type Category, type Product } from '@/server/db/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
    id: z.number(),
    name: z
        .string()
        .min(2, { message: 'Must be at least 2 characters long' })
        .max(100, { message: 'Must be less than 100 characters long' }),
    category: z.number(),
})

type EditProductProps = {
    product: Product
    categories: Category[]
}

export default function EditProduct({ product, categories }: EditProductProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isComboboxOpen, setIsComboboxOpen] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        mode: 'onChange',
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: product.id,
            name: product.name,
            category: product.category,
        },
    })

    const { reset, formState } = form
    const { isDirty, isSubmitting } = formState
    const { toast } = useToast()

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            await editProduct(data)
            reset({}, { keepValues: true })
            setIsOpen(false)
            toast({
                title: 'Success',
                description: 'Successfully edited product.',
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
                    <Button variant="outline">Edit</Button>
                </DialogTrigger>
                <DialogContent
                    className="sm:max-w-lg p-8"
                    aria-describedby={undefined}
                >
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
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
                                                                                field.onChange(
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
                            <FormField
                                control={form.control}
                                name="id"
                                render={({ field }) => (
                                    <FormControl>
                                        <Input
                                            type="hidden"
                                            {...field}
                                            value={product.id}
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
        </>
    )
}
