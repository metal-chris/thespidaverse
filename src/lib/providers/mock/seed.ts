import type {
  Article,
  MediaEntry,
  Collection,
  MediaDiaryEntry,
  Category,
  Tag,
  CurrentlyConsuming,
  ReactionCounts,
} from "@/types";

// ---------------------------------------------------------------------------
// MockDataset — the shape every scenario builder returns
// ---------------------------------------------------------------------------

export interface MockDataset {
  articles: Article[];
  media: MediaEntry[];
  collections: Collection[];
  journalEntries: MediaDiaryEntry[];
  categories: Category[];
  tags: Tag[];
  moods: string[];
  consuming: CurrentlyConsuming | null;
  reactions: Map<string, ReactionCounts>;
}

// ---------------------------------------------------------------------------
// Scenario registry
// ---------------------------------------------------------------------------

type ScenarioName =
  | "happy-path"
  | "empty-states"
  | "edge-cases"
  | "stress"
  | "new-user";

const SCENARIO_BUILDERS: Record<ScenarioName, () => Promise<MockDataset>> = {
  "happy-path": async () => {
    const { buildHappyPathScenario } = await import(
      "./scenarios/happy-path.scenario"
    );
    return buildHappyPathScenario();
  },
  "empty-states": async () => {
    const { buildEmptyStatesScenario } = await import(
      "./scenarios/empty-states.scenario"
    );
    return buildEmptyStatesScenario();
  },
  "edge-cases": async () => {
    const { buildEdgeCasesScenario } = await import(
      "./scenarios/edge-cases.scenario"
    );
    return buildEdgeCasesScenario();
  },
  stress: async () => {
    const { buildStressScenario } = await import(
      "./scenarios/stress.scenario"
    );
    return buildStressScenario();
  },
  "new-user": async () => {
    const { buildNewUserScenario } = await import(
      "./scenarios/new-user.scenario"
    );
    return buildNewUserScenario();
  },
};

// ---------------------------------------------------------------------------
// Cross-reference wiring
// ---------------------------------------------------------------------------

/**
 * Links journal entries to their matching media objects (by title substring)
 * and links collection articles back to the canonical article array entries.
 */
function wireReferences(dataset: MockDataset): MockDataset {
  // Wire journal entries -> media (match by title)
  for (const entry of dataset.journalEntries) {
    if (!entry.media) {
      const match = dataset.media.find((m) =>
        entry.title.toLowerCase().includes(m.title.toLowerCase())
      );
      if (match) {
        entry.media = match;
      }
    }
  }

  // Wire journal entries -> linkedArticle (match by title substring)
  for (const entry of dataset.journalEntries) {
    if (!entry.linkedArticle) {
      const match = dataset.articles.find((a) =>
        a.title.toLowerCase().includes(entry.title.toLowerCase())
      );
      if (match) {
        entry.linkedArticle = {
          _id: match._id,
          slug: match.slug,
          title: match.title,
        };
      }
    }
  }

  // Ensure collection articles reference canonical article objects
  for (const collection of dataset.collections) {
    collection.articles = collection.articles.map((collectionArticle) => {
      const canonical = dataset.articles.find(
        (a) => a._id === collectionArticle._id
      );
      return canonical || collectionArticle;
    });
  }

  // Ensure every article slug has a reactions entry (fill missing with zeros)
  for (const article of dataset.articles) {
    if (!dataset.reactions.has(article.slug.current)) {
      dataset.reactions.set(article.slug.current, {
        fire: 0,
        love: 0,
        mindblown: 0,
        cool: 0,
        trash: 0,
      });
    }
  }

  return dataset;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

let cachedDataset: MockDataset | null = null;

/**
 * Loads the mock dataset for the active scenario.
 *
 * Reads `process.env.MOCK_SCENARIO` to pick a scenario builder.
 * Defaults to `"happy-path"` when the env var is unset.
 *
 * The result is cached after first load so repeated calls are free.
 */
export async function loadScenario(
  scenarioOverride?: ScenarioName
): Promise<MockDataset> {
  if (cachedDataset) return cachedDataset;

  const name = (scenarioOverride ||
    process.env.MOCK_SCENARIO ||
    "happy-path") as ScenarioName;

  const builder = SCENARIO_BUILDERS[name];
  if (!builder) {
    const valid = Object.keys(SCENARIO_BUILDERS).join(", ");
    throw new Error(
      `Unknown MOCK_SCENARIO "${name}". Valid scenarios: ${valid}`
    );
  }

  const dataset = await builder();
  cachedDataset = wireReferences(dataset);
  return cachedDataset;
}

/**
 * Clears the cached dataset, forcing a fresh build on next `loadScenario()`.
 * Useful in tests that need to switch scenarios mid-run.
 */
export function resetScenarioCache(): void {
  cachedDataset = null;
}
