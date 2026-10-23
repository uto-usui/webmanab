import type { APIRoute } from 'astro'
import { stories } from './stories'

export const GET: APIRoute = () =>
  Response.json({ stories: stories.map((s) => s.entry) })
