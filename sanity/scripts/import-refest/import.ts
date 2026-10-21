import {
  buildFestivalDocument,
  buildProgramPatch,
  collectImageSources,
} from './build'
import {client} from './client'
import {resolveImages} from './images'
import {archiveSeeds} from './manifests/archive'
import {refest2026} from './manifests/2026'
import type {FestivalSeed} from './types'

async function main() {
  const isWrite = process.argv.includes('--write')
  const dryRun = !isWrite

  const program = await client.fetch<{_id: string} | null>(
    `*[_type == "program" && slug.current == "re-fest"][0]{_id}`,
  )
  if (!program?._id) throw new Error('Re-Fest program document not found')

  const seeds: FestivalSeed[] = [refest2026, ...archiveSeeds]
  const imageSources = seeds.flatMap(collectImageSources)
  const images = await resolveImages(imageSources, {dryRun})
  const docs = seeds.map((seed) =>
    buildFestivalDocument(seed, images, program._id),
  )
  const programPatch = buildProgramPatch()

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          mode: 'dry-run',
          programId: program._id,
          imageSources: imageSources.map((source) => ({
            key: 'filename' in source ? source.filename : source.assetId,
            alt: source.alt,
            source:
              'figmaNode' in source
                ? `figma:${source.figmaNode}`
                : 'url' in source
                  ? source.url
                  : 'existing',
          })),
          documents: docs,
          programPatch,
        },
        null,
        2,
      ),
    )
    return
  }

  for (const doc of docs) {
    await client.createOrReplace(doc)
    console.log(`Wrote ${doc._id} (${doc.title}, ${doc.year})`)
  }

  await client.patch(program._id).set(programPatch).commit()
  console.log(`Patched program ${program._id}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
