// 記事の Markdown とターム JSON を astro:content を通さずに読む
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseFrontmatter } from '@astrojs/internal-helpers/frontmatter'
import { postSchema } from '../../src/lib/schema'
import { POST_TYPES, TAXONOMIES } from '../../src/lib/site'

export const load = (root: string) => {
  const posts = POST_TYPES.flatMap((dir) => {
    const path = join(root, 'posts', dir)
    if (!existsSync(path)) return []
    return readdirSync(path)
      .filter((file) => file.endsWith('.md'))
      .map((file) => {
        // glob loader と同じパーサー（YAML のタイムスタンプを Date にする）で読む
        const { frontmatter, content } = parseFrontmatter(
          readFileSync(join(path, file), 'utf8'),
        )
        return {
          dir,
          file,
          frontmatter,
          body: content,
          result: postSchema.safeParse(frontmatter),
        }
      })
  })
  const terms = Object.fromEntries(
    TAXONOMIES.map((tax) => {
      const path = join(root, 'terms', `${tax}.json`)
      return [
        tax,
        existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : undefined,
      ]
    }),
  )
  return { posts, terms }
}

export const valid = (posts: ReturnType<typeof load>['posts']) =>
  posts.flatMap(({ result }) => (result.success ? [{ data: result.data }] : []))
