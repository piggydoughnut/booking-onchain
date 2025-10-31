import * as React from 'react'
import { cn } from '@/lib/utils'

export type BurgundyBoxProps = React.HTMLAttributes<HTMLDivElement> & {
    label?: React.ReactNode
}

export function BurgundyBox({ className, children, label, ...props }: BurgundyBoxProps) {
    return (
        <div className={cn('p-4 bg-cream-dark border border-burgundy rounded-sm', className)} {...props}>
            {label !== undefined && (
                <p className="text-sm text-foreground/70 mb-1">{label}</p>
            )}
            {children}
        </div>
    )
}

export default BurgundyBox


