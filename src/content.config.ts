import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const publicationDate = z.union([z.string(), z.date()]).pipe(z.coerce.date());

const writingSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().optional(),
  pubDate: publicationDate,
  updatedDate: publicationDate.optional(),
  draft: z.boolean().default(false),
  unlisted: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

const essays = defineCollection({
  loader: glob({ base: "./src/content/essays", pattern: "**/*.md" }),
  schema: writingSchema,
});

const poems = defineCollection({
  loader: glob({ base: "./src/content/poems", pattern: "**/*.md" }),
  schema: writingSchema,
});

export const collections = { essays, poems };
