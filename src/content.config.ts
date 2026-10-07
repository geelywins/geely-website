import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const artikel = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/artikel' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(200),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.string().default('Info Geely'),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    video: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { artikel };
