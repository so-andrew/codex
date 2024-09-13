import { type LucideIcon } from 'lucide-react'
import { type Product, type ProductVariation } from './server/db/schema'

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
}
