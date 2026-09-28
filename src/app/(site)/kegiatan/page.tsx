import KegiatanTabs from './components/KegiatanTabs'
import { getLembaga } from '@/features/lembaga/getList'
import { getPhbiRecapDefault } from '@/features/recap/getList'
import { getKajianList } from '@/features/kajian/getList'

export const revalidate = 300

export default async function KegiatanPage() {
  const [lembaga, recap, kajian] = await Promise.all([
    getLembaga(),
    getPhbiRecapDefault(),
    getKajianList(),
  ])
  return <KegiatanTabs lembaga={lembaga} recap={recap} kajian={kajian} />
}