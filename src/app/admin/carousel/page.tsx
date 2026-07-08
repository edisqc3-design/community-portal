import { getAllCarouselSectionsAdmin, getAllBoardsAdmin } from '@/lib/admin-queries'
import CarouselAdminClient from './CarouselAdminClient'

export default async function AdminCarouselPage() {
  const [sections, boards] = await Promise.all([
    getAllCarouselSectionsAdmin(),
    getAllBoardsAdmin(),
  ])

  return <CarouselAdminClient initialSections={sections} boards={boards} />
}
