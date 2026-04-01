/**
 * Patch existing gallery pieces with images from external URLs.
 * Fetches each image, uploads to Sanity's asset pipeline, and patches the document.
 *
 * Usage: npx tsx scripts/patch-gallery-images.ts
 */

import { createClient } from "@sanity/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_WRITE_TOKEN in .env.local");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

// slug -> image URL mapping
const IMAGE_MAP: Record<string, string> = {
  // DeviantArt (OEmbed URLs)
  "miles-morales-across-the-spider-verse":
    "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/49ec1464-d899-400a-b608-c48c76b500d2/dfoxgpr-8b556792-f920-477a-b859-60e14a28dab1.jpg/v1/fill/w_1280,h_1280,q_75,strp/miles_morales___spider_man_across_the_spider_verse_by_patrickbrown_dfoxgpr-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI4MCIsInBhdGgiOiIvZi80OWVjMTQ2NC1kODk5LTQwMGEtYjYwOC1jNDhjNzZiNTAwZDIvZGZveGdwci04YjU1Njc5Mi1mOTIwLTQ3N2EtYjg1OS02MGUxNGEyOGRhYjEuanBnIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.T9FCvVuRc8uq3wmSrWfyKDeDZCIgpR7cQ-lmkQmIygU",

  "spider-verse-miles-morales-fanart-2024":
    "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/e4308bda-6c46-4927-842c-b5f282afb6d9/dh848in-db61e785-722c-4672-8272-f99ce8c7b26e.jpg/v1/fill/w_774,h_1032,q_70,strp/spider_man_miles_morales_fanart_2024_by_souleater2045_dh848in-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTcwNyIsInBhdGgiOiIvZi9lNDMwOGJkYS02YzQ2LTQ5MjctODQyYy1iNWYyODJhZmI2ZDkvZGg4NDhpbi1kYjYxZTc4NS03MjJjLTQ2NzItODI3Mi1mOTljZThjN2IyNmUuanBnIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.BdxDb-F78eKT1DeksLs6srKGuQNw3kFcesSEY0dopVU",

  "miles-morales-across-the-spider-verse1":
    "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/a4cd88e4-1d9c-4836-84da-88b4b80e19df/dfykvmn-54755f26-b157-426c-981e-cebef928195a.png/v1/fill/w_909,h_879,q_70,strp/miles_morales__across_the_spider_verse__by_mrconcepts_dfykvmn-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi9hNGNkODhlNC0xZDljLTQ4MzYtODRkYS04OGI0YjgwZTE5ZGYvZGZ5a3Ztbi01NDc1NWYyNi1iMTU3LTQyNmMtOTgxZS1jZWJlZjkyODE5NWEucG5nIiwiaGVpZ2h0IjoiPD0xMjM4Iiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.placeholder",

  "venom-vs-spider-man":
    "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/0737f9ae-06a6-4b12-a92c-a0e565b9835c/dfsijt1-859d9ed1-c298-4de8-a709-6c006f43ef37.jpg/v1/fill/w_900,h_507,q_75,strp/venom_vs_spiderman_fan_art__by_thecomicartist_dfsijt1-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NTA3IiwicGF0aCI6Ii9mLzA3MzdmOWFlLTA2YTYtNGIxMi1hOTJjLWEwZTU2NWI5ODM1Yy9kZnNpanQxLTg1OWQ5ZWQxLWMyOTgtNGRlOC1hNzA5LTZjMDA2ZjQzZWYzNy5qcGciLCJ3aWR0aCI6Ijw9OTAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.miaHIMp0XRUaXDnL8F3HIB8f_VeYxxoVAHRCf4Dxqec",

  "spider-man-vs-venom-metro":
    "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/a782895b-e362-432c-8332-4faec5f27927/dfwtdxl-701c63b3-3c1a-4a78-a510-af76e9bf4e60.jpg/v1/fill/w_730,h_1095,q_70,strp/spiderman_vs__venom__marvel_art__part_one__metro__by_andyshow72_dfwtdxl-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi9hNzgyODk1Yi1lMzYyLTQzMmMtODMzMi00ZmFlYzVmMjc5MjcvZGZ3dGR4bC03MDFjNjNiMy0zYzFhLTRhNzgtYTUxMC1hZjc2ZTliZjRlNjAuanBnIiwiaGVpZ2h0IjoiPD0xOTIwIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uud2F0ZXJtYXJrIl0sIndtayI6eyJwYXRoIjoiL3dtL2E3ODI4OTViLWUzNjItNDMyYy04MzMyLTRmYWVjNWYyNzkyNy9hbmR5c2hvdzcyLTQucG5nIiwib3BhY2l0eSI6OTUsInByb3BvcnRpb25zIjowLjQ1LCJncmF2aXR5IjoiY2VudGVyIn19.LaNZ_s51Q8pqtY_cUrFuA1yQ_MCtt_-aR7cL_95JMsY",

  // ArtStation (OG image URLs)
  "gwen-stacy-miles-morales":
    "https://cdna.artstation.com/p/assets/covers/images/064/125/090/large/hossein-diba-hossein-diba-ar.jpg?1687189355",

  "miles-and-gwen-fanart":
    "https://cdna.artstation.com/p/assets/images/images/063/871/456/large/vladislav-pantic-mandgvp.jpg?1686582056",

  "miles-morales-and-gwen-stacy":
    "https://cdna.artstation.com/p/assets/images/images/047/160/752/large/brandon-sagraves-new4.jpg?1646911019",

  "miles-morales-spider-verse-fan-sculpt":
    "https://cdnb.artstation.com/p/assets/covers/images/015/008/031/large/yan-sculpts-miles-morales-c03-01.jpg?1546694552",

  "miles-morales-across-the-spider-verse-fanart":
    "https://cdna.artstation.com/p/assets/covers/images/066/033/532/large/szymon-zubek-szymon-zubek-miles-front.jpg?1691862179",

  "miles-and-gwen-spider-verse-fan-art":
    "https://cdna.artstation.com/p/assets/images/images/065/319/812/large/pedro-wallace-298-sem-titulo-20230627020033.jpg?1690076766",

  "gwen-stacy-spider-verse-sculpt":
    "https://cdnb.artstation.com/p/assets/covers/images/017/930/827/large/yuditya-afandi-square-cover.jpg?1557889954",
};

async function main() {
  const slugs = Object.keys(IMAGE_MAP);
  console.log(`\nPatching ${slugs.length} gallery pieces with images...\n`);

  let success = 0;
  let failed = 0;

  for (const slug of slugs) {
    const imageUrl = IMAGE_MAP[slug];

    try {
      // Find the document by slug
      const doc = await client.fetch(
        `*[_type == "galleryPiece" && slug.current == $slug][0]{ _id, title }`,
        { slug }
      );

      if (!doc) {
        console.error(`  ? No document found for slug: ${slug}`);
        failed++;
        continue;
      }

      // Fetch and upload the image
      console.log(`  Uploading: ${doc.title}...`);
      const res = await fetch(imageUrl);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

      const buffer = Buffer.from(await res.arrayBuffer());
      const asset = await client.assets.upload("image", buffer, {
        filename: `${slug}.jpg`,
      });

      // Patch the document
      await client.patch(doc._id).set({
        image: {
          _type: "image",
          asset: { _type: "reference", _ref: asset._id },
        },
      }).commit();

      console.log(`  ✓ ${doc.title}`);
      success++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${slug}: ${msg}`);
      failed++;
    }
  }

  console.log(`\nDone! ${success} patched, ${failed} failed.\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
