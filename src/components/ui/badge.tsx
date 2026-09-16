import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 px-1.5 py-0.5 font-display text-[10px] font-black uppercase leading-none tracking-wider",
  {
    variants: {
      variant: {
        promo: "bg-promo text-white",
        primary: "bg-primary text-white",
        light: "bg-foreground text-background",
        muted: "bg-surface-2 text-muted border border-border",
        success: "bg-success/15 text-success border border-success/40",
        danger: "bg-danger/15 text-danger border border-danger/40",
        outline: "border border-border text-foreground",
      },
    },
    defaultVariants: { variant: "muted" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
