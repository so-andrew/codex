'use client'
import { Calendar, Home, ScanBarcode } from 'lucide-react'
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
                        label: 'Conventions',
                        href: '/dashboard/conventions',
                        icon: Calendar,
                    },
                ],
            }}
        />
    )
}
