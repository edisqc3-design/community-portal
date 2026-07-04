import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import TopBar from '@/components/layout/TopBar'
import ShortcutRow from '@/components/layout/ShortcutRow'
import BoardNavTabs from '@/components/layout/BoardNavTabs'
import MobileTabBar from '@/components/layout/MobileTabBar'
import Footer from '@/components/layout/Footer'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/site-config'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ['커뮤니티', '게시판', '포털', '자유게시판', '질문답변', '정보공유'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        {ADSENSE_CLIENT && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <TopBar />
        <BoardNavTabs />
        <ShortcutRow />
        <main style={{ minHeight: '70vh' }}>{children}</main>
        <Footer />
        <MobileTabBar />
      </body>
    </html>
  )
}
