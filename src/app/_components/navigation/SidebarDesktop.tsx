import { type SidebarItems } from '@/types'
import Link from 'next/link'
import SidebarButton from './SidebarButton'

interface SidebarDesktopProps {
    sidebarItems: SidebarItems
}

export default function SidebarDesktop(props: SidebarDesktopProps) {
    return (
        <aside className="w=[270px] left-0 top-0 z-40 h-screen max-w-xs border-r bg-white">
            <div className="h-full px-8 py-4">
                <div className="mt-5">
                    <div className="flex w-full flex-col gap-2">
                        {props.sidebarItems.links.map((link, index) => (
                            <Link key={index} href={link.href}>
                                <SidebarButton
                                    icon={link.icon}
                                    className="text-md w-full font-semibold"
                                >
                                    {link.label}
                                </SidebarButton>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    )
}
