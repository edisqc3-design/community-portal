import TopBar from '@/components/layout/TopBar'
import ShortcutRow from '@/components/layout/ShortcutRow'
import BoardNavTabs from '@/components/layout/BoardNavTabs'
import MobileTabBar from '@/components/layout/MobileTabBar'
import Footer from '@/components/layout/Footer'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <BoardNavTabs />
      <ShortcutRow />
      <main style={{ minHeight: '70vh' }}>{children}</main>
      <Footer />
      <MobileTabBar />
    </>
  )
}
