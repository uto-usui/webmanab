import rss from '@astrojs/rss'
import type { APIRoute } from 'astro'
import { feedItems } from '../lib/feeds'
import { getPosts } from '../lib/posts'
import { SITE_DESCRIPTION, SITE_NAME } from '../lib/site'

// 旧サイトと同じく tip の新しい 50 件
export const GET: APIRoute = async ({ site }) =>
  rss({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    site: site!,
    items: feedItems(await getPosts('tip'), site!),
    customData: '<language>ja</language><category>frontend</category>',
    trailingSlash: true,
  })
