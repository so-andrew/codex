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
            <section className="flex flex-row w-full">
                <Sidebar />
                <main className="mt-16 lg:mt-4 w-full">{children}</main>
            </section>
        </>
    )
}
