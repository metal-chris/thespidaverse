import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonClasses } from "@/components/ui/Button";
import { SpotVoid } from "@/components/content/SpotVoid";
import { SwingHomeLink } from "@/components/content/SwingHomeLink";

export default function NotFound() {
  const t = useTranslations("common");

  return (
    <div
      className="relative overflow-hidden flex items-center justify-center"
      style={{ background: "#fff", minHeight: "80vh" }}
    >
      <SpotVoid />

      <div className="relative z-10 max-w-lg mx-auto text-center px-4">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-black/40 mb-4">
          {t("notFoundLabel")}
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
          {t("notFoundTitle")}
        </h2>
        <p className="mt-3 text-black/60 text-lg max-w-sm mx-auto">
          {t("notFoundDescription")}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <SwingHomeLink label={t("notFoundSwingHome")} />
          <Link
            href="/search"
            className={buttonClasses({
              variant: "secondary",
              size: "lg",
              shape: "rounded",
              className: "!bg-transparent !text-black !border-black/20 hover:!bg-black/5 hover:!border-black/30",
            })}
          >
            {t("notFoundSearch")}
          </Link>
        </div>
      </div>
    </div>
  );
}
