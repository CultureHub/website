/** Content-only helpers shared by Studio validation and server rendering. */
export type PreviewText = {
  _type?: string
  children?: ReadonlyArray<{_type?: string; text?: string}>
  question?: string
  answer?: readonly PreviewText[]
}

export type PreviewBlock = {
  _type?: string
  text?: string | readonly PreviewText[]
}

export type PreviewSource = {
  heroImage?: {asset?: {_ref?: string} | null} | null
  content?: readonly PreviewBlock[] | null
}

export type FeatureReference = {article?: {_ref?: string} | null}

export function canonicalId(id: string): string {
  return id.replace(/^drafts\./, '')
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function portableText(nodes: readonly PreviewText[]): string {
  return nodes
    .map((node) => {
      if (node._type === 'qa') {
        return [node.question ?? '', portableText(node.answer ?? [])].join(' ')
      }
      if (node._type !== 'block') return ''
      return (node.children ?? []).map((span) => span.text ?? '').join('')
    })
    .join(' ')
}

export function openingText(
  blocks: readonly PreviewBlock[] | null | undefined,
): string {
  return normalizeWhitespace(
    (blocks ?? [])
      .map((block) => {
        if (block._type !== 'articleText' && block._type !== 'imageText')
          return ''
        return Array.isArray(block.text) ? portableText(block.text) : ''
      })
      .join(' '),
  )
}

export function truncateWords(text: string, limit: number): string {
  if (!Number.isInteger(limit) || limit <= 0) return ''
  const normalized = normalizeWhitespace(text)
  if (!normalized) return ''
  const words = normalized.split(' ')
  return words.length > limit
    ? `${words.slice(0, limit).join(' ')}…`
    : normalized
}

export function validateFeaturedSelection(
  entries: readonly FeatureReference[] | undefined,
): true | string {
  if (!entries || entries.length !== 3)
    return 'Select exactly three featured articles.'
  const ids = entries.map((entry) =>
    canonicalId(entry.article?._ref?.trim() ?? ''),
  )
  if (ids.some((id) => !id))
    return 'Select an article for every featured entry.'
  return new Set(ids).size === 3
    ? true
    : 'Each featured article must be different.'
}

export function validatePreviewSource(
  mode: 'image' | 'text',
  source: PreviewSource | null,
): true | string {
  if (!source) return 'Select an article that exists.'
  if (mode === 'image') {
    return source.heroImage?.asset?._ref?.trim()
      ? true
      : 'This article needs a hero image for an image preview.'
  }
  if (mode === 'text') {
    return openingText(source.content)
      ? true
      : 'This article needs opening text for a text preview.'
  }
  return 'Choose an image or text preview.'
}

export function isYoutubeId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{11}$/.test(value)
}
