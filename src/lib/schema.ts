// content.config.ts とテストの両方から使う。テストは astro:content を通さずに frontmatter を検証する
import { z } from 'astro/zod'
import { POST_TYPES } from './site'

export const termRefSchema = z
  .object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    slug: z.string().min(1),
  })
  .strict()

export const postSchema = z
  .object({
    id: z.number().int().positive(),
    type: z.enum(POST_TYPES),
    // デコード済みの文字列。URL にするときは postPath() でエンコードする
    slug: z.string().min(1),
    title: z.string().min(1),
    date: z.coerce.date(),
    modified: z.coerce.date().optional(),
    excerpt: z.string().min(1).optional(),
    // 空文字の記事が 2 件ある。表示にはこの値をそのまま使う
    primaryTag: z.string(),
    terms: z.array(termRefSchema),
    clipUrl: z.url().optional(),
    demoUrl: z.url().optional(),
    // 前後記事のテストにだけ使う。旧ページがなかった日本語 slug の 2 件にはない
    legacy: z
      .object({
        prev: z.string().min(1).nullable(),
        next: z.string().min(1).nullable(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .refine((d) => d.type === 'clip' || d.clipUrl === undefined, {
    message: 'clipUrl は clip だけ',
    path: ['clipUrl'],
  })
  .refine((d) => d.type !== 'clip' || d.demoUrl === undefined, {
    message: 'demoUrl は tip と lab だけ',
    path: ['demoUrl'],
  })

export type PostData = z.infer<typeof postSchema>

export const termSchema = z
  .object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    slug: z.string().min(1),
    count: z.number().int().nonnegative(),
  })
  .strict()

export const termListSchema = z.array(termSchema)

export type Term = z.infer<typeof termSchema>
