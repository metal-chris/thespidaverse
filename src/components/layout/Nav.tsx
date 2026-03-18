"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/journal", label: "Journal" },
  { href: "/collections", label: "Collections" },
  { href: "/the-web", label: "The Web" },
  { href: "/about", label: "About" },
];

export function Nav({ mobile, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

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

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
              isActive
                ? "text-accent"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {link.label}
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
