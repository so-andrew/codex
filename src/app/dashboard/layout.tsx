import Sidebar from '@/app/_components/navigation/Sidebar'
import { type Metadata } from 'next'
import NavbarResponsive from '../_components/navigation/NavbarResponsive'

export const metadata: Metadata = {
    title: 'Dashboard - Codex',
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <NavbarResponsive />
            <section className="flex min-h-screen">
                <Sidebar />
                <main className="mt-8 lg:mt-24 w-full">{children}</main>
            </section>
        </>
    )
}
