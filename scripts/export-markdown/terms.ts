// ターム一覧 JSON
import { TAXONOMY, type Frontmatter, type Term } from './frontmatter.ts'

export type Taxonomy = (typeof TAXONOMY)[keyof typeof TAXONOMY]
export interface TermEntry extends Term {
  count: number
}

// 記事が 0 件で、記事の terms からは名前が取れないターム。
// Wayback Machine にある wp-json/wp/v2/labs（2025-01-25 取得）から補った
export const EXTRA_TERMS: Partial<Record<Taxonomy, Term[]>> = {
  labs: [
    { id: 332, name: 'interaction', slug: 'interaction' },
    { id: 333, name: 'svg', slug: 'svg' },
  ],
}

// count は書き出した記事から数え直す（WP の count と 287 タームすべてで一致した）
export function buildTerms(
  posts: Frontmatter[],
): Record<Taxonomy, TermEntry[]> {
  const maps: Record<Taxonomy, Map<number, TermEntry>> = {
    tips: new Map(),
    clips: new Map(),
    labs: new Map(),
  }
  for (const p of posts) {
    const m = maps[TAXONOMY[p.type]]
    for (const t of p.terms) {
      const cur = m.get(t.id) ?? { ...t, count: 0 }
      cur.count++
      m.set(t.id, cur)
    }
  }
  for (const [tax, list] of Object.entries(EXTRA_TERMS) as [
    Taxonomy,
    Term[],
  ][]) {
    for (const t of list)
      if (!maps[tax].has(t.id)) maps[tax].set(t.id, { ...t, count: 0 })
  }
  // WP API の既定の並び（name の昇順、大文字・小文字を区別しない）
  const sorted = (m: Map<number, TermEntry>) =>
    [...m.values()].sort(
      (a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'en') ||
        a.id - b.id,
    )
  return {
    tips: sorted(maps.tips),
    clips: sorted(maps.clips),
    labs: sorted(maps.labs),
  }
}
