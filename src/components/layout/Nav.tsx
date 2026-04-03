"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Home, User, PenLine, LayoutGrid, Share2, Image, type LucideIcon } from "lucide-react";

const links: { href: string; labelKey: string; icon: LucideIcon }[] = [
  { href: "/", labelKey: "nav.home", icon: Home },
  { href: "/about", labelKey: "nav.about", icon: User },
  { href: "/journal", labelKey: "nav.journal", icon: PenLine },
  { href: "/collections", labelKey: "nav.collections", icon: LayoutGrid },
  { href: "/the-web", labelKey: "nav.web", icon: Share2 },
  { href: "/gallery", labelKey: "nav.gallery", icon: Image },
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
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
              mobile && "flex items-center gap-3",
              isActive
                ? "text-accent"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {mobile && <Icon className="w-4 h-4 flex-shrink-0" />}
            {t(link.labelKey)}
            {/* Active underline indicator */}
            {isActive && !mobile && (
              <span
                className="absolute bottom-0 left-3 right-3 h-0.5 bg-accent rounded-full"
                aria-hidden="true"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
