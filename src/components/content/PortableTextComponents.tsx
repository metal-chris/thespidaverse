"use client";

import Image from "next/image";
import { PortableText, type PortableTextComponents as PTComponents } from "@portabletext/react";
import { urlFor } from "@/lib/sanity/image";
import { slugify } from "@/lib/utils";
import { SpoilerBlock } from "./SpoilerBlock";
import { SourceLink } from "./SourceLink";
import { TierListChart } from "./TierListChart";
import { VideoEmbed } from "./VideoEmbed";
import { ImageGallery } from "./ImageGallery";

export const portableTextComponents: PTComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      let imageUrl = "";
      try {
        imageUrl = urlFor(value).width(640).url() || "";
      } catch {
        // Mock data has fake asset refs — fall back to mockUrl
      }
      if (!imageUrl) imageUrl = value.mockUrl || "";
      if (!imageUrl) return null;
      return (
        <figure className="my-6 mx-auto max-w-[640px]">
          <div className="relative rounded-lg overflow-hidden bg-muted/20 animate-pulse">
            <Image
              src={imageUrl}
              alt={value.alt || ""}
              width={640}
              height={360}
              className="w-full h-auto transition-opacity duration-500"
              sizes="(max-width: 768px) 100vw, 640px"
              style={{ opacity: 0 }}
              onLoad={(e) => {
                const img = e.currentTarget;
                img.style.opacity = '1';
                img.parentElement?.classList.remove('animate-pulse', 'bg-muted/20');
              }}
            />
          </div>
          {value.caption && (
            <figcaption className="mt-1 text-sm text-center text-muted-foreground">
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
          {/* Pass components through: without it, links and headings inside a
              spoiler fall back to @portabletext/react defaults and lose the
              external-link handling from `marks.link` below. */}
          <PortableText value={value.content} components={portableTextComponents} />
        </SpoilerBlock>
      );
    },
    videoEmbed: ({ value }) => {
      if (!value?.url || !value?.provider) return null;
      return (
        <VideoEmbed
          provider={value.provider}
          url={value.url}
          caption={value.caption}
        />
      );
    },
    imageGallery: ({ value }) => {
      if (!value?.images || value.images.length === 0) return null;
      return <ImageGallery images={value.images} layout={value.layout} />;
    },
    tierList: ({ value }) => <TierListChart value={value} />,
    pullquote: ({ value }: any) => {
      if (!value?.text) return null;
      return (
        <aside className="my-10 py-6 border-l-4 border-accent pl-6 md:pl-8 not-prose">
          <blockquote className="text-xl md:text-2xl font-bold text-foreground leading-snug italic">
            {value.text}
          </blockquote>
          {value.attribution && (
            <cite className="mt-3 block text-sm text-muted-foreground not-italic">
              — {value.attribution}
            </cite>
          )}
        </aside>
      );
    },
  },
  marks: {
    link: ({ children, value }) => (
      <SourceLink value={value}>{children}</SourceLink>
    ),
  },
  block: {
    h2: ({ children, value }: any) => {
      const text = value?.children?.map((c: any) => c.text).join("") || "";
      const id = slugify(text);
      return <h2 id={id} className="scroll-mt-24">{children}</h2>;
    },
    h3: ({ children, value }: any) => {
      const text = value?.children?.map((c: any) => c.text).join("") || "";
      const id = slugify(text);
      return <h3 id={id} className="scroll-mt-24">{children}</h3>;
    },
  },
};
