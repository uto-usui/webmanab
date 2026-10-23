import type { APIRoute } from 'astro'
import { eyecatchStaticPaths } from '../../../lib/eyecatch-routes'
import { renderEyecatch } from '../../../lib/eyecatch/index.ts'
import { getPosts } from '../../../lib/posts'

type Props = ReturnType<typeof eyecatchStaticPaths>[number]['props']

export const getStaticPaths = async () => eyecatchStaticPaths(await getPosts())

export const GET: APIRoute<Props> = ({ props }) =>
  new Response(renderEyecatch(props.data, { variant: props.variant }), {
    headers: { 'Content-Type': 'image/svg+xml' },
  })
