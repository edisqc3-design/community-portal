import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase-server'
import { SITE_URL } from '@/lib/site-config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const [{ data: boards }, { data: posts }] = await Promise.all([
    supabase.from('boards').select('slug, name').eq('is_active', true),
    supabase
      .from('posts')
      .select('id, updated_at, board:boards(slug)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(1000),
  ])

  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'hourly', priority: 1 },
    { url: `${SITE_URL}/search`, changeFrequency: 'daily', priority: 0.5 },
  ]

  const boardEntries: MetadataRoute.Sitemap = (boards ?? []).map(b => ({
    url: `${SITE_URL}/board/${b.slug}`,
    changeFrequency: 'hourly',
    priority: 0.8,
  }))

  const postEntries: MetadataRoute.Sitemap = (posts ?? [])
    .map(p => {
      const board = (Array.isArray(p.board) ? p.board[0] : p.board) as { slug?: string } | null
      if (!board?.slug) return null
      return {
        url: `${SITE_URL}/board/${board.slug}/${p.id}`,
        lastModified: p.updated_at ?? undefined,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }
    })
    .filter((e): e is NonNullable<typeof e> => e !== null)

  return [...staticEntries, ...boardEntries, ...postEntries]
}
