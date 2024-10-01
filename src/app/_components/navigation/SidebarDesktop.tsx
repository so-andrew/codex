'use client'
import { type SidebarItems } from '@/types'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import SidebarButton from './SidebarButton'

interface SidebarDesktopProps {
    sidebarItems: SidebarItems
}

export default function SidebarDesktop(props: SidebarDesktopProps) {
    //const { user } = useUser()
    // const nameString = user?.fullName
    //     ? user?.fullName
    //     : user?.username
    //       ? user.username
    //       : 'User'
    return (
        <aside className="sticky left-0 top-16 z-40 h-[calc(100vh-theme(spacing.16))] max-w-xs border-r bg-white">
            <div className="h-full px-8 py-4">
                <div className="mt-5">
                    <div className="flex w-full flex-col gap-2">
                        {props.sidebarItems.links.map((link, index) => (
                            <Link key={index} href={link.href}>
                                <SidebarButton
                                    icon={link.icon}
                                    className="text-lg w-full font-semibold"
                                >
                                    {link.label}
                                </SidebarButton>
                            </Link>
                        ))}
                        <div className="fixed bottom-8">
                            <div className="flex flex-row gap-4 items-center font-semibold">
                                <UserButton
                                    showName={true}
                                    appearance={{
                                        elements: {
                                            userButtonBox: {
                                                flexDirection: 'row-reverse',
                                            },
                                            userButtonOuterIdentifier:
                                                'text-lg font-semibold',
                                            userButtonTrigger: 'px-4 py-2',
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
