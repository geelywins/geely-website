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

// Landing page (alamat /lp/nama/): isi Markdown, dikelola lewat Admin > Landing Page
const lp = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/lp' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(200),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    model: z.string().optional(),
    image: z.string().optional(),
    artikel: z.array(z.string()).default([]),
    pesanWa: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { artikel, lp };
