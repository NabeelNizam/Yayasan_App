import KegiatanTabs from './components/KegiatanTabs'
import { getLembaga } from '@/features/lembaga/getList'

export const revalidate = 300

export default async function KegiatanPage() {
  const lembaga = await getLembaga()
  return <KegiatanTabs lembaga={lembaga} />
}
