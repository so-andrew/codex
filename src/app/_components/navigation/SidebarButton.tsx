import { LucideIcon } from 'lucide-react'
import { Button, ButtonProps } from '~/components/ui/button'
import { cn } from '~/lib/utils'

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
            className={cn('items-center justify-start gap-2', className)}
            {...props}
        >
            {Icon && <Icon size={20} />}
            <span>{children}</span>
        </Button>
    )
}