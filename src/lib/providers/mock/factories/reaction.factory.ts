import { faker } from "@faker-js/faker";
import type { ReactionCounts } from "@/types";

export function createReactions(
  overrides: Partial<ReactionCounts> = {}
): ReactionCounts {
  return {
    fire: faker.number.int({ min: 0, max: 500 }),
    love: faker.number.int({ min: 0, max: 300 }),
    mindblown: faker.number.int({ min: 0, max: 200 }),
    cool: faker.number.int({ min: 0, max: 250 }),
    trash: faker.number.int({ min: 0, max: 50 }),
    ...overrides,
  };
}

export function createEmptyReactions(): ReactionCounts {
  return { fire: 0, love: 0, mindblown: 0, cool: 0, trash: 0 };
}
