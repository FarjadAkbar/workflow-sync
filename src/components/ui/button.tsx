import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700",
        primary: "bg-black text-white hover:bg-blue-600 hover:text-white border-2 border-transparent hover:border-blue-600 shadow-lg hover:shadow-xl",
        secondary: "bg-blue-600 text-white hover:bg-black hover:text-blue-600 border-2 border-transparent hover:border-blue-600 shadow-lg hover:shadow-xl",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl",
        outline: "border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg",
        ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700",
        success: "bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl",
        warning: "bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
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
