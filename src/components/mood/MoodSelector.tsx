"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Article } from "@/types";
import { Card } from "@/components/ui/Card";

const MOOD_PRESETS: { mood: string; emoji: string; descriptionKey: string }[] = [
  { mood: "hype", emoji: "🔥", descriptionKey: "mood.hype" },
  { mood: "chill", emoji: "😌", descriptionKey: "mood.chill" },
  { mood: "emotional", emoji: "😭", descriptionKey: "mood.emotional" },
  { mood: "mindblown", emoji: "🤯", descriptionKey: "mood.mindblown" },
  { mood: "dark", emoji: "🌑", descriptionKey: "mood.dark" },
  { mood: "nostalgic", emoji: "✨", descriptionKey: "mood.nostalgic" },
  { mood: "funny", emoji: "😂", descriptionKey: "mood.funny" },
  { mood: "wholesome", emoji: "🥰", descriptionKey: "mood.wholesome" },
  { mood: "epic", emoji: "⚔️", descriptionKey: "mood.epic" },
  { mood: "cerebral", emoji: "🧠", descriptionKey: "mood.cerebral" },
  { mood: "cozy", emoji: "☕", descriptionKey: "mood.cozy" },
  { mood: "intense", emoji: "💀", descriptionKey: "mood.intense" },
];

interface MoodSelectorProps {
  articles: Article[];
  availableMoods: string[];
}

export function MoodSelector({ articles, availableMoods }: MoodSelectorProps) {
  const t = useTranslations();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const visiblePresets = MOOD_PRESETS.filter(
    (p) => availableMoods.includes(p.mood) || availableMoods.length === 0
  );

  // Show all presets if no articles yet
  const presets = visiblePresets.length > 0 ? visiblePresets : MOOD_PRESETS;

  const filteredArticles = selectedMood
    ? articles.filter((a) => a.moodTags?.includes(selectedMood))
    : [];

  return (
    <div>
      {/* Mood grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
        {presets.map(({ mood, emoji, descriptionKey }) => {
          const isActive = selectedMood === mood;
          const hasArticles = articles.some((a) => a.moodTags?.includes(mood));

          return (
            <button
              key={mood}
              onClick={() => setSelectedMood(isActive ? null : mood)}
              className={`
                p-4 rounded-lg border text-left transition-all duration-200
                ${isActive
                  ? "border-accent bg-accent/10 scale-[1.02]"
                  : hasArticles
                    ? "border-border bg-card hover:border-accent/50 hover:scale-[1.01]"
                    : "border-border/50 bg-card/50 opacity-60 cursor-not-allowed"
                }
              `}
              disabled={!hasArticles && articles.length > 0}
            >
              <span className="text-2xl block mb-1">{emoji}</span>
              <span className="font-medium text-sm capitalize block">{mood}</span>
              <span className="text-xs text-muted-foreground">{t(descriptionKey)}</span>
            </button>
          );
        })}
      </div>

      {/* Results */}
      {selectedMood && (
        <div>
          <h2 className="text-xl font-bold mb-4">
            {MOOD_PRESETS.find((p) => p.mood === selectedMood)?.emoji || "🎯"}{" "}
            {t("mood.resultsFor", { count: filteredArticles.length, mood: selectedMood })}
          </h2>

          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <Link key={article._id} href={`/articles/${article.slug.current}`}>
                  <Card article={article} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {t("mood.noArticlesForMood", { mood: selectedMood })}
            </p>
          )}
        </div>
      )}

      {!selectedMood && articles.length > 0 && (
        <p className="text-center text-muted-foreground py-8">
          {t("mood.selectPrompt")}
        </p>
      )}

      {articles.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          {t("mood.noArticlesYet")}
        </p>
      )}
    </div>
  );
}
