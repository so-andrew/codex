'use client'
import { Calendar, Home, Percent, ScanBarcode, Tags } from 'lucide-react'
import SidebarDesktop from './SidebarDesktop'

export default function Sidebar() {
    return (
        <SidebarDesktop
            sidebarItems={{
                links: [
                    { label: 'Home', href: '/dashboard', icon: Home },
                    {
                        label: 'Products',
                        href: '/dashboard/products',
                        icon: ScanBarcode,
                    },
                    {
                        label: 'Categories',
                        href: '/dashboard/categories',
                        icon: Tags,
                    },
                    {
                        label: 'Discounts',
                        href: '/dashboard/discounts',
                        icon: Percent,
                    },
                    {
                        label: 'Conventions',
                        href: '/dashboard/conventions',
                        icon: Calendar,
                    },
                ],
            }}
        />
    )
}
