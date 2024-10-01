'use client'
import Logo from '@/../public/codexlogo.png'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTrigger,
} from '@/components/ui/sheet'
import { UserButton } from '@clerk/nextjs'
import {
    Calendar,
    Home,
    Menu,
    Percent,
    ScanBarcode,
    Tags,
    X,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { SidebarButtonSheet } from './SidebarButton'

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

export default function NavbarResponsive() {
    return (
        <nav className="sticky lg:fixed lg:bottom-[calc(100vh-theme(spacing.16))] max-lg:top-0 w-full h-16 z-50 border-b bg-white max-sm:shadow-md">
            <div className="flex flex-row justify-between items-center px-6 lg:px-12 py-2 h-full">
                <Image
                    src={Logo}
                    alt="Codex"
                    width="32"
                    height="32"
                    className="cursor-pointer"
                    priority
                />
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="lg:hidden"
                        >
                            <Menu size={20} />
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="right"
                        hideClose={true}
                        className="px-6 py-6"
                    >
                        <SheetHeader className="flex flex-row justify-between items-center space-y-0">
                            <Link
                                className="flex flex-row items-center justify-center gap-4 ml-2"
                                href="/"
                            >
                                <Image
                                    src={Logo}
                                    alt="Codex"
                                    width="36"
                                    height="36"
                                    className="cursor-pointer"
                                    priority
                                />
                                <span className="text-2xl">Codex</span>
                            </Link>
                            <SheetClose asChild>
                                <Button variant="ghost" className="h-7 w-7 p-0">
                                    <X size={20} />
                                </Button>
                            </SheetClose>
                        </SheetHeader>
                        <div className="h-full">
                            <div className="mt-5 flex flex-col w-full gap-2">
                                {sidebarItems.links.map((link, idx) => (
                                    <Link key={idx} href={link.href}>
                                        <SidebarButtonSheet
                                            icon={link.icon}
                                            className="text-lg w-full font-semibold gap-4"
                                        >
                                            {link.label}
                                        </SidebarButtonSheet>
                                    </Link>
                                ))}
                            </div>
                            <div className="absolute w-full bottom-4 px-6 pb-1 left-0">
                                <Separator className="absolute -top-6 left-0 w-full" />
                                <div className="flex flex-row gap-4 items-center font-semibold">
                                    <UserButton
                                        showName={true}
                                        appearance={{
                                            elements: {
                                                userButtonBox: {
                                                    flexDirection:
                                                        'row-reverse',
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    )
}
