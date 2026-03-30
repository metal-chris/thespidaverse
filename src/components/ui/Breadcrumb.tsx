"use client";

import Link from "next/link";
import { Home, LayoutGrid, type LucideIcon } from "lucide-react";

/** Map of known routes to their icons. */
const ROUTE_ICONS: Record<string, LucideIcon> = {
  "/": Home,
  "/collections": LayoutGrid,
};

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav
      className="text-sm text-muted-foreground flex items-center gap-1.5"
      aria-label="Breadcrumb"
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const Icon = item.href ? ROUTE_ICONS[item.href] : undefined;

        return (
          <span key={i} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && (
              <span className="text-muted-foreground/50 flex-shrink-0">/</span>
            )}
            {isLast ? (
              <span className="text-foreground truncate">{item.label}</span>
            ) : item.href ? (
              <Link
                href={item.href}
                className="flex items-center gap-1 hover:text-foreground transition-colors flex-shrink-0"
              >
                {Icon ? (
                  <Icon className="w-3.5 h-3.5" aria-label={item.label} />
                ) : (
                  item.label
                )}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
