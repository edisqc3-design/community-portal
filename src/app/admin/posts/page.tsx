import { getAllPostsAdmin } from '@/lib/admin-queries'
import PostsAdminClient from './PostsAdminClient'

export default async function AdminPostsPage() {
  const posts = await getAllPostsAdmin(50)
  return <PostsAdminClient initialPosts={posts} />
}
