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
import { type SidebarItems } from '@/types'
import { UserButton, useUser } from '@clerk/nextjs'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { SidebarButtonSheet } from './SidebarButton'

interface SidebarMobileProps {
    sidebarItems: SidebarItems
}

export default function SidebarMobile(props: SidebarMobileProps) {
    const { user } = useUser()
    const nameString = user?.fullName
        ? user?.fullName
        : user?.username
          ? user.username
          : 'User'

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    size="icon"
                    variant="ghost"
                    className="fixed top-3 left-3"
                >
                    <Menu size={20} />
                </Button>
            </SheetTrigger>

            <SheetContent side="left" hideClose={true} className="px-6 py-6">
                <SheetHeader className="flex flex-row justify-between items-center space-y-0">
                    <Link
                        className="flex flex-row items-center justify-center gap-4 ml-2"
                        href="/"
                    >
                        <Image
                            src={Logo}
                            alt="Codex"
                            width="48"
                            height="48"
                            className="cursor-pointer"
                            priority
                        />
                        <span className="text-3xl">Codex</span>
                    </Link>
                    <SheetClose asChild>
                        <Button variant="ghost" className="h-7 w-7 p-0">
                            <X size={20} />
                        </Button>
                    </SheetClose>
                </SheetHeader>
                <div className="h-full">
                    <div className="mt-5 flex flex-col w-full gap-2">
                        {props.sidebarItems.links.map((link, idx) => (
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
                        <div className="flex flex-row gap-4 items-center">
                            <UserButton
                                showName={true}
                                appearance={{
                                    elements: {
                                        userButtonBox: {
                                            flexDirection: 'row-reverse',
                                        },
                                    },
                                }}
                            />
                            {/* <span className="font-semibold">{nameString}</span> */}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
