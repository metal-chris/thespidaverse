"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { PollQuestion, PollResults } from "@/types";

/** Default answer labels for built-in question types. */
const BUILTIN_OPTIONS: Record<string, string[]> = {
  yes_no: ["Yes", "No"],
  agree_scale: ["Agree", "Somewhere in the middle", "Disagree"],
};

interface PollQuestionCardProps {
  question: PollQuestion;
  slug: string;
  initialCounts?: Record<string, number>;
  existingAnswer: string | null;
  onSubmit: (
    questionKey: string,
    answer: string
  ) => Promise<{ success: boolean; aggregated?: Record<string, number> }>;
}

function PollQuestionCard({
  question,
  initialCounts,
  existingAnswer,
  onSubmit,
}: PollQuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(
    existingAnswer
  );
  const [counts, setCounts] = useState<Record<string, number>>(
    initialCounts ?? {}
  );
  const [submitting, setSubmitting] = useState(false);
  const answered = selectedAnswer != null;

  const options =
    question.questionType === "multiple_choice" && question.options?.length
      ? question.options
      : BUILTIN_OPTIONS[question.questionType] ?? ["Yes", "No"];

  const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0);

  const handleSelect = useCallback(
    async (answer: string) => {
      if (answered || submitting) return;
      setSubmitting(true);

      try {
        const result = await onSubmit(question.questionKey, answer);
        setSelectedAnswer(answer);
        if (result.aggregated) {
          setCounts(result.aggregated);
        } else {
          // Optimistic: just increment the selected answer
          setCounts((prev) => ({
            ...prev,
            [answer]: (prev[answer] ?? 0) + 1,
          }));
        }
      } catch {
        // Silently fail — user can try again
      } finally {
        setSubmitting(false);
      }
    },
    [answered, submitting, onSubmit, question.questionKey]
  );

  // Slider (1-10) variant
  if (question.questionType === "slider") {
    return (
      <SliderQuestion
        question={question}
        existingAnswer={existingAnswer}
        onSubmit={onSubmit}
      />
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">
        {question.questionText}
      </p>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedAnswer === option;
          const count = counts[option] ?? 0;
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={answered || submitting}
              className={cn(
                "relative overflow-hidden rounded-full border text-sm font-medium transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                answered
                  ? "px-4 py-1.5 min-w-[120px]"
                  : "px-4 py-1.5 hover:border-accent/60 cursor-pointer",
                isSelected
                  ? "border-accent bg-accent/15 text-accent"
                  : answered
                    ? "border-border bg-card/50 text-muted-foreground"
                    : "border-border bg-card/50 text-foreground"
              )}
              aria-pressed={isSelected}
            >
              {/* Result bar (shown after voting) */}
              {answered && (
                <div
                  className={cn(
                    "absolute inset-0 rounded-full transition-all duration-500",
                    isSelected ? "bg-accent/10" : "bg-card"
                  )}
                  style={{ width: `${pct}%` }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {option}
                {answered && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {pct}%
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {answered && totalVotes > 0 && (
        <p className="text-[10px] text-muted-foreground">
          {totalVotes} response{totalVotes !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

/** Mini 1-10 slider question variant. */
function SliderQuestion({
  question,
  existingAnswer,
  onSubmit,
}: {
  question: PollQuestion;
  existingAnswer: string | null;
  onSubmit: (
    questionKey: string,
    answer: string
  ) => Promise<{ success: boolean; aggregated?: Record<string, number> }>;
}) {
  const [value, setValue] = useState(
    existingAnswer ? Number(existingAnswer) : 5
  );
  const [submitted, setSubmitted] = useState(existingAnswer != null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (submitted || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(question.questionKey, String(value));
      setSubmitted(true);
    } catch {
      // Silently fail
    } finally {
      setSubmitting(false);
    }
  }, [submitted, submitting, onSubmit, question.questionKey, value]);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">
        {question.questionText}
      </p>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">1</span>
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          disabled={submitted || submitting}
          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-card border border-border"
          aria-label={`${question.questionText} - score from 1 to 10`}
        />
        <span className="text-xs text-muted-foreground">10</span>
        <span className="text-lg font-bold text-accent tabular-nums w-6 text-center">
          {value}
        </span>
        {!submitted && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-3 py-1 rounded-full bg-accent text-background text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "..." : "Submit"}
          </button>
        )}
      </div>
      {submitted && (
        <p className="text-[10px] text-muted-foreground">
          You answered: {value}/10
        </p>
      )}
    </div>
  );
}

// ── Main export ──

interface PollQuestionsProps {
  slug: string;
  questions: PollQuestion[];
  initialResults?: PollResults;
  existingAnswers: Record<string, string | null>;
  onSubmit: (
    questionKey: string,
    answer: string
  ) => Promise<{ success: boolean; aggregated?: Record<string, number> }>;
}

export function PollQuestions({
  slug,
  questions,
  initialResults,
  existingAnswers,
  onSubmit,
}: PollQuestionsProps) {
  const [expanded, setExpanded] = useState(false);

  if (!questions.length) return null;

  return (
    <div>
      {/* Collapsed header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between py-1 group cursor-pointer"
        aria-expanded={expanded}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quick takes
        </span>
        <div className="flex items-center gap-2">
          {!expanded && (
            <span className="text-xs text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
              {questions.length} question{questions.length !== 1 ? "s" : ""} →
            </span>
          )}
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-200",
              expanded && "rotate-180"
            )}
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          expanded ? "max-h-[600px] opacity-100 mt-3" : "max-h-0 opacity-0"
        )}
      >
        <div className="space-y-4">
          {questions.map((q) => (
            <PollQuestionCard
              key={q.questionKey}
              question={q}
              slug={slug}
              initialCounts={initialResults?.[q.questionKey]}
              existingAnswer={existingAnswers[q.questionKey] ?? null}
              onSubmit={onSubmit}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
