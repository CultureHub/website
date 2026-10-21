export type ImageSource =
  | {figmaNode: string; alt: string; filename: string}
  | {url: string; alt: string; filename: string}
  | {assetId: string; alt: string}

export interface LinkSeed {
  label: string
  shortLabel?: string
  url: string
}

export interface ScheduleItemSeed {
  time?: string
  description?: string
  links?: LinkSeed[]
}

export interface ScheduleDaySeed {
  dateLabel: string
  items: ScheduleItemSeed[]
}

export interface ArtworkSeed {
  title: string
  artist: string
  description?: string
  image: ImageSource
  link?: string
}

export interface LocationSeed {
  name: string
  kind: 'in-person' | 'virtual'
  colorVariant: 'highlighter' | 'pool' | 'midnight' | 'ocher' | 'cream' | 'metal'
  dateLabel?: string
  venueName?: string
  address?: string
  details?: string
  links?: LinkSeed[]
  participatingArtists?: string[]
  schedule?: {
    days: ScheduleDaySeed[]
  }
  featuredArtworks?: ArtworkSeed[]
}

export interface VideoSeed {
  title: string
  artist?: string
  thumbnail?: ImageSource
  url?: string
}

export interface FestivalSeed {
  id: string
  title: string
  year: number
  slug: string
  summary?: string
  about?: string[]
  heroImage: ImageSource
  logo?: ImageSource
  locationSummary?: string
  links?: LinkSeed[]
  locations?: LocationSeed[]
  partnerGroups?: Array<{title: string; names: string[]}>
  videos?: VideoSeed[]
}
