import type { APIRoute } from 'astro'
import { sitemapEntries, sitemapXml } from '../lib/feeds'
import { getPosts } from '../lib/posts'
import { getAllTerms } from '../lib/terms'

export const GET: APIRoute = async ({ site }) =>
  new Response(
    sitemapXml(sitemapEntries(await getPosts(), getAllTerms()), site!),
    {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    },
  )
