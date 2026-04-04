"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubsectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Subsection({ title, isOpen, onToggle, children }: SubsectionProps) {
  return (
    <div className="border-b border-border/30 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 py-3 px-1 text-left group"
      >
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-foreground/80 group-hover:text-accent transition-colors">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-300 shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="pb-4 px-1 space-y-4 text-foreground/90 text-sm md:text-base leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function OriginFile() {
  const t = useTranslations("about");
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div>
      <Subsection
        title={t("originTitle1")}
        isOpen={openIndex === 0}
        onToggle={() => toggle(0)}
      >
        <p>{t("originBody1p1")}</p>
        <p>{t("originBody1p2")}</p>
        <p>
          {t.rich("originBody1p3", {
            em: (chunks) => <em>{chunks}</em>,
          })}
        </p>
        <p>
          {t.rich("originBody1p4", {
            strong: (chunks) => <strong className="text-accent">{chunks}</strong>,
          })}
        </p>
      </Subsection>

      <Subsection
        title={t("originTitle2")}
        isOpen={openIndex === 1}
        onToggle={() => toggle(1)}
      >
        <p>{t("originBody2p1")}</p>
        <p>
          {t.rich("originBody2p2", {
            em: (chunks) => <em>{chunks}</em>,
          })}
        </p>
        <p>
          {t.rich("originBody2p3", {
            em: (chunks) => <em>{chunks}</em>,
          })}
        </p>
        <p>
          {t.rich("originBody2p4", {
            strong: (chunks) => <strong className="text-accent">{chunks}</strong>,
          })}
        </p>
      </Subsection>

      <Subsection
        title={t("originTitle3")}
        isOpen={openIndex === 2}
        onToggle={() => toggle(2)}
      >
        <p>{t("originBody3p1")}</p>
        <p>
          {t.rich("originBody3p2", {
            em: (chunks) => <em>{chunks}</em>,
          })}
        </p>
        <p>{t("originBody3p3")}</p>
        <p>{t("originBody3p4")}</p>
        <p>
          {t.rich("originBody3p5", {
            strong: (chunks) => <strong className="text-accent">{chunks}</strong>,
            em: (chunks) => <em>{chunks}</em>,
          })}
        </p>
      </Subsection>
    </div>
  );
}
