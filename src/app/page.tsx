import Hero from '@/app/_components/Hero'
import NavbarHome from '@/app/_components/navigation/NavbarHome'
import { Separator } from '@/components/ui/separator'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Features from './_components/Features'

export default async function HomePage() {
    const user = await auth()
    if (user.userId) {
        redirect('/dashboard')
    }

    return (
        <section>
            <NavbarHome />
            <Hero />
            <Separator />
            <Features />
        </section>
    )
}
