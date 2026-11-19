import type {ImageSource} from './types'
import {imageKey, type ResolvedImage} from './build'
import {client} from './client'

const FIGMA_FILE_KEY = 'erOB5ZYdcXZ27cukPYrfZr'

async function uploadBuffer(buffer: Buffer, filename: string) {
  const existing = await client.fetch<{_id: string} | null>(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}`,
    {filename},
  )
  if (existing?._id) return existing._id

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const asset = await client.assets.upload('image', buffer, {filename})
      return asset._id
    } catch (error) {
      const status = (error as {statusCode?: number}).statusCode
      if (status !== 429 || attempt === 4) throw error
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }

  throw new Error(`Failed to upload ${filename}`)
}

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++
      results[index] = await fn(items[index])
    }
  }

  await Promise.all(Array.from({length: Math.min(limit, items.length)}, worker))
  return results
}

async function download(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`)
  }
  return Buffer.from(await response.arrayBuffer())
}

async function resolveFigmaNode(figmaNode: string) {
  const apiKey = process.env.CAM_FIGMA_API_KEY
  if (!apiKey) {
    throw new Error('CAM_FIGMA_API_KEY is required to export Figma images')
  }

  const response = await fetch(
    `https://api.figma.com/v1/images/${FIGMA_FILE_KEY}?ids=${encodeURIComponent(
      figmaNode,
    )}&format=png&scale=2`,
    {headers: {'X-Figma-Token': apiKey}},
  )
  if (!response.ok) {
    throw new Error(`Figma image export failed: ${response.status}`)
  }

  const payload = (await response.json()) as {
    images?: Record<string, string | null>
  }
  const url = payload.images?.[figmaNode]
  if (!url) throw new Error(`No Figma image URL for node ${figmaNode}`)
  return download(url)
}

export async function resolveImage(
  source: ImageSource,
  options: {dryRun: boolean},
): Promise<ResolvedImage> {
  if ('assetId' in source) {
    return {assetId: source.assetId, alt: source.alt}
  }

  if (options.dryRun) {
    return {assetId: `dry-run-${imageKey(source)}`, alt: source.alt}
  }

  const buffer =
    'figmaNode' in source
      ? await resolveFigmaNode(source.figmaNode)
      : await download(source.url)

  const assetId = await uploadBuffer(buffer, source.filename)
  return {assetId, alt: source.alt}
}

export async function resolveImages(
  sources: ImageSource[],
  options: {dryRun: boolean},
) {
  const entries = await mapLimit(sources, 4, async (source) => {
    const resolved = await resolveImage(source, options)
    return [imageKey(source), resolved] as const
  })
  return Object.fromEntries(entries)
}
