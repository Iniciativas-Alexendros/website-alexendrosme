import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/* Badge · Patrón axds §9.3 + estados semánticos.
   Sin hover por opacidad; tokens semánticos para success/warning/error/info. */

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap [transition:background-color_var(--ax-duration-fast)_var(--ax-ease-out-expo),color_var(--ax-duration-fast)_var(--ax-ease-out-expo),border-color_var(--ax-duration-fast)_var(--ax-ease-out-expo)] focus-visible:[box-shadow:var(--ax-ring-focus)] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground [a]:hover:bg-muted",
        ghost: "text-muted-foreground [a]:hover:bg-muted [a]:hover:text-foreground",
        success:
          "[background:var(--ax-success-bg)] [color:var(--ax-success-fg)] [border-color:var(--ax-success-border)]",
        warning:
          "[background:var(--ax-warning-bg)] [color:var(--ax-warning-fg)] [border-color:var(--ax-warning-border)]",
        destructive:
          "[background:var(--ax-error-bg)] [color:var(--ax-error-fg)] [border-color:var(--ax-error-border)]",
        info: "[background:var(--ax-info-bg)] [color:var(--ax-info-fg)] [border-color:var(--ax-info-border)]",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
