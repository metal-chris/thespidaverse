'use client'

import { type ReactElement } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"

/** This site keeps its locale list on `routing`, where Kumo Club exports it
 *  directly — the one structural difference between the two files. */
const locales = routing.locales
type Locale = (typeof locales)[number]
import { ChevronDown, Check } from 'lucide-react'
import { cn } from "@/lib/utils"

export const FLAG_ICONS: Record<Locale, ReactElement> = {
  en: (
    <svg viewBox="0 0 28 20" className="h-4 w-6 shrink-0" aria-hidden="true">
      <rect width="28" height="20" fill="#b22234" />
      {[...Array(6)].map((_, i) => (
        <rect
          key={`stripe-${i}`}
          y={(i * 2 + 1) * (20 / 13)}
          width="28"
          height={20 / 13}
          fill="#ffffff"
        />
      ))}
      <rect width="12" height="10.5" fill="#3c3b6e" />
      {[...Array(9)].map((_, row) =>
        [...Array(row % 2 === 0 ? 6 : 5)].map((_, col) => (
          <circle
            key={`star-${row}-${col}`}
            cx={col * 1.8 + (row % 2 === 0 ? 0.9 : 1.8)}
            cy={row * 1.05 + 0.8}
            r={0.25}
            fill="#ffffff"
          />
        ))
      )}
    </svg>
  ),
  ja: (
    <svg viewBox="0 0 28 20" className="h-4 w-6 shrink-0" aria-hidden="true">
      <rect width="28" height="20" fill="#ffffff" />
      <circle cx="14" cy="10" r="5" fill="#bc002d" />
    </svg>
  ),
  ko: (
    <svg viewBox="0 0 28 20" className="h-4 w-6 shrink-0" aria-hidden="true">
      <rect width="28" height="20" fill="#ffffff" />
      <circle cx="14" cy="10" r="4.5" fill="#c60c30" />
      <path d="M14 5.5 A4.5 4.5 0 0 1 14 14.5 A2.25 2.25 0 0 1 14 10 A2.25 2.25 0 0 0 14 5.5" fill="#003478" />
      <g stroke="#1e1e1e" strokeWidth="0.6">
        <line x1="5" y1="4" x2="8" y2="7" />
        <line x1="5.8" y1="3.2" x2="8.8" y2="6.2" />
        <line x1="6.6" y1="2.4" x2="9.6" y2="5.4" />
        <line x1="20" y1="13" x2="23" y2="16" />
        <line x1="19.2" y1="13.8" x2="22.2" y2="16.8" />
        <line x1="18.4" y1="14.6" x2="21.4" y2="17.6" />
        <line x1="20" y1="4" x2="23" y2="7" />
        <line x1="19.2" y1="3.2" x2="22.2" y2="6.2" />
        <line x1="5" y1="13" x2="8" y2="16" />
        <line x1="5.8" y1="13.8" x2="8.8" y2="16.8" />
      </g>
    </svg>
  ),
  'zh-CN': (
    <svg viewBox="0 0 28 20" className="h-4 w-6 shrink-0" aria-hidden="true">
      <rect width="28" height="20" fill="#de2910" />
      <g fill="#ffde00">
        <polygon points="5,3 5.9,5.8 3,4.5 7,4.5 4.1,5.8" />
        <polygon points="9,1.5 9.4,2.7 8.2,2 9.8,2 8.6,2.7" transform="rotate(23 9 2)" />
        <polygon points="11,3.5 11.4,4.7 10.2,4 11.8,4 10.6,4.7" transform="rotate(-10 11 4)" />
        <polygon points="11,6.5 11.4,7.7 10.2,7 11.8,7 10.6,7.7" transform="rotate(20 11 7)" />
        <polygon points="9,8.5 9.4,9.7 8.2,9 9.8,9 8.6,9.7" transform="rotate(-30 9 9)" />
      </g>
    </svg>
  ),
  'zh-TW': (
    <svg viewBox="0 0 28 20" className="h-4 w-6 shrink-0" aria-hidden="true">
      <rect width="28" height="20" fill="#fe0000" />
      <rect width="14" height="10" fill="#000095" />
      <g fill="#ffffff">
        <circle cx="7" cy="5" r="3" />
        <polygon points="7,1.5 7.6,3.4 9.5,3.4 8,4.5 8.5,6.4 7,5.2 5.5,6.4 6,4.5 4.5,3.4 6.4,3.4" />
      </g>
    </svg>
  ),
  es: (
    <svg viewBox="0 0 28 20" className="h-4 w-6 shrink-0" aria-hidden="true">
      <rect width="28" height="5" fill="#c60b1e" />
      <rect y="5" width="28" height="10" fill="#ffc400" />
      <rect y="15" width="28" height="5" fill="#c60b1e" />
    </svg>
  ),
  fr: (
    <svg viewBox="0 0 28 20" className="h-4 w-6 shrink-0" aria-hidden="true">
      <rect width="9.33" height="20" fill="#002395" />
      <rect x="9.33" width="9.33" height="20" fill="#ffffff" />
      <rect x="18.66" width="9.34" height="20" fill="#ed2939" />
    </svg>
  ),
  pt: (
    <svg viewBox="0 0 28 20" className="h-4 w-6 shrink-0" aria-hidden="true">
      <rect width="28" height="20" fill="#009b3a" />
      <polygon points="14,2.4 25.6,10 14,17.6 2.4,10" fill="#fedf00" />
      <circle cx="14" cy="10" r="4.4" fill="#002776" />
      <path d="M9.8 8.6a10 10 0 0 1 8.4 2.2" stroke="#ffffff" strokeWidth="1.1" fill="none" />
    </svg>
  ),
}

interface LocaleSwitcherProps {
  showLabels?: boolean
  size?: 'sm' | 'md'
  className?: string
  buttonClassName?: string
}

/**
 * Language switcher — PORTED FROM Kumo Club
 * (mc-v4/src/components/layout/locale-switcher.tsx), not reimplemented, so the
 * two sites offer the same control rather than two that resemble each other.
 *
 * Kumo's version was the one to keep. This site's previous switcher hand-rolled
 * its dropdown with useState/useRef/useEffect: outside-click dismissal, focus
 * management, keyboard traversal and positioning all written by hand, ~237
 * lines of it. Radix does all four correctly and, critically, portals the menu
 * with collision awareness so it flips upward near a viewport edge instead of
 * overflowing — the exact bug Kumo hit with its own `absolute right-0` popover
 * before switching. That is why this brought a new dependency into a repo that
 * had no Radix: the alternative was maintaining a second, weaker copy of
 * behaviour that is not worth writing twice.
 *
 * The two files are deliberately near-identical; only the token vocabulary
 * differs, because the sites do not share a design-token namespace
 * (`text-primary`/`surface-primary` there, `foreground`/`card` here). Keep
 * them in step by porting changes across rather than diverging.
 *
 * Trigger is FLAG ONLY — no text in any toggle. Names appear in the OPEN menu,
 * where they are how you choose a language rather than decoration on a button.
 */
export function LocaleSwitcher({
  // Flag only in the trigger — no text in any toggle, matching the sibling
  // site. The names stay in the OPEN menu, where they are how you pick a
  // language; a flag alone is not a reliable label for choosing one.
  showLabels = false,
  size = 'md',
  className,
  buttonClassName,
}: LocaleSwitcherProps = {}) {
  const t = useTranslations('common.language')
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === locale) return
    router.replace({ pathname }, { locale: newLocale })
  }

  const flagClass = size === 'sm' ? 'h-4 w-6' : 'h-5 w-7'

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={t('change')}
          className={cn(
            'group inline-flex min-h-[44px] items-center gap-2 px-3 py-2 rounded-sm border transition-all duration-200',
            'text-sm font-medium',
            'border-border bg-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground',
            'data-[state=open]:border-accent/50 data-[state=open]:bg-card data-[state=open]:text-foreground',
            className,
            buttonClassName,
          )}
        >
          <span className={flagClass} aria-hidden>
            {FLAG_ICONS[locale]}
          </span>
          {showLabels && (
            <span className="hidden sm:inline">{t(`names.${locale}`)}</span>
          )}
          <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          collisionPadding={12}
          aria-label={t('label')}
          className={cn(
            'z-50 w-48 border border-border bg-card shadow-lg py-1',
            'rounded-[2px]',
          )}
        >
          {locales.map((loc: Locale) => {
            const isActive = loc === locale
            return (
              <DropdownMenu.Item
                key={loc}
                onSelect={() => switchLocale(loc)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer outline-none transition-colors',
                  'data-[highlighted]:bg-muted',
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted-foreground data-[highlighted]:text-foreground'
                )}
              >
                <span className={flagClass} aria-hidden>
                  {FLAG_ICONS[loc]}
                </span>
                <span className="flex-1 font-medium">{t(`names.${loc}`)}</span>
                {isActive && <Check className="w-4 h-4 shrink-0" />}
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
