import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { postSchema } from './lib/schema'

const posts = defineCollection({
  loader: glob({
    base: './src/content/posts',
    pattern: '{tip,clip,lab}/*.md',
    // glob loader は frontmatter の slug をそのまま id にするので、type をまたいだ衝突を避けて type/slug にする
    generateId: ({ data }) => `${data.type}/${data.slug}`,
  }),
  schema: postSchema,
})

export const collections = { posts }
