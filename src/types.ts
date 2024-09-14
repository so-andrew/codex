import {
    type Category,
    type Product,
    type ProductVariation,
} from '@/server/db/schema'
import { type LucideIcon } from 'lucide-react'

export interface SidebarItems {
    links: Array<{
        label: string
        href: string
        icon?: LucideIcon
    }>
}

export type ProductWithVariations = {
    product: Product
    variations: ProductVariation[]
}

export type ProductTableRow = {
    product: Product | ProductVariation
    variations: ProductTableRow[]
    categoryName: string | null
}

export type CategoryTableRow = {
    category: Category
    subcategories: CategoryTableRow[]
}

export type CategoryWithSubcategories = Category & {
    subcategories: CategoryWithSubcategories[] | null
}
