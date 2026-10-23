import type { APIRoute } from 'astro'
import { termDataStaticPaths, type ListPage } from '../../../../lib/list-json'
import { getPosts } from '../../../../lib/posts'
import { getAllTerms } from '../../../../lib/terms'

export const getStaticPaths = async () =>
  termDataStaticPaths(await getPosts(), getAllTerms())

export const GET: APIRoute<{ body: ListPage }> = ({ props }) =>
  Response.json(props.body)
