import imageUrlBuilder from "@sanity/image-url";
import type { SanityImage } from "@/types";
import { client } from "./client";

const builder = client ? imageUrlBuilder(client) : null;

export function urlFor(source: SanityImage) {
  if (!builder) {
    // Return a stub that returns empty string for all methods
    return {
      width: () => ({ height: () => ({ url: () => "" }), url: () => "" }),
      height: () => ({ width: () => ({ url: () => "" }), url: () => "" }),
      url: () => "",
      image: () => urlFor(source),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }
  // Defaults: modern format (AVIF/WebP), high quality, retina-density source.
  // Call sites still control width/height/crop; these only affect bytes & sharpness.
  return builder.image(source).auto("format").quality(90).dpr(2);
}
