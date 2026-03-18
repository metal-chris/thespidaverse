"use client";

import { useState } from "react";
import Link from "next/link";
import type { Article } from "@/types";
import { Card } from "@/components/ui/Card";

const MOOD_PRESETS: { mood: string; emoji: string; description: string }[] = [
  { mood: "hype", emoji: "🔥", description: "I want to feel the adrenaline" },
  { mood: "chill", emoji: "😌", description: "Something relaxing and easy" },
  { mood: "emotional", emoji: "😭", description: "Hit me right in the feels" },
  { mood: "mindblown", emoji: "🤯", description: "Blow my mind" },
  { mood: "dark", emoji: "🌑", description: "Take me somewhere dark" },
  { mood: "nostalgic", emoji: "✨", description: "A trip down memory lane" },
  { mood: "funny", emoji: "😂", description: "Make me laugh" },
  { mood: "wholesome", emoji: "🥰", description: "Something warm and fuzzy" },
  { mood: "epic", emoji: "⚔️", description: "Grand scale adventures" },
  { mood: "cerebral", emoji: "🧠", description: "Make me think" },
  { mood: "cozy", emoji: "☕", description: "Comfort content" },
  { mood: "intense", emoji: "💀", description: "Edge-of-seat tension" },
];

interface MoodSelectorProps {
  articles: Article[];
  availableMoods: string[];
}

export function MoodSelector({ articles, availableMoods }: MoodSelectorProps) {
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
        {presets.map(({ mood, emoji, description }) => {
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
              <span className="text-xs text-muted-foreground">{description}</span>
            </button>
          );
        })}
      </div>

      {/* Results */}
      {selectedMood && (
        <div>
          <h2 className="text-xl font-bold mb-4">
            {MOOD_PRESETS.find((p) => p.mood === selectedMood)?.emoji || "🎯"}{" "}
            {filteredArticles.length} result{filteredArticles.length !== 1 ? "s" : ""} for &ldquo;{selectedMood}&rdquo;
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
              No articles tagged with &ldquo;{selectedMood}&rdquo; yet. Check back soon!
            </p>
          )}
        </div>
      )}

      {!selectedMood && articles.length > 0 && (
        <p className="text-center text-muted-foreground py-8">
          Select a mood above to get recommendations
        </p>
      )}

      {articles.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No articles yet. Once content is published with mood tags, recommendations will appear here.
        </p>
      )}
    </div>
  );
}
