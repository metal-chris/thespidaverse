"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Home, User, PenLine, Newspaper, LayoutGrid, Network, Image, ScrollText, type LucideIcon } from "lucide-react";

const links: { href: string; labelKey: string; icon: LucideIcon }[] = [
  { href: "/", labelKey: "nav.home", icon: Home },
  { href: "/about", labelKey: "nav.about", icon: User },
  { href: "/articles", labelKey: "nav.articles", icon: Newspaper },
  { href: "/journal", labelKey: "nav.journal", icon: PenLine },
  { href: "/collections", labelKey: "nav.collections", icon: LayoutGrid },
  { href: "/the-web", labelKey: "nav.web", icon: Network },
  { href: "/gallery", labelKey: "nav.gallery", icon: Image },
  { href: "/patch-notes", labelKey: "nav.patchNotes", icon: ScrollText },
];

export function Nav({ mobile, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <nav
      className={cn(
        "flex gap-0.5",
        mobile ? "flex-col" : "items-center"
      )}
    >
      {links.map((link) => {
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href);

        const Icon = link.icon;
        const label = t(link.labelKey);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-label={!mobile ? label : undefined}
            title={!mobile ? label : undefined}
            className={cn(
              "group relative flex items-center rounded-md text-sm font-medium transition-colors duration-200",
              mobile ? "gap-3 px-3 py-2" : "px-2.5 py-2",
              isActive
                ? "text-accent"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span
              className={cn(
                "overflow-hidden whitespace-nowrap",
                mobile
                  ? ""
                  : cn(
                      "transition-[max-width,opacity,margin-left] duration-300 ease-out",
                      isActive
                        ? "max-w-[180px] opacity-100 ml-2"
                        : "max-w-0 opacity-0 ml-0 group-hover:max-w-[180px] group-hover:opacity-100 group-hover:ml-2 group-focus-visible:max-w-[180px] group-focus-visible:opacity-100 group-focus-visible:ml-2"
                    )
              )}
            >
              {label}
            </span>
            {/* Active underline indicator */}
            {isActive && !mobile && (
              <span
                className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-accent rounded-full"
                aria-hidden="true"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
