import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap text-sm font-serif font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:pointer-events-none disabled:opacity-50 shadow-victorian border-2",
    {
        variants: {
            variant: {
                default: "bg-burgundy text-cream border-burgundy-dark hover:bg-burgundy-light hover:shadow-victorian-lg active:scale-95",
                secondary: "bg-secondary text-cream border-secondary hover:opacity-90 hover:shadow-victorian-lg active:scale-95",
                outline: "border-burgundy bg-cream text-foreground hover:bg-cream-dark hover:border-burgundy-light",
                ghost: "border-transparent hover:bg-cream-dark",
            },
            size: {
                default: "h-12 px-6 py-3 rounded-sm",
                sm: "h-10 rounded-sm px-4 text-xs",
                lg: "h-14 rounded-sm px-10 text-base",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }


