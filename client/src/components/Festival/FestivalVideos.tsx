// TODO(videos-ticket): replace these cards with the shared video player/card
// once the videos ticket lands. Do not add playback behavior here.
import SanityImage from "@/components/SanityImage";
import type { FestivalVideo } from "@/sanity/queries";

export function FestivalVideos({
  videos,
}: {
  videos: FestivalVideo[] | null | undefined;
}) {
  if (!videos || videos.length === 0) return null;

  return (
    <section className="bg-rf-metal px-6 py-6 md:px-0">
      <div className="px-6 md:px-16">
        <h2 className="font-brook italic text-[40px] text-rf-ocher">Videos</h2>
      </div>
      <div className="mt-6 flex justify-center gap-9 overflow-x-auto scrollbar-none">
        {videos.map((video) => (
          <article
            key={video._key}
            className="flex w-[635px] shrink-0 flex-col gap-6 border border-rf-ocher/40 p-6"
          >
            {video.thumbnail && (
              <SanityImage
                image={video.thumbnail}
                className="w-full h-[423px] object-cover"
              />
            )}
            <h3 className="font-milling font-semibold text-[32px] leading-tight text-rf-ocher">
              {video.title}
            </h3>
            {video.artist && (
              <p className="font-brook italic text-2xl text-rf-ocher">
                {video.artist}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
