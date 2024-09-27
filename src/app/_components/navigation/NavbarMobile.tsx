'use client'
import Logo from '@/../public/codexlogo.png'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import Image from 'next/image'

export default function NavbarMobile() {
    return (
        <nav className="sticky top-0 w-full z-50 border-b bg-white">
            <div className="flex flex-row justify-between px-6 lg:px-12 py-2">
                <Image
                    src={Logo}
                    alt="Codex"
                    width="32"
                    height="28"
                    className="cursor-pointer"
                    priority
                />
                <Button size="icon" variant="ghost">
                    <Menu size={20} />
                </Button>
            </div>
        </nav>
    )
}
