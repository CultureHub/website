import type {FestivalSeed} from '../types'

function archiveFestival({
  year,
  title,
  locationSummary,
  figmaNode,
}: {
  year: number
  title: string
  locationSummary: string
  figmaNode: string
}): FestivalSeed {
  return {
    id: `festival-${year}`,
    title,
    year,
    slug: String(year),
    locationSummary,
    heroImage: {
      figmaNode,
      alt: `Re–Fest ${year} archive image`,
      filename: `refest-${year}-hero.png`,
    },
  }
}

export const archiveSeeds: FestivalSeed[] = [
  archiveFestival({
    year: 2024,
    title: 'Re–Source',
    locationSummary: 'Worldwide',
    figmaNode: '2214:7062',
  }),
  archiveFestival({
    year: 2022,
    title: 'Re–Unification',
    locationSummary: 'Online',
    figmaNode: '2231:7154',
  }),
  archiveFestival({
    year: 2021,
    title: 'Re–Circulation',
    locationSummary: 'Online',
    figmaNode: '2231:7162',
  }),
  archiveFestival({
    year: 2020,
    title: 'Re–Generation',
    locationSummary: 'New York & Los Angeles',
    figmaNode: '2231:7172',
  }),
  archiveFestival({
    year: 2019,
    title: 'Re–Fest',
    locationSummary: 'New York & Los Angeles',
    figmaNode: '2231:7180',
  }),
]
