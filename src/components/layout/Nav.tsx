"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Home, User, PenLine, Newspaper, LayoutGrid, Network, Image, ScrollText, type LucideIcon } from "lucide-react";
import { KumoWebMark } from "@/components/ui/KumoWebMark";

/** Any lucide icon, or a lucide-shaped component (see KumoWebMark). */
type NavIcon = LucideIcon | ((props: { className?: string }) => React.ReactElement);

type NavLink = {
  href: string;
  labelKey: string;
  icon: NavIcon;
  /** Off-site destination. Renders a plain <a target="_blank">, never the
   *  i18n <Link> (which is built for internal locale-prefixed routes), and
   *  is excluded from the pathname.startsWith active-state logic. */
  external?: boolean;
};

const links: NavLink[] = [
  { href: "/", labelKey: "nav.home", icon: Home },
  { href: "/about", labelKey: "nav.about", icon: User },
  { href: "/articles", labelKey: "nav.articles", icon: Newspaper },
  { href: "/journal", labelKey: "nav.journal", icon: PenLine },
  { href: "/collections", labelKey: "nav.collections", icon: LayoutGrid },
  { href: "/the-web", labelKey: "nav.web", icon: Network },
  { href: "/gallery", labelKey: "nav.gallery", icon: Image },
  { href: "/patch-notes", labelKey: "nav.patchNotes", icon: ScrollText },
  { href: "https://club.thespidaverse.com", labelKey: "nav.kumoClub", icon: KumoWebMark, external: true },
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
        // External entries never match a local pathname, so they are simply
        // never active — skip the prefix check rather than let an absolute
        // URL fall through it.
        const isActive =
          !link.external &&
          (link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href));

        const Icon = link.icon;
        const label = t(link.labelKey);

        const className = cn(
          "group relative flex items-center rounded-md text-sm font-medium transition-colors duration-200",
          mobile ? "min-h-[44px] gap-3 px-3 py-2" : "px-2.5 py-2",
          isActive
            ? "text-accent"
            : "text-muted-foreground hover:text-foreground"
        );

        const content = (
          <>
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
          </>
        );

        if (link.external) {
          return (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onNavigate}
              aria-label={!mobile ? label : undefined}
              title={!mobile ? label : undefined}
              className={className}
            >
              {content}
            </a>
          );
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-label={!mobile ? label : undefined}
            title={!mobile ? label : undefined}
            className={className}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
