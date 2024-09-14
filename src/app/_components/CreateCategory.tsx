'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '~/components/ui/command'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '~/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '~/components/ui/popover'
import { cn } from '~/lib/utils'
import { Category } from '~/server/db/schema'
import { createCategory } from '../actions'

const formSchema = z.object({
    name: z
        .string()
        .min(2, { message: 'Must be at least 2 characters long' })
        .max(100, { message: 'Must be less than 100 characters long' }),
    parentId: z.number().optional(),
})

export default function CreateCategory({
    categories,
}: {
    categories: Category[]
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [isComboboxOpen, setIsComboboxOpen] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: 'New Category',
            parentId: undefined,
        },
    })

    const { reset, formState } = form
    const { isSubmitting } = formState

    async function onSubmit(data: z.infer<typeof formSchema>) {
        console.log(data)
        await createCategory(data)
        setIsOpen(false)
        reset({}, { keepValues: false })
    }

    return (
        <div className="flex flex-row gap-4">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-purple-500 hover:bg-purple-600">
                        Add Category
                    </Button>
                </DialogTrigger>
                <DialogContent
                    className="sm:max-w-[800px]"
                    aria-describedby={undefined}
                >
                    <DialogHeader>
                        <DialogTitle>Add Category</DialogTitle>
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
                                name="parentId"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col gap-2">
                                        <FormLabel>Parent Category</FormLabel>
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
                                                                <CommandItem
                                                                    key={-1}
                                                                    value={
                                                                        undefined
                                                                    }
                                                                    onSelect={() => {
                                                                        form.setValue(
                                                                            'parentId',
                                                                            undefined,
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
                                                                                undefined
                                                                                ? 'opacity-100'
                                                                                : 'opacity-0',
                                                                        )}
                                                                    />
                                                                    {
                                                                        'Uncategorized'
                                                                    }
                                                                </CommandItem>
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
                                                                            onSelect={(
                                                                                currentValue,
                                                                            ) => {
                                                                                form.setValue(
                                                                                    'parentId',
                                                                                    category.id,
                                                                                )
                                                                                console.log(
                                                                                    'field.value = ',
                                                                                    field.value,
                                                                                )
                                                                                console.log(
                                                                                    'Current value = ',
                                                                                    currentValue,
                                                                                )
                                                                                console.log(
                                                                                    form.getValues(),
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
                            <div className="flex flex-row gap-4 pt-4">
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
