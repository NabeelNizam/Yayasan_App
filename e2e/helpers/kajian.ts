import { getPayload } from 'payload'
import config from '@payload-config'
import path from 'path'
import { RUN_TAG } from './db'

/**
 * The /kajian/[slug] page reads from the database, so a detail page is only
 * reachable once a published kajian exists. This seeds one of each type for
 * the run and removes them afterwards. A kitab must carry a PDF (the
 * collection's validateKajian hook enforces it), so a small fixture PDF is
 * uploaded and deleted with the rest.
 */

const FIXTURE_PDF = path.resolve(process.cwd(), 'e2e/fixtures/small.pdf')

export const KAJIAN_SLUGS = {
  video: `e2e-kajian-video-${RUN_TAG.toLowerCase()}`,
  artikel: `e2e-kajian-artikel-${RUN_TAG.toLowerCase()}`,
  kitab: `e2e-kajian-kitab-${RUN_TAG.toLowerCase()}`,
} as const

export async function seedKajian(): Promise<void> {
  const payload = await getPayload({ config })
  const common = { publishedAt: new Date().toISOString(), _status: 'published' as const }

  await payload.create({
    collection: 'kajian',
    data: {
      type: 'video',
      title: `Kajian Video ${RUN_TAG}`,
      slug: KAJIAN_SLUGS.video,
      youtubeId: 'dQw4w9WgXcQ',
      ...common,
    },
    overrideAccess: true,
  })

  await payload.create({
    collection: 'kajian',
    data: {
      type: 'artikel',
      title: `Kajian Artikel ${RUN_TAG}`,
      slug: KAJIAN_SLUGS.artikel,
      body: {
        root: {
          type: 'root',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: [
            {
              type: 'paragraph',
              format: '',
              indent: 0,
              version: 1,
              direction: 'ltr',
              children: [
                {
                  type: 'text',
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: `Isi artikel ${RUN_TAG}`,
                  version: 1,
                },
              ],
            },
          ],
        },
      },
      ...common,
    },
    overrideAccess: true,
  })

  const media = await payload.create({
    collection: 'media',
    data: { alt: `E2E kitab ${RUN_TAG}` },
    filePath: FIXTURE_PDF,
    overrideAccess: true,
  })

  await payload.create({
    collection: 'kajian',
    data: {
      type: 'kitab',
      title: `Kajian Kitab ${RUN_TAG}`,
      slug: KAJIAN_SLUGS.kitab,
      pdf: media.id,
      ...common,
    },
    overrideAccess: true,
  })
}

export async function deleteKajian(): Promise<void> {
  const payload = await getPayload({ config })

  const found = await payload.find({
    collection: 'kajian',
    where: { slug: { in: Object.values(KAJIAN_SLUGS) } },
    limit: 20,
    overrideAccess: true,
  })
  for (const doc of found.docs) {
    await payload.delete({ collection: 'kajian', id: doc.id, overrideAccess: true })
  }

  const media = await payload.find({
    collection: 'media',
    where: { alt: { like: `E2E kitab ${RUN_TAG}` } },
    limit: 20,
    overrideAccess: true,
  })
  for (const doc of media.docs) {
    await payload.delete({ collection: 'media', id: doc.id, overrideAccess: true })
  }
}

