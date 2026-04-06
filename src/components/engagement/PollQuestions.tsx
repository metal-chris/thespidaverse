"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import type { PollQuestion, PollResults } from "@/types";

// ── Shared types ──

type SubmitFn = (
  questionKey: string,
  answer: string
) => Promise<{ success: boolean; aggregated?: Record<string, number> }>;

/** Default answer labels for built-in question types. */
const BUILTIN_OPTIONS: Record<string, string[]> = {
  yes_no: ["Yes", "No"],
  agree_scale: ["Agree", "Somewhere in the middle", "Disagree"],
};

// ── Helpers ──

/** Compute weighted average from { "5": 3, "8": 7, ... } aggregated counts. */
function computeAverage(counts: Record<string, number>): number {
  let total = 0;
  let sum = 0;
  for (const [val, count] of Object.entries(counts)) {
    const n = Number(val);
    if (!Number.isNaN(n)) {
      sum += n * count;
      total += count;
    }
  }
  return total > 0 ? Math.round((sum / total) * 10) / 10 : 0;
}

/** Hot take emoji for a 1-10 value. */
function hotTakeEmoji(v: number): string {
  if (v <= 3) return "\u{1F9CA}"; // 🧊
  if (v <= 5) return "\u{1F610}"; // 😐
  if (v <= 7) return "\u{1F336}\uFE0F"; // 🌶️
  if (v <= 9) return "\u{1F525}"; // 🔥
  return "\u{1F480}"; // 💀
}

// ── Standard button-based questions (yes_no, agree_scale, multiple_choice) ──

function PollQuestionCard({
  question,
  initialCounts,
  existingAnswer,
  onSubmit,
}: {
  question: PollQuestion;
  slug: string;
  initialCounts?: Record<string, number>;
  existingAnswer: string | null;
  onSubmit: SubmitFn;
}) {
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

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">
        {question.questionText}
      </p>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedAnswer === option;
          const count = counts[option] ?? 0;
          const pct =
            totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

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

// ── Slider question (1-10) — with community average fix ──

function SliderQuestion({
  question,
  existingAnswer,
  onSubmit,
}: {
  question: PollQuestion;
  existingAnswer: string | null;
  onSubmit: SubmitFn;
}) {
  const [value, setValue] = useState(
    existingAnswer ? Number(existingAnswer) : 5
  );
  const [submitted, setSubmitted] = useState(existingAnswer != null);
  const [submitting, setSubmitting] = useState(false);
  const [aggregated, setAggregated] = useState<Record<string, number> | null>(
    null
  );

  const communityAvg = aggregated ? computeAverage(aggregated) : null;

  const handleSubmit = useCallback(async () => {
    if (submitted || submitting) return;
    setSubmitting(true);
    try {
      const result = await onSubmit(question.questionKey, String(value));
      setSubmitted(true);
      if (result.aggregated) setAggregated(result.aggregated);
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
        <div className="flex gap-3 text-[10px] text-muted-foreground">
          <span>You answered: {value}/10</span>
          {communityAvg !== null && (
            <span>
              Community avg: <span className="text-accent font-semibold">{communityAvg}</span>/10
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── This or That ──

function ThisOrThatQuestion({
  question,
  initialCounts,
  existingAnswer,
  onSubmit,
}: {
  question: PollQuestion;
  initialCounts?: Record<string, number>;
  existingAnswer: string | null;
  onSubmit: SubmitFn;
}) {
  const options = question.options?.length === 2
    ? question.options
    : ["Option A", "Option B"];

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(
    existingAnswer
  );
  const [counts, setCounts] = useState<Record<string, number>>(
    initialCounts ?? {}
  );
  const [submitting, setSubmitting] = useState(false);
  const answered = selectedAnswer != null;

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
          setCounts((prev) => ({
            ...prev,
            [answer]: (prev[answer] ?? 0) + 1,
          }));
        }
      } catch {
        // Silently fail
      } finally {
        setSubmitting(false);
      }
    },
    [answered, submitting, onSubmit, question.questionKey]
  );

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">
        {question.questionText}
      </p>

      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-0">
        {options.map((option, i) => {
          const isSelected = selectedAnswer === option;
          const count = counts[option] ?? 0;
          const pct =
            totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

          return (
            <div key={option} className="contents">
              {i === 1 && (
                <div className="flex items-center justify-center px-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                    vs
                  </span>
                </div>
              )}
              <button
                onClick={() => handleSelect(option)}
                disabled={answered || submitting}
                className={cn(
                  "relative overflow-hidden rounded-lg border p-3 text-center text-sm font-medium transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  !answered && "hover:border-accent/60 cursor-pointer",
                  isSelected
                    ? "border-accent bg-accent/15 text-accent"
                    : answered
                      ? "border-border bg-card/30 text-muted-foreground"
                      : "border-border bg-card/50 text-foreground"
                )}
                aria-pressed={isSelected}
              >
                {answered && (
                  <div
                    className={cn(
                      "absolute inset-0 transition-all duration-500",
                      isSelected ? "bg-accent/10" : "bg-card/50"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                )}
                <span className="relative z-10">
                  {option}
                  {answered && (
                    <span className="block text-xs text-muted-foreground tabular-nums mt-1">
                      {pct}% ({count})
                    </span>
                  )}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {answered && totalVotes > 0 && (
        <p className="text-[10px] text-muted-foreground text-center">
          {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

// ── Ranking (drag-and-drop) ──

function SortableItem({
  id,
  index,
  disabled,
}: {
  id: string;
  index: number;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
        isDragging
          ? "border-accent bg-accent/10 shadow-lg z-10"
          : "border-border bg-card/50",
        disabled && "opacity-70"
      )}
    >
      <span className="text-xs font-bold text-accent tabular-nums w-4 shrink-0">
        {index + 1}
      </span>
      {!disabled && (
        <button
          className="touch-none cursor-grab active:cursor-grabbing p-0.5 text-muted-foreground hover:text-foreground shrink-0"
          aria-label={`Drag to reorder ${id}`}
          {...attributes}
          {...listeners}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.5" />
            <circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" />
            <circle cx="11" cy="13" r="1.5" />
          </svg>
        </button>
      )}
      <span className="text-foreground">{id}</span>
    </div>
  );
}

function RankingQuestion({
  question,
  initialCounts,
  existingAnswer,
  onSubmit,
}: {
  question: PollQuestion;
  initialCounts?: Record<string, number>;
  existingAnswer: string | null;
  onSubmit: SubmitFn;
}) {
  const items = question.rankingItems ?? question.options ?? [];

  const [order, setOrder] = useState<string[]>(() => {
    if (existingAnswer) return existingAnswer.split("|");
    return [...items];
  });
  const [submitted, setSubmitted] = useState(existingAnswer != null);
  const [submitting, setSubmitting] = useState(false);
  const [aggregated, setAggregated] = useState<Record<string, number>>(
    initialCounts ?? {}
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (submitted) return;
      const { active, over } = event;
      if (over && active.id !== over.id) {
        setOrder((prev) => {
          const oldIdx = prev.indexOf(active.id as string);
          const newIdx = prev.indexOf(over.id as string);
          return arrayMove(prev, oldIdx, newIdx);
        });
      }
    },
    [submitted]
  );

  const handleSubmit = useCallback(async () => {
    if (submitted || submitting) return;
    setSubmitting(true);
    try {
      const answer = order.join("|");
      const result = await onSubmit(question.questionKey, answer);
      setSubmitted(true);
      if (result.aggregated) setAggregated(result.aggregated);
    } catch {
      // Silently fail
    } finally {
      setSubmitting(false);
    }
  }, [submitted, submitting, order, onSubmit, question.questionKey]);

  // Parse aggregated ranking data: count how often each item appears at each position
  const positionStats = useMemo(() => {
    if (!submitted || Object.keys(aggregated).length === 0) return null;

    // aggregated is { "A|B|C": 5, "B|A|C": 3, ... }
    const posMap: Record<number, Record<string, number>> = {};
    for (const [ranking, count] of Object.entries(aggregated)) {
      const parts = ranking.split("|");
      parts.forEach((item, pos) => {
        if (!posMap[pos]) posMap[pos] = {};
        posMap[pos][item] = (posMap[pos][item] ?? 0) + count;
      });
    }

    // For each position, find the most common item
    return Object.entries(posMap)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([, itemCounts]) => {
        const sorted = Object.entries(itemCounts).sort(
          ([, a], [, b]) => b - a
        );
        return sorted[0]?.[0] ?? "—";
      });
  }, [submitted, aggregated]);

  if (!items.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">
        {question.questionText}
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5">
            {order.map((item, i) => (
              <SortableItem
                key={item}
                id={item}
                index={i}
                disabled={submitted}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {!submitted && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-3 py-1 rounded-full bg-accent text-background text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "..." : "Lock in ranking"}
          </button>
          <span className="text-[10px] text-muted-foreground/60">
            All votes are final
          </span>
        </div>
      )}

      {submitted && positionStats && positionStats.length > 0 && (
        <div className="text-[10px] text-muted-foreground space-y-0.5">
          <p className="font-medium">Community&apos;s top picks:</p>
          {positionStats.map((item, i) => (
            <p key={i}>
              <span className="text-accent font-semibold">#{i + 1}</span> {item}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Hot Take Meter (ice-to-fire slider) ──

function HotTakeQuestion({
  question,
  existingAnswer,
  onSubmit,
}: {
  question: PollQuestion;
  existingAnswer: string | null;
  onSubmit: SubmitFn;
}) {
  const [value, setValue] = useState(
    existingAnswer ? Number(existingAnswer) : 5
  );
  const [submitted, setSubmitted] = useState(existingAnswer != null);
  const [submitting, setSubmitting] = useState(false);
  const [aggregated, setAggregated] = useState<Record<string, number> | null>(
    null
  );

  const communityAvg = aggregated ? computeAverage(aggregated) : null;
  const heatPct = ((value - 1) / 9) * 100;

  const handleSubmit = useCallback(async () => {
    if (submitted || submitting) return;
    setSubmitting(true);
    try {
      const result = await onSubmit(question.questionKey, String(value));
      setSubmitted(true);
      if (result.aggregated) setAggregated(result.aggregated);
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
        <span className="text-xs text-muted-foreground">Cold Take</span>
        <div className="relative flex-1">
          <input
            type="range"
            min={1}
            max={10}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            disabled={submitted || submitting}
            className="hot-take-slider w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ "--heat": `${heatPct}%` } as React.CSSProperties}
            aria-label={`${question.questionText} - ${value}/10 ${hotTakeEmoji(value)}`}
          />
        </div>
        <span className="text-xs text-muted-foreground">Scorching</span>
        <span className="text-lg w-8 text-center" aria-hidden="true">
          {hotTakeEmoji(value)}
        </span>
        <span className="text-lg font-bold text-foreground tabular-nums w-6 text-center">
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
        <div className="flex gap-3 text-[10px] text-muted-foreground">
          <span>
            Your take: {hotTakeEmoji(value)} {value}/10
          </span>
          {communityAvg !== null && (
            <span>
              Avg hot take:{" "}
              <span className="text-accent font-semibold">
                {hotTakeEmoji(Math.round(communityAvg))} {communityAvg}
              </span>
              /10
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Question router ──

function QuestionRouter({
  question,
  slug,
  initialCounts,
  existingAnswer,
  onSubmit,
}: {
  question: PollQuestion;
  slug: string;
  initialCounts?: Record<string, number>;
  existingAnswer: string | null;
  onSubmit: SubmitFn;
}) {
  switch (question.questionType) {
    case "slider":
      return (
        <SliderQuestion
          question={question}
          existingAnswer={existingAnswer}
          onSubmit={onSubmit}
        />
      );
    case "this_or_that":
      return (
        <ThisOrThatQuestion
          question={question}
          initialCounts={initialCounts}
          existingAnswer={existingAnswer}
          onSubmit={onSubmit}
        />
      );
    case "ranking":
      return (
        <RankingQuestion
          question={question}
          initialCounts={initialCounts}
          existingAnswer={existingAnswer}
          onSubmit={onSubmit}
        />
      );
    case "hot_take":
      return (
        <HotTakeQuestion
          question={question}
          existingAnswer={existingAnswer}
          onSubmit={onSubmit}
        />
      );
    default:
      return (
        <PollQuestionCard
          question={question}
          slug={slug}
          initialCounts={initialCounts}
          existingAnswer={existingAnswer}
          onSubmit={onSubmit}
        />
      );
  }
}

// ── Main export ──

interface PollQuestionsProps {
  slug: string;
  questions: PollQuestion[];
  initialResults?: PollResults;
  existingAnswers: Record<string, string | null>;
  onSubmit: SubmitFn;
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

      {/* Expanded content — grid-rows animation for smooth height */}
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
          expanded
            ? "grid-rows-[1fr] opacity-100 mt-3"
            : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden min-h-0">
          {/* Vote finality warning */}
          <p className="text-[10px] text-muted-foreground/50 italic mb-3">
            All votes are final — choose wisely!
          </p>

          <div className="space-y-4">
            {questions.map((q) => (
              <QuestionRouter
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
    </div>
  );
}
