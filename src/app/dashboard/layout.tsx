import { Navbar } from '~/app/_components/navigation/Navbar'
import Sidebar from '~/app/_components/navigation/Sidebar'

export default function ProductLayout({
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
