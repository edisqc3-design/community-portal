import type { Metadata } from 'next'
import LoginClient from './LoginClient'

export const metadata: Metadata = {
  title: '로그인',
  robots: { index: false, follow: false },
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; registered?: string }>
}) {
  return <LoginClient searchParams={searchParams} />
}
