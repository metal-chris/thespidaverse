/**
 * Backfill seed: the-full-web slot
 * Subject: The Super Mario Galaxy Movie (2026) review
 *
 * Slot date is assigned dynamically from Sanity via assignBackfillSlot() —
 * do NOT hardcode a date here. The oldest unclaimed the-full-web slot is
 * returned and the draft is written there.
 *
 * Usage:
 *   npx tsx scripts/seed-backfill-super-mario-galaxy-movie-review.ts          # Create / overwrite draft
 *   npx tsx scripts/seed-backfill-super-mario-galaxy-movie-review.ts --dry    # Print plan, no writes
 *
 * Requires:
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local
 *   - SANITY_WRITE_TOKEN in .env.local
 */

import { createClient, type SanityClient } from "@sanity/client";
import dotenv from "dotenv";
import { assignBackfillSlot, publishedAtFor } from "./lib/backfillSlots";

dotenv.config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;
const dryRun = process.argv.includes("--dry");

if (!projectId || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_WRITE_TOKEN in .env.local");
  process.exit(1);
}

const client: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

// ------------------------------------------------------------
// Portable Text helpers
// ------------------------------------------------------------

type Span = { _type: "span"; _key: string; text: string; marks: string[] };
type Block = {
  _type: "block";
  _key: string;
  style: string;
  children: Span[];
  markDefs: never[];
};
type BodyItem = { style: "normal" | "h2" | "h3" | "h4" | "blockquote"; text: string };

function makeBody(items: BodyItem[]): Block[] {
  return items.map((item, i) => {
    const key = `k${i.toString().padStart(3, "0")}`;
    return {
      _type: "block",
      _key: key,
      style: item.style,
      children: [{ _type: "span", _key: `${key}s`, text: item.text, marks: [] }],
      markDefs: [],
    };
  });
}

const p = (text: string): BodyItem => ({ style: "normal", text });
const h2 = (text: string): BodyItem => ({ style: "h2", text });

// ------------------------------------------------------------
// Article content
// ------------------------------------------------------------

const SLUG = "super-mario-galaxy-movie-review";

const BODY: BodyItem[] = [
  p("Four hundred million dollars. Not even the full opening weekend. That's the number before any accountant had finished their coffee on Monday, March 31."),
  p("The critics handed The Super Mario Galaxy Movie a 43% on Rotten Tomatoes. The audiences handed it a 91%. The Cinemascore was an A. Four days into its run it had already cleared what a lot of studios would accept as their entire theatrical take."),
  p("So who was right? I'll be direct: the audience was right. The critics, by and large, graded this movie against a rubric it was never trying to pass."),
  h2("The first movie set an impossible bar"),
  p("The comparison is unavoidable. The Super Mario Bros. Movie in 2023 opened to $377M globally and closed at $1.36 billion. It had a 59% critical score at launch. Critics called it thin, aggressively fan-serviced, a feature-length Nintendo commercial. They were not entirely wrong. They were also missing the point by about a mile."),
  p("The Galaxy movie is in the same critical position and is probably headed to the same financial destination — it crossed $629M by week three and the trajectory is clear. This is a cultural event movie, not an awards contender. Grading it on whether it has the narrative depth of a Pixar prestige film is like reviewing a theme park ride for its lack of character development."),
  h2("What the movie actually does"),
  p("The Galaxy movie takes Mario, Luigi, and company entirely off Mushroom Kingdom and flings them into space to rescue Rosalina — the Observatory's caretaker, voiced by Brie Larson — from Bowser Jr., who plans to drain her power and fire a planet-destroying cannon. The premise is exactly as video-game-brained as it sounds, and the movie knows it. It does not pretend otherwise for a single frame."),
  p("What this premise gives Illumination's design team is something the first film didn't have: latitude. When your world is a galaxy, you're not constrained by recognizable Mushroom Kingdom landmarks. The Galaxy movie builds planets from scratch, commits to a color palette that is fully iridescent, and gives itself visual permission to go completely unhinged during its action sequences."),
  p("The set pieces in this film are the most visually ambitious animation Illumination has ever produced. The observatory sequence in the second act — I'll leave the specifics intentionally vague — is legitimately one of the best five minutes of animation I've seen this year. The scope is enormous, the physics are deliberately broken in the ways the game always played with, and the studio clearly understood that space means you can light a scene any way you want. They took full advantage."),
  h2("Brie Larson, Rosalina, and the reveal"),
  p("Rosalina is the emotional spine of the film, and Brie Larson does the work. I went in prepared to have a casting take and I came out not having one. The Rosalina she delivers is quieter and more grounded than the character's game appearance, and the decision to make her backstory — the caretaker of the Lumas, the mother-figure she's built her cosmic family into — the emotional center of the film pays off in the final stretch."),
  p("The reveal that Rosalina is Princess Peach's sister has lit up the comment sections. Whether it's a good story decision is a fair debate — my read is that it's a crowdpleaser pivot that may or may not survive whatever the next film's canon demands — but within this movie it functions. It gives Peach a personal stake in the rescue mission beyond 'Mario goes to space,' and it adds weight to Anya Taylor-Joy's performance in scenes that would otherwise feel like holding pattern."),
  p("Charlie Day's Luigi also earns his subplot this time. The first movie gave him the horror-comedy arc; this one gives him something that actually resolves. He's not just comic relief anymore. He's the character who has to make the most consequential choice in the second act, and the moment lands."),
  h2("Bowser Jr. is a different problem than Bowser"),
  p("Jack Black's Bowser was the undisputed highlight of the 2023 film. The Galaxy movie has the structural problem of replacing a force of nature with a hurt kid who has access to a planet-destroying cannon. That is a different kind of villain, and the movie commits to the distinction."),
  p("Bowser Jr. isn't trying to take over anything for domination's sake. He's trying to honor his father's legacy with the only thing he knows how to do: violence at scale. The voice performance sells it, and to the film's credit, the third act gives him a resolution that isn't just 'villains lose and get punished.' Whether that lands for you will depend on how much you're buying what the movie is selling emotionally in its final twenty minutes."),
  h2("What the critics got wrong"),
  p("The critical consensus centers on two complaints: the story is thin, and the movie prioritizes spectacle over character depth. Both are technically true. Both are also describing what The Super Mario Galaxy Movie is supposed to be."),
  p("Spectacle is a genre. The best summer blockbusters are not good because they have Tolstoy-level characterization — they're good because they deliver on their promise. The Super Mario Galaxy Movie promises a gorgeous, loud, emotionally accessible space adventure with some of the best visual comedy Illumination has produced. It delivers exactly that."),
  p("The scenes with the Lumas are genuinely funny, the gag that runs through the third act involving a particular star power-up is the best running joke in the franchise, and the ending is earned not because the script is complicated but because the visual storytelling is clear enough that you know exactly who everyone is by the time it matters."),
  h2("The valid criticism"),
  p("The one complaint I'm taking seriously is the pacing in the second act. There's a stretch of roughly twenty minutes where the film is clearly transitioning between set pieces and the seams show. The Comet Observatory arrival through the first planet sequence feels like two different versions of the same scene got stitched together, and the rhythm wobble takes longer than it should to recover from."),
  p("This is where the 'thin story' critique has actual purchase. The film isn't padded — it moves — but the middle third needed tighter editing. The theatrical cut runs 94 minutes. An 88-minute version of this movie might be the better movie."),
  h2("Should you see it"),
  p("Yes. In the biggest screen you can access, in a theater if at all possible. The Galaxy movie is built to be an event, and it delivers the event. If you have kids, bring them immediately. If you played the game, the fan service is present but calibrated — it's homage, not obligation. If you've never held a Nintendo controller in your life, the movie tells you everything you need to know in its first fifteen minutes."),
  p("I've seen it twice now. It holds up. The first Mario film needed a couple of watches to reveal its confidence; the Galaxy movie is confident on the first pass in a way that feels like a sequel that actually knows what it's doing."),
  h2("Web rating: 83"),
  p("Subtract a few points for the second act pacing wobble. Add them back if you're watching on IMAX. This is a good movie that critics graded as a failed prestige film. It was never trying to be a prestige film. It was trying to be the best Mario movie possible, and on balance, it's close."),
  p("The audience was right. Tell me where you land in the poll below."),
];

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------

async function main() {
  console.log("Assigning backfill slot for the-full-web...");
  const slot = await assignBackfillSlot(client, "the-full-web");
  console.log(`  Slot: ${slot.date} (${slot.day})`);

  if (dryRun) {
    console.log(`  [dry run] Would create: drafts.backfill-${SLUG}`);
    console.log(`  publishedAt: ${publishedAtFor(slot)}`);
    console.log(`  title: The Super Mario Galaxy Movie Got a 43% on Rotten Tomatoes. The Audience Was Right.`);
    console.log("  (dry run — no writes)");
    return;
  }

  // Resolve category ID
  const categoryDocs: Array<{ _id: string; slug: { current: string } }> = await client.fetch(
    `*[_type=="category" && slug.current == "movies"]{_id, slug}`
  );
  if (!categoryDocs.length) {
    console.error("Missing category in Sanity: movies");
    process.exit(1);
  }
  const categoryId = categoryDocs[0]._id;

  const docId = `drafts.backfill-${SLUG}`;

  const doc = {
    _id: docId,
    _type: "article",
    title: "The Super Mario Galaxy Movie Got a 43% on Rotten Tomatoes. The Audience Was Right.",
    slug: { _type: "slug", current: SLUG },
    format: "the-full-web",
    publishedAt: publishedAtFor(slot),
    excerpt:
      "Critics handed the Galaxy movie a 43%. Audiences handed it a 91%. Four hundred million dollars later, Nintendo and Illumination have proven that the discourse doesn't matter when the movie actually works.",
    body: makeBody(BODY),
    spoilerFree: false,
    category: { _type: "reference", _ref: categoryId },
    moodTags: ["hype", "fun", "thoughtful"],
    mediaType: "movie",
    webRating: 83,
    readingTime: 7,
    mediaLength: "94 minutes",
    pollConfig: {
      enableCommunityRating: true,
      pollQuestions: [
        {
          _key: "q0",
          questionKey: "galaxy_critics_wrong",
          questionText: "The critics got the Galaxy movie wrong.",
          questionType: "agree_scale",
        },
      ],
    },
  };

  console.log(`  Creating ${docId}...`);
  try {
    await client.createOrReplace(doc);
    console.log("  Done.");
  } catch (err) {
    console.error(`  Failed: ${(err as Error).message}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
