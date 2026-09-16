import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  eyebrow?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}

export function SectionHeading({ title, eyebrow, href, linkLabel = "Ver todos", className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4 border-b border-border pb-3", className)}>
      <div>
        {eyebrow && (
          <p className="mb-1 font-display text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-2xl font-black uppercase leading-none tracking-tight sm:text-3xl">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1 font-display text-xs font-bold uppercase tracking-wider text-muted transition-colors hover:text-foreground"
        >
          {linkLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
