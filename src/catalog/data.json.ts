// ArticleList の story が読む無限スクロールの JSON。本番の /data/ と同じ listPages() で fixtures から作る
import type { APIRoute, GetStaticPaths } from 'astro'
import { listPages, type ListPage } from '../lib/list-json'
import { lists } from './fixtures/list'

export const getStaticPaths = (() =>
  (['sixteen', 'twelve'] as const).flatMap((list) =>
    listPages(lists[list]).map((body) => ({
      params: { list, page: String(body.page) },
      props: { body },
    })),
  )) satisfies GetStaticPaths

export const GET: APIRoute<{ body: ListPage }> = ({ props }) =>
  Response.json(props.body)
