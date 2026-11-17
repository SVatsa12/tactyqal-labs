import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// shadcn/ui Button, restyled for the Tactyqal design system:
// full-rounded, brand primary, quiet outline secondary.
// Primary uses ink text on brand orange: white on #F2541B is only 3.5:1,
// ink on it is 5.5:1 (WCAG AA for normal text).
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[background-color,color,box-shadow,transform] duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 active:translate-y-px",
  {
    variants: {
      variant: {
        primary: "bg-brand text-ink shadow-soft hover:bg-[color-mix(in_oklab,var(--brand)_88%,white)]",
        secondary: "border border-border bg-surface text-ink hover:border-ink/25 hover:bg-bg",
        ghost: "text-ink hover:bg-ink/5",
        inverse: "bg-surface text-ink hover:bg-brand-soft",
        "inverse-outline": "border border-white/25 text-white hover:bg-white/10",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-[0.9375rem]",
        lg: "h-13 px-7 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
