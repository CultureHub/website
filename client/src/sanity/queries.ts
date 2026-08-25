import { client } from "@/sanity/client";
import { defineQuery } from "next-sanity";

const options = { next: { revalidate: 30 } };

export function getArtistsBySlug(slug: string) {
  const getArtistsBySlugQuery =
    defineQuery(`*[_type == "artist" && slug.current == $slug]{
    ...,
    "program": program->{ _id, title, slug, shortLabel },
    projects[]->{
      ...
    }
  }[0]`);

  return client.fetch(getArtistsBySlugQuery, { slug }, options);
}

export function getProjectBySlug(slug: string) {
  const getProjectBySlugQuery = defineQuery(
    `*[_type == "project" && slug.current == $slug][0]{
      ...,
      "program": program->{ _id, title, slug, shortLabel, displayTitle },
      related[]->{
        _id,
        _type,
        "slug": slug.current,
        "image": select(
          _type == "project" => heroImage,
          _type == "artist" => image,
        ),
        "title": select(
          _type == "project" => title,
          _type == "artist" => name,
        ),
      },
    }`,
  );

  return client.fetch(getProjectBySlugQuery, { slug }, options);
}

export function getArtAndTechnologyPage() {
  const getArtAndTechnologyPageQuery = defineQuery(
    `*[_type == "artAndTechnologyPage"][0]{
      heading,
      introText,
      featuredPrograms[]->{
        ...
      }
    }`,
  );

  return client.fetch(getArtAndTechnologyPageQuery, {}, options);
}

export function getPrograms() {
  const getProgramsQuery = defineQuery(`*[_type == "program"]{
    ...
  }`);

  return client.fetch(getProgramsQuery, {}, options);
}

export async function getProgramBySlug(slug: string) {
  const getProgramBySlugQuery = defineQuery(
    `*[_type == "program" && slug.current == $slug][0]{
        _id, title, displayTitle, slug, shortLabel, accentColor, hasPage,
        heroImage {
          asset->{_id, url},
          alt, credits
        },
        pageDescription,
        "openCall": openCall->{
          title, slug,
          heroImage {
            asset->{_id, url},
            alt, credits
          },
          locationShort,
          timeline,
          where,
          benefits,
          description
        },
        locationContent[]{
          _key,
          location, displayTitle, description,
          accentColor
        },
        featuredArtists[]->{
          _id, name, slug, locations,
          image {
            asset->{_id, url},
            alt
          }
        },
        featuredProjects[]->{
          _id, title, slug,
          heroImage {
            asset,
            alt
          },
          people,
          "artists": *[_type == "artist" && references(^._id)]{ _id, name }
        }
      }`,
  );
  return client.fetch(getProgramBySlugQuery, { slug }, options);
}

export async function getResidentArtists(programId: string) {
  const getResidentArtistsQuery = defineQuery(
    `*[_type == "artist" && $programId in programs[].program._ref]{
      _id, name, slug,
      image {
        asset->{_id, url},
        alt
      },
      locations,
      "membership": programs[program._ref == $programId][0]{
        yearStart, yearEnd, location
      }
    } | order(membership.yearStart desc)`,
  );
  return client.fetch(getResidentArtistsQuery, { programId }, options);
}

const UPCOMING_EVENTS_FRAGMENT = `{
  _id,
  title,
  "slug": slug.current,
  dateTimes,
  location,
  locationShort,
  timezoneLabel,
  "program": program->{
    _id, title, slug, shortLabel, displayTitle
  },
  heroImage {
    asset,
    hotspot,
    crop,
    alt
  }
}`;

export async function getUpcomingEventsByProgram(
  programSlug: string,
  limit: number = 5,
) {
  const getUpcomingEventsByProgramQuery = defineQuery(
    `*[_type == "event" && program->slug.current == $programSlug && dateTimes[0].start > now()] | order(dateTimes[0].start asc) [0...$limit]
      ${UPCOMING_EVENTS_FRAGMENT}`,
  );
  return client.fetch(
    getUpcomingEventsByProgramQuery,
    { programSlug, limit },
    options,
  );
}

export function getArtistLocationOptions() {
  const getArtistLocationOptionsQuery = defineQuery(
    `array::unique(*[_type == "artist"].locations[])`,
  );

  return client.fetch(getArtistLocationOptionsQuery, {}, options);
}

export function getArtists() {
  const getArtistsQuery = defineQuery(`*[
    _type == "artist"
    && defined(slug.current)
  ][0...12]`);

  return client.fetch(getArtistsQuery, {}, options);
}

export function getArtistsByLocations(locations: string[]) {
  const getArtistsByLocationsQuery = defineQuery(`*[
    _type == "artist"
    && count(locations[@ in $locations]) > 0
    && defined(slug.current)
  ][0...12]`);

  return client.fetch(getArtistsByLocationsQuery, { locations }, options);
}

export type ProjectFilters = {
  program?: string;
  place?: string;
  year?: string;
};

const YEAR_OVERLAP_CONDITION = `(
  (defined(endDate) && endDate >= $yearStart && date < $yearEnd)
  || (!defined(endDate) && date >= $yearStart && date < $yearEnd)
)`;

const PROJECT_LIST_FRAGMENT = `{
  _id,
  title,
  slug,
  date,
  endDate,
  locations,
  people,
  "program": program->{ _id, title, slug, shortLabel, accentColor, displayTitle },
  heroImage {
    asset,
    hotspot,
    crop,
    alt
  },
  "artists": *[_type == "artist" && references(^._id)]{ _id, name }
}`;

export function getProjectFilterOptions() {
  const getProjectFilterOptionsQuery = defineQuery(`{
    "programs": *[_type == "program"]{ _id, title, slug, shortLabel, accentColor, displayTitle },
    "places": array::unique(*[_type == "project" && defined(slug.current)].locations[]) | order(@ asc),
    "dates": array::unique(*[_type == "project" && defined(slug.current)].date) | order(@ desc)
  }`);

  return client.fetch(getProjectFilterOptionsQuery, {}, options);
}

export function getProjects(
  filters: ProjectFilters = {},
  limit: number = 20,
  offset: number = 0,
) {
  const getProjectsQuery = defineQuery(`{
    "projects": *[_type == "project" && defined(slug.current)
      && ($program == "" || program->slug.current == $program)
      && ($place == "" || $place in locations)
      && ($year == "" || ${YEAR_OVERLAP_CONDITION})
    ] | order(date desc) [$offset...$end]
    ${PROJECT_LIST_FRAGMENT},
    "total": count(*[_type == "project" && defined(slug.current)
      && ($program == "" || program->slug.current == $program)
      && ($place == "" || $place in locations)
      && ($year == "" || ${YEAR_OVERLAP_CONDITION})
    ])
  }`);

  const params = buildProjectQueryParams(filters, limit, offset);
  return client.fetch(getProjectsQuery, params, options);
}

export function getProjectFacets(filters: ProjectFilters = {}) {
  const getProjectFacetsQuery = defineQuery(`{
    "programSlugs": array::unique(*[_type == "project" && defined(slug.current)
      && ($place == "" || $place in locations)
      && ($year == "" || ${YEAR_OVERLAP_CONDITION})
    ].program->slug.current)[@ != null],
    "places": array::unique(*[_type == "project" && defined(slug.current)
      && ($program == "" || program->slug.current == $program)
      && ($year == "" || ${YEAR_OVERLAP_CONDITION})
    ].locations[]) | order(@ asc),
    "dates": array::unique(*[_type == "project" && defined(slug.current)
      && ($program == "" || program->slug.current == $program)
      && ($place == "" || $place in locations)
    ].date) | order(@ desc)
  }`);

  const params = buildProjectQueryParams(filters);
  return client.fetch(getProjectFacetsQuery, params, options);
}

export function extractYears(dates: string[]): string[] {
  return Array.from(new Set(dates.map((d) => d.slice(0, 4)))).sort((a, b) =>
    b.localeCompare(a),
  );
}

function buildProjectQueryParams(
  filters: ProjectFilters,
  limit?: number,
  offset?: number,
) {
  const program = filters.program ?? "";
  const place = filters.place ?? "";
  const year = filters.year ?? "";
  const yearStart = year ? `${year}-01-01` : "";
  const yearEnd = year ? `${Number(year) + 1}-01-01` : "";
  const params: Record<string, unknown> = {
    program,
    place,
    year,
    yearStart,
    yearEnd,
  };
  if (limit !== undefined && offset !== undefined) {
    params.offset = offset;
    params.end = offset + limit;
  }
  return params;
}

export function getEventBySlug(slug: string) {
  const getEventBySlugQuery = defineQuery(
    `*[_type == "event" && slug.current == $slug][0]{
      ...,
      "program": program->{
        _id, title, slug, shortLabel, displayTitle, accentColor
      },
      featuredArtists[]{
        _key,
        artist->{ _id, name, slug },
        "image": coalesce(image, artist->image),
        "name": coalesce(name, artist->name),
        "bio": coalesce(bio, artist->bio)
      }
    }`,
  );

  return client.fetch(getEventBySlugQuery, { slug }, options);
}

export function getUpcomingEvents(limit: number = 10) {
  const now = new Date().toISOString();

  const getUpcomingEventsQuery = defineQuery(
    `*[
      _type == "event"
      && defined(slug.current)
      && count(dateTimes) > 0
      && dateTimes[-1].end >= $now
    ] | order(dateTimes[0].start asc) [0...$limit] {
      _id,
      title,
      "slug": slug.current,
      dateTimes,
      location,
      locationShort,
      timezoneLabel,
      "program": program->{
        _id, title, slug, shortLabel, displayTitle
      },
      heroImage {
        asset,
        hotspot,
        crop,
        alt
      }
    }`,
  );

  return client.fetch(getUpcomingEventsQuery, { now, limit }, options);
}
