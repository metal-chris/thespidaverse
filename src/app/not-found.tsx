"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { SpotVoid } from "@/components/content/SpotVoid";
import { SwingHomeLink } from "@/components/content/SwingHomeLink";

const TRANSLATIONS: Record<string, {
  label: string;
  title: string;
  description: string;
  swingHome: string;
  search: string;
}> = {
  en: { label: "Wrong Dimension", title: "You fell through a spot.", description: "This page exists in another dimension.", swingHome: "Swing Back Home", search: "Search Instead" },
  es: { label: "Dimensión Equivocada", title: "Caíste por un portal.", description: "Esta página existe en otra dimensión.", swingHome: "Volver a Casa", search: "Buscar" },
  ja: { label: "異次元", title: "スポットに落ちました。", description: "このページは別の次元に存在します。", swingHome: "ホームに戻る", search: "検索する" },
  pt: { label: "Dimensão Errada", title: "Você caiu por um portal.", description: "Esta página existe em outra dimensão.", swingHome: "Voltar pra Casa", search: "Buscar" },
  ko: { label: "잘못된 차원", title: "포털에 빠졌습니다.", description: "이 페이지는 다른 차원에 있습니다.", swingHome: "홈으로 돌아가기", search: "검색하기" },
  fr: { label: "Mauvaise Dimension", title: "Vous êtes tombé dans un portail.", description: "Cette page existe dans une autre dimension.", swingHome: "Retour à l'Accueil", search: "Rechercher" },
};

function detectLocale(): string {
  if (typeof window === "undefined") return "en";
  const match = window.location.pathname.match(/^\/(es|ja|pt|ko|fr|zh-CN|zh-TW)(\/|$)/);
  return match ? match[1] : "en";
}

export default function NotFound() {
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    setLocale(detectLocale());
  }, []);

  const t = TRANSLATIONS[locale] || TRANSLATIONS.en;

  return (
    <div
      className="relative overflow-hidden flex items-center justify-center"
      style={{ background: "#fff", minHeight: "80vh" }}
    >
      <SpotVoid />

      <div className="relative z-10 max-w-lg mx-auto text-center px-4">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-black/40 mb-4">
          {t.label}
        </p>

        <h1 className="text-[8rem] md:text-[12rem] font-black leading-none text-black relative select-none">
          <span className="relative inline-block">
            4
            <span className="inline-block relative">
              <span className="relative z-10">0</span>
              <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                <span
                  className="block rounded-full"
                  style={{
                    width: "70%",
                    height: "70%",
                    background: "radial-gradient(circle, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 70%)",
                  }}
                />
              </span>
            </span>
            4
          </span>
        </h1>

        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-black">
          {t.title}
        </h2>
        <p className="mt-3 text-black/60 text-lg max-w-sm mx-auto">
          {t.description}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <SwingHomeLink label={t.swingHome} />
          <Link
            href="/search"
            className={buttonClasses({
              variant: "secondary",
              size: "lg",
              shape: "rounded",
              className: "!bg-transparent !text-black !border-black/20 hover:!bg-black/5 hover:!border-black/30",
            })}
          >
            {t.search}
          </Link>
        </div>
      </div>
    </div>
  );
}
