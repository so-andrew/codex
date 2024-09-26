import { Navbar } from '@/app/_components/navigation/Navbar'
import Sidebar from '@/app/_components/navigation/Sidebar'
import { type Metadata } from 'next'

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
            <Navbar />
            <section className="flex flex-row">
                <Sidebar />
                <main className="mt-3 w-full">{children}</main>
            </section>
        </>
    )
}
