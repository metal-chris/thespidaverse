"use client";

import Link from "next/link";
import { Home, LayoutGrid, PenLine, type LucideIcon } from "lucide-react";

/** Map of known routes to their icons. */
const ROUTE_ICONS: Record<string, LucideIcon> = {
  "/": Home,
  "/collections": LayoutGrid,
  "/journal": PenLine,
};

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  // On mobile (3+ items), collapse middle segments to just "..."
  // Show: Home / ... / Current Page
  const isCollapsible = items.length > 2;

  return (
    <nav
      className="text-sm text-muted-foreground flex items-center justify-center gap-1.5 max-w-full overflow-hidden"
      aria-label="Breadcrumb"
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const isFirst = i === 0;
        const isMiddle = !isFirst && !isLast;
        const Icon = item.href ? ROUTE_ICONS[item.href] : undefined;

        return (
          <span
            key={i}
            className={`flex items-center gap-1.5 min-w-0 ${
              isMiddle && isCollapsible ? "hidden sm:flex" : "flex"
            }`}
          >
            {i > 0 && !(isLast && isCollapsible) && (
              <span className={`text-muted-foreground/50 flex-shrink-0 ${
                isMiddle && isCollapsible ? "hidden sm:inline" : ""
              }`}>/</span>
            )}
            {isLast ? (
              <>
                <span className="text-muted-foreground/50 flex-shrink-0">/</span>
                <span className="text-foreground truncate max-w-[200px] sm:max-w-none">{item.label}</span>
              </>
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
