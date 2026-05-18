import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ title, icon, children, className }: SectionCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-gradient-card p-6 shadow-card",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        {icon && <span className="text-primary">{icon}</span>}
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

interface TagListProps {
  items: string[];
  variant?: "primary" | "muted" | "success" | "warning";
}

export function TagList({ items, variant = "primary" }: TagListProps) {
  if (!items?.length)
    return <p className="text-sm text-muted-foreground">None detected.</p>;

  const styles: Record<NonNullable<TagListProps["variant"]>, string> = {
    primary: "bg-primary/15 text-primary border-primary/30",
    muted: "bg-muted text-foreground border-border",
    success: "border-[color:var(--success)]/40 text-[color:var(--success)] bg-[color:var(--success)]/10",
    warning: "border-[color:var(--warning)]/40 text-[color:var(--warning)] bg-[color:var(--warning)]/10",
  };

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span
          key={`${item}-${i}`}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium",
            styles[variant],
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
