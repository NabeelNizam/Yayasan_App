import KegiatanTabs from './components/KegiatanTabs'
import { getLembaga } from '@/features/lembaga/getList'
import { getPhbiRecapDefault } from '@/features/recap/getList'

export const revalidate = 300

export default async function KegiatanPage() {
  const [lembaga, recap] = await Promise.all([getLembaga(), getPhbiRecapDefault()])
  return <KegiatanTabs lembaga={lembaga} recap={recap} />
}