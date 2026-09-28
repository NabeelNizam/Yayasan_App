import Hero from "./sections/Hero"
import Detail from "./sections/Detail"
import Quotes from "./sections/Quotes"
import Visi from "./sections/Visi"
import Misi from "./sections/Misi"
import Program from "./sections/Program"
import Organisasi from "./sections/Organisasi"
import { getTentangKami } from "@/features/tentang-kami/getContent"

export const revalidate = 300

export default async function TentangKami() {
  const { visi, misi, detail } = await getTentangKami()

  return (
    <section>
      <Hero />
      <Detail detail={detail} />
      <Quotes />
      <Visi visi={visi} />
      <Misi misi={misi} />
      <Program />
      <Organisasi />
    </section>
  )
}
