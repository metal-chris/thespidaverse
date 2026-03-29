"use client";

import Image from "next/image";
import { PortableText, type PortableTextComponents as PTComponents } from "@portabletext/react";
import { urlFor } from "@/lib/sanity/image";
import { SpoilerBlock } from "./SpoilerBlock";

export const portableTextComponents: PTComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      let imageUrl = "";
      try {
        imageUrl = urlFor(value).width(800).url() || "";
      } catch {
        // Mock data has fake asset refs — fall back to mockUrl
      }
      if (!imageUrl) imageUrl = value.mockUrl || "";
      if (!imageUrl) return null;
      return (
        <figure className="my-6">
          <div className="relative rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={value.alt || ""}
              width={800}
              height={450}
              className="w-full h-auto"
              sizes="(max-width: 896px) 100vw, 800px"
            />
          </div>
          {value.caption && (
            <figcaption className="mt-2 text-sm text-center text-muted-foreground">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    spoilerBlock: ({ value }) => {
      if (!value?.content) return null;
      return (
        <SpoilerBlock label={value.label || "Spoiler"}>
          <PortableText value={value.content} />
        </SpoilerBlock>
      );
    },
  },
  marks: {
    link: ({ children, value }) => {
      const href = value?.href || "#";
      const isExternal = href.startsWith("http");
      return (
        <a
          href={href}
          className={isExternal ? "spidey-sense-hover" : ""}
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
  },
};
