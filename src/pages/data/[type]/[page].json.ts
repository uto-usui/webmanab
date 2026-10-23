import type { APIRoute } from 'astro'
import { typeDataStaticPaths, type ListPage } from '../../../lib/list-json'
import { getPosts } from '../../../lib/posts'

export const getStaticPaths = async () => typeDataStaticPaths(await getPosts())

export const GET: APIRoute<{ body: ListPage }> = ({ props }) =>
  Response.json(props.body)
