import { Button, type ButtonProps } from '@/components/ui/button'
import { SheetClose } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

interface SidebarButtonProps extends ButtonProps {
    icon?: LucideIcon
}

export default function SidebarButton({
    icon: Icon,
    className,
    children,
    ...props
}: SidebarButtonProps) {
    return (
        <Button
            variant="ghost"
            className={cn(
                'items-center justify-start gap-3 hover:bg-purple-500/20',
                className,
            )}
            {...props}
        >
            {Icon && <Icon size={24} />}
            <span>{children}</span>
        </Button>
    )
}

export function SidebarButtonSheet(props: SidebarButtonProps) {
    return (
        <SheetClose asChild>
            <SidebarButton {...props} />
        </SheetClose>
    )
}
