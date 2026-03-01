import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CC5833]/40 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "btn-clay text-white rounded-full",
        secondary: "btn-moss text-[#F2F0E9] rounded-full",
        outline: "btn-outline-moss text-[#2E4036] rounded-full",
        ghost:
          "bg-transparent text-[#2E4036] hover:bg-[rgba(46,64,54,0.06)] rounded-xl px-3 py-2 transition-colors",
        destructive:
          "bg-red-600 text-white hover:bg-red-500 rounded-full shadow-sm",
        link: "text-[#CC5833] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-11 px-6 py-2.5 text-[0.9375rem]",
        sm: "h-9 px-4 text-sm rounded-full",
        lg: "h-13 px-8 text-base",
        icon: "h-10 w-10 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
