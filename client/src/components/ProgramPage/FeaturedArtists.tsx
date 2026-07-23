import Link from "next/link";
import SanityImage from "@/components/SanityImage";

interface FeaturedArtist {
  _id: string;
  name: string | null;
  slug: { current: string };
  image: {
    asset?: { _id: string; url: string } | null;
    alt?: string | null;
  } | null;
}

interface FeaturedArtistsProps {
  title: string;
  artists: FeaturedArtist[];
  columns?: number;
}

export default function FeaturedArtists({
  title,
  artists,
  columns = 3,
}: FeaturedArtistsProps) {
  return (
    <section className="px-6 md:px-16 py-9">
      <div className="border-t border-b border-ch-midnite py-6 mb-9">
        <h2 className="font-milling font-bold text-[28px]">{title}</h2>
      </div>

      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {artists.map((artist) => (
          <Link
            key={artist._id}
            href={`/artists/${artist.slug.current}`}
            className="flex flex-col p-5 gap-3 border border-ch-midnite rounded-[10px] bg-[#B5FD8B]"
          >
            <SanityImage
              image={artist.image}
              className="w-full aspect-[3/2] object-cover rounded-[10px] border border-ch-midnite"
            />
            <div className="flex flex-row justify-between">
              <span className="font-brook italic text-base">
                Experiments in Digital Storytelling
              </span>
            </div>
            <span className="font-milling text-xl">{artist.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
