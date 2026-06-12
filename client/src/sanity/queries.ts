import { client } from "@/sanity/client";
import { defineQuery } from "next-sanity";

const options = { next: { revalidate: 30 } };

export function getArtistsBySlug(slug: string) {
  const getArtistsBySlugQuery =
    defineQuery(`*[_type == "artist" && slug.current == $slug]{
    ...,
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
      related[]->{
        _id,
        _type,
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

export function getProjects() {
  const getProjectsQuery = defineQuery(`*[
    _type == "project" &&
    defined(slug.current)
  ][0...12]{
    _id,
    title,
    slug
  }`);

  return client.fetch(getProjectsQuery, {}, options);
}

export function getPrograms() {
  const getProgramsQuery = defineQuery(`*[_type == "program"]{
    ...
  }`);

  return client.fetch(getProgramsQuery, {}, options);
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
