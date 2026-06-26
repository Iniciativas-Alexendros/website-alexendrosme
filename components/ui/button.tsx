import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/* Button · Patrón VAP §8.2
   - Hover: shift de luminosidad vía color-mix (nunca opacidad)
   - Press: shift oscuro + translateY(1px) en icon-only
   - Focus-visible: outline 2px brand + 2px offset surface-0
   - Radius: --radius-md
   - Transitions: --duration-fast --ease-out-expo */

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap outline-none select-none [transition:background-color_var(--duration-fast)_var(--ease-out-expo),color_var(--duration-fast)_var(--ease-out-expo),border-color_var(--duration-fast)_var(--ease-out-expo)] focus-visible:[box-shadow:var(--ring-focus)] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:[background:color-mix(in_oklch,var(--primary)_94%,white_6%)] active:[background:color-mix(in_oklch,var(--primary)_96%,black_4%)]",
        outline:
          "border-border bg-transparent text-foreground hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:[background:color-mix(in_oklch,var(--secondary)_92%,white_8%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:[background:color-mix(in_oklch,var(--destructive)_94%,white_6%)] active:[background:color-mix(in_oklch,var(--destructive)_96%,black_4%)]",
        link: "text-primary underline underline-offset-4 decoration-primary/60 hover:decoration-primary",
      },
      size: {
        default:
          "h-11 gap-1.5 px-4 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
        lg: "h-10 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-11 active:translate-y-px",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3 active:translate-y-px",
        "icon-sm":
          "size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md active:translate-y-px",
        "icon-lg": "size-10 active:translate-y-px",
        touch:
          "h-11 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        "icon-touch": "size-11 active:translate-y-px",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button };
