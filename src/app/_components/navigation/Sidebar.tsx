'use client'

import { Calendar, Home, Percent, ScanBarcode, Tags } from 'lucide-react'
import { useMediaQuery } from 'usehooks-ts'
import SidebarDesktop from './SidebarDesktop'

const sidebarItems = {
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
}

export default function Sidebar() {
    const isDesktop = useMediaQuery('(min-width:1280px)', {
        initializeWithValue: false,
    })
    return isDesktop ? (
        <SidebarDesktop sidebarItems={sidebarItems} />
    ) : // <SidebarMobile sidebarItems={sidebarItems} />
    undefined
}
