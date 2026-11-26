// 件数で動きが変わる一覧は、決まった URL でなく、ビルドした一覧の JSON から条件に合うタームを選んで確かめる。
// 記事が増えて件数が変わるたびにテストを直さなくて済むようにする
import { readdirSync, readFileSync } from 'node:fs'

export type TermList = {
  path: string
  total: number
  last: number
  items: { path: string; clipUrl?: string }[]
}

const TAXONOMIES = ['tips', 'clips', 'labs']

const lists: TermList[] = TAXONOMIES.flatMap((tax) =>
  readdirSync(`dist/data/${tax}`).map((id) => {
    const { total, last, items } = JSON.parse(
      readFileSync(`dist/data/${tax}/${id}/1.json`, 'utf8'),
    ) as Omit<TermList, 'path'>
    return { path: `/${tax}/${id}/`, total, last, items }
  }),
)

/** 条件に合うタームのうち、件数のいちばん少ないもの（スクロールの回数を少なくする） */
export const termWhere = (match: (list: TermList) => boolean) =>
  lists.filter(match).sort((a, b) => a.total - b.total)[0]
