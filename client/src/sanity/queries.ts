import { client } from "@/sanity/client";
import { defineQuery } from 'next-sanity'

const options = { next: { revalidate: 30 } };

export function getArtistsBySlug(slug: string) {
  const getArtistsBySlugQuery = defineQuery(`*[_type == "artist" && slug.current == $slug]{
    ...,
    projects[]->{
      ...
    }
  }[0]`);

  return client.fetch(getArtistsBySlugQuery, { slug }, options);
}

export function getProjectBySlug(slug: string) {
  const getProjectBySlugQuery = defineQuery(`*[_type == "project" && slug.current == $slug][0]`);

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

export function getArtistMediumOptions() {
  const getArtistMediumOptionsQuery = defineQuery(`array::unique(*[_type == "artist"].medium[])`);

  return client.fetch(getArtistMediumOptionsQuery, {}, options);
}

export function getArtists() {
  const getArtistsQuery = defineQuery(`*[
    _type == "artist"
    && defined(slug.current)
  ][0...12]`);

  return client.fetch(getArtistsQuery, {}, options);
}

export function getArtistsByMediums(mediums: string[]) {
  const getArtistsByMediumsQuery = defineQuery(`*[
    _type == "artist"
    && count(medium[@ in $mediums]) > 0
    && defined(slug.current)
  ][0...12]`);

  return client.fetch(getArtistsByMediumsQuery, {mediums}, options);
}
