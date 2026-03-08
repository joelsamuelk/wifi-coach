import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-[transform,background-color,border-color,color,box-shadow,opacity] duration-200 disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.985]",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),0_10px_24px_rgba(37,99,235,0.22)] hover:bg-primary/92 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),0_12px_26px_rgba(37,99,235,0.24)]',
        destructive:
          'bg-destructive text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border border-border/80 bg-white/70 text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.75),0_4px_12px_rgba(15,23,42,0.04)] hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),0_8px_18px_rgba(15,157,146,0.18)] hover:bg-secondary/88',
        ghost:
          'text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-5 py-2 has-[>svg]:px-4.5',
        sm: 'h-9 gap-1.5 px-4 has-[>svg]:px-3',
        lg: 'h-12 px-7 has-[>svg]:px-5.5',
        icon: 'size-11 rounded-2xl',
        'icon-sm': 'size-9 rounded-xl',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
