import * as React from 'react'
import { cn } from '@/lib/utils'

export type ErrorBoxProps = React.HTMLAttributes<HTMLDivElement> & {
    title?: React.ReactNode
}

export function ErrorBox({ className, children, title, ...props }: ErrorBoxProps) {
    return (
        <div className={cn('p-4 bg-red-50 border-2 border-red-600 rounded-sm', className)} {...props}>
            {title && <p className="text-red-800 font-semibold mb-1">{title}</p>}
            <div className="text-red-800">
                {children}
            </div>
        </div>
    )
}

export default ErrorBox



