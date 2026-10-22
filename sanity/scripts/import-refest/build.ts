import type {FestivalSeed, ImageSource, LinkSeed} from './types'

export interface ResolvedImage {
  assetId: string
  alt: string
}

export function imageKey(source: ImageSource): string {
  return 'filename' in source ? source.filename : source.assetId
}

export function collectImageSources(seed: FestivalSeed): ImageSource[] {
  const sources: ImageSource[] = [seed.heroImage]
  if (seed.logo) sources.push(seed.logo)
  for (const location of seed.locations ?? []) {
    for (const artwork of location.featuredArtworks ?? []) {
      sources.push(artwork.image)
    }
  }
  for (const video of seed.videos ?? []) {
    if (video.thumbnail) sources.push(video.thumbnail)
  }

  const unique = new Map<string, ImageSource>()
  for (const source of sources) unique.set(imageKey(source), source)
  return [...unique.values()]
}

function key(...parts: Array<string | number>): string {
  return parts.join('-').replace(/[^a-zA-Z0-9-]/g, '')
}

function toImage(source: ImageSource, images: Record<string, ResolvedImage>) {
  const resolved = images[imageKey(source)]
  if (!resolved) throw new Error(`Missing resolved image for ${imageKey(source)}`)
  return {
    _type: 'image',
    asset: {_type: 'reference', _ref: resolved.assetId},
    alt: resolved.alt || source.alt,
  }
}

function toLinks(links: LinkSeed[] | undefined, keyPrefix: string) {
  return (links ?? []).map((link, index) => ({
    _key: key(keyPrefix, 'link', index),
    label: link.label,
    ...(link.shortLabel ? {shortLabel: link.shortLabel} : {}),
    url: link.url,
  }))
}

export function paragraphsToBlocks(
  paragraphs: string[] | undefined,
  seed: FestivalSeed,
): unknown[] {
  if (!paragraphs || paragraphs.length === 0) return []
  return paragraphs.map((paragraph, index) => ({
    _key: key(seed.slug, 'about', index),
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [
      {
        _key: key(seed.slug, 'about', index, 'span'),
        _type: 'span',
        marks: [],
        text: paragraph,
      },
    ],
  }))
}

export function buildFestivalDocument(
  seed: FestivalSeed,
  images: Record<string, ResolvedImage>,
  programId: string,
) {
  if (!seed.title) throw new Error(`${seed.id}: missing title`)
  if (!seed.year) throw new Error(`${seed.id}: missing year`)
  if (!seed.slug) throw new Error(`${seed.id}: missing slug`)

  return {
    _id: seed.id,
    _type: 'festival',
    title: seed.title,
    year: seed.year,
    slug: {_type: 'slug', current: seed.slug},
    program: {_type: 'reference', _ref: programId},
    ...(seed.summary ? {summary: seed.summary} : {}),
    about: paragraphsToBlocks(seed.about, seed),
    heroImage: toImage(seed.heroImage, images),
    ...(seed.logo ? {logo: toImage(seed.logo, images)} : {}),
    ...(seed.locationSummary ? {locationSummary: seed.locationSummary} : {}),
    ...(seed.dateLines ? {dateLines: seed.dateLines} : {}),
    links: toLinks(seed.links, key(seed.slug, 'festival')),
    locations: (seed.locations ?? []).map((location, locationIndex) => {
      const locationKey = key(seed.slug, 'loc', locationIndex)
      const scheduleDays = (location.schedule?.days ?? []).map(
        (day, dayIndex) => {
          const dayKey = key(locationKey, 'day', dayIndex)
          return {
            _key: dayKey,
            dateLabel: day.dateLabel,
            items: day.items.map((item, itemIndex) => ({
              _key: key(dayKey, 'item', itemIndex),
              ...(item.time ? {time: item.time} : {}),
              ...(item.description ? {description: item.description} : {}),
              links: toLinks(item.links, key(dayKey, 'item', itemIndex)),
            })),
          }
        },
      )

      return {
        _key: locationKey,
        name: location.name,
        kind: location.kind,
        colorVariant: location.colorVariant,
        ...(location.dateLabel ? {dateLabel: location.dateLabel} : {}),
        ...(location.venueName ? {venueName: location.venueName} : {}),
        ...(location.address ? {address: location.address} : {}),
        ...(location.details ? {details: location.details} : {}),
        links: toLinks(location.links, locationKey),
        participatingArtists: location.participatingArtists ?? [],
        ...(scheduleDays.length > 0
          ? {schedule: {days: scheduleDays}}
          : {}),
        featuredArtworks: (location.featuredArtworks ?? []).map(
          (artwork, artworkIndex) => ({
            _key: key(locationKey, 'art', artworkIndex),
            title: artwork.title,
            artist: artwork.artist,
            ...(artwork.description
              ? {description: artwork.description}
              : {}),
            image: toImage(artwork.image, images),
            ...(artwork.link ? {link: artwork.link} : {}),
          }),
        ),
      }
    }),
    partnerGroups: (seed.partnerGroups ?? []).map((group, index) => ({
      _key: key(seed.slug, 'partner', index),
      title: group.title,
      names: group.names,
    })),
    videos: (seed.videos ?? []).map((video, index) => ({
      _key: key(seed.slug, 'video', index),
      title: video.title,
      ...(video.artist ? {artist: video.artist} : {}),
      ...(video.thumbnail
        ? {thumbnail: toImage(video.thumbnail, images)}
        : {}),
      ...(video.url ? {url: video.url} : {}),
    })),
  }
}

export function buildProgramPatch() {
  return {
    currentFestival: {_type: 'reference', _ref: 'festival-2026'},
    hasPage: true,
    pageDescription: [
      {
        _key: 'refest-page-description-0',
        _type: 'block',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _key: 'refest-page-description-0-span',
            _type: 'span',
            marks: [],
            text: 'Re–Fest is an annual festival of exhibitions, performances, and conversations. Presented in collaboration with organizations working in art, creative technology, science, and social justice. Re–Fest is presented in an interactive format where ideas can intersect to shape a more just future.',
          },
        ],
      },
    ],
  }
}
