import {
    type Category,
    type Product,
    type ProductVariation,
} from '@/server/db/schema'
import { Interval } from 'date-fns'
import { type LucideIcon } from 'lucide-react'

export interface SidebarItems {
    links: Array<{
        label: string
        href: string
        icon?: LucideIcon
    }>
}

// Helper type for product and its variations
export type ProductWithVariations = {
    product: Product
    variations: ProductVariation[]
}

// Type for product table
export type ProductTableRow = {
    product: Product | ProductVariation
    variations: ProductTableRow[]
    categoryName: string | null
}

export type CategoryWithCount = Category & {
    productCount?: number
}

export type CategoryTableRow = {
    category: CategoryWithCount
    subcategories: CategoryTableRow[]
}

export type CategoryWithSubcategories = Category & {
    subcategories: CategoryWithSubcategories[] | null
}

export type DailyProductWithType = {
    type: 'product'
    reportId: number
    date: Date
    cashSales?: number
    cardSales?: number
}

export type DailyProductReport = {
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
    conventionId: number
    custom: boolean
    revenues: DailyProductReport[]
}

export type DiscountReport = {
    id: number
    name: string
    amount: string
    conventionId: number
    custom: boolean
    daily: DailyDiscount[]
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

export type defaultValues = Record<string, DailyProductReport | DailyDiscount>

export type SalesReportFormData = {
    cashSales: number | undefined
    cardSales: number | undefined
    cashDiscounts: number | undefined
    cardDiscounts: number | undefined
}

export type DailyRevenueReport = {
    totalRevenue: number
    cashRevenue: number
    cardRevenue: number
}

export type DailyDiscountWithType = {
    type: 'discount'
    reportId: number
    date: Date
    cashDiscounts?: number
    cardDiscounts?: number
}

export type DailyDiscount = {
    reportId: number
    date: Date
    cashDiscounts: number
    cardDiscounts: number
}

export type ReportOrDiscount = DailyProductWithType | DailyDiscountWithType

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

export type RevenueTypeChartData = {
    key: string
    day: string
    cashRevenue: number
    cardRevenue: number
    fill?: string
}

export type MonthlyRevenueChartData = {
    month: string
    revenue: number
    fill?: string
}

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export type Config = {
    [x: string]: ConfigEntry
}

export type ConfigEntry = {
    label: string
    fill?: string
}

export type DashboardRevenueData = {
    monthRevenueArray: MonthlyRevenueChartData[]
    monthDiscountArray: Map<string, number>
    totalRevenueByType: TotalRevenueByType
    totalDiscountsByType: TotalDiscountsByType
    previousRevenueByType: TotalRevenueByType
    previousDiscountsByType: TotalDiscountsByType
    givenInterval?: Interval
    previousInterval: Interval
    productRevenueMap: Map<string, ProductRevenue>
    categoryRevenueMap: Map<string, CategoryRevenue>
}

export type ProductRevenue = {
    name: string
    revenue: number
    sales: number
}

export type CategoryRevenue = {
    category: string
    revenue: number
    sales: number
}

export type TotalRevenueByType = {
    cashRevenue: number
    cardRevenue: number
    totalRevenue: number
}

export type TotalDiscountsByType = {
    cashDiscountAmount: number
    cardDiscountAmount: number
    totalDiscountAmount: number
}
