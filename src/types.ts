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

export type CategoryWithCount = Category & {
    productCount: number | undefined
}

export type CategoryTableRow = {
    category: CategoryWithCount
    subcategories: CategoryTableRow[]
}

export type CategoryWithSubcategories = Category & {
    subcategories: CategoryWithSubcategories[] | null
}

export type DailyRevenue = {
    reportId: number
    date: Date
    cashSales: number
    cardSales: number
}

export type ReportType = {
    id: number
    name: string
    price: string
    productId: number | null
    productName: string
    categoryId: number | null
    categoryName: string | null
    revenues: DailyRevenue[]
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
    string,
    {
        id: number
        key: Date
        cashSales: number
        cardSales: number
    }
>

export type SalesReportFormData = {
    cashSales: number | undefined
    cardSales: number | undefined
}

export type DailyRevenueReport = {
    totalRevenue: number
    cashRevenue: number
    cardRevenue: number
}

export type TopSellingVariations = {
    reportId: number
    variationName: string | undefined
    productName: string
    totalSales: number
    totalRevenue: number
}

export type Dataset = {
    label: string
    data: number[]
    backgroundColor?: string[]
}

export type ChartData = {
    labels: string[]
    datasets: Dataset[]
}

export type DailyRevenueChartData = {
    key: string
    day: string
    revenue: number
    fill?: string
}
