import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { WebSpinner } from "@/components/ui/WebSpinner";

export async function GraphEmptyState() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <WebSpinner size="lg" className="mb-6 text-muted-foreground" />
      <h2 className="text-2xl font-bold mb-2">{t("theWeb.emptyHeading")}</h2>
      <p className="text-muted-foreground max-w-md">
        {t("theWeb.emptyDescription")}
      </p>
      <p className="text-muted-foreground max-w-md mt-2">
        {t("theWeb.emptyGrowing")}
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border border-border bg-card hover:bg-muted hover:border-accent/30 text-foreground transition-colors"
      >
        &larr; {t("theWeb.exploreArticles")}
      </Link>
    </div>
  );
}
