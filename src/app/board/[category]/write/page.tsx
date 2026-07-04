import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getBoardBySlug } from '@/lib/queries'
import WriteClient from './WriteClient'

export const metadata: Metadata = {
  title: '글쓰기',
  robots: { index: false, follow: false },
}

export default async function WritePage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const board = await getBoardBySlug(category)
  if (!board) notFound()

  return <WriteClient boardId={board.id} boardName={board.name} boardSlug={board.slug} />
}
