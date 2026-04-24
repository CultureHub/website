import ArtistsList from "@/components/ArtistsList";
import * as Queries from "@/sanity/queries";

export default async function ArtistsIndexPage() {
  const locationOptions = await Queries.getArtistLocationOptions();
  const initialArtists = await Queries.getArtists();

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8">
      <h1 className="text-4xl font-bold mb-8">Artists</h1>
      <ArtistsList
        initialArtists={initialArtists}
        locationOptions={locationOptions}
      />
    </main>
  );
}
