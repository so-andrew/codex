import {
    salesFigures,
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

export type ReportType = {
    reportId: number
    reportName: string
    reportPrice: string
    reportSalesFigures: salesFigures
    productId: number | null
    productName: string
    categoryId: number | null
    categoryName: string | null
}

export type ReportTableRow = ReportType & { key: string | undefined }

export type ReportsByProduct = {
    productId: number
    productName: string
    categoryId: number
    categoryName: string
    reports: ReportType[]
}

export type ProductsByCategory = {
    categoryId: number
    categoryName: string
    products: ReportsByProduct[]
}

export type defaultValues = Record<
    number,
    {
        id: number
        key: string
        cashSales: number
        cardSales: number
    }
>
