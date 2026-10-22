import SanityImage from "@/components/SanityImage";
import {
  FestivalActions,
  FestivalDateLines,
  FestivalYearTitle,
} from "@/components/Festival/FestivalMeta";
import type { FestivalArchiveItem } from "@/sanity/queries";

export default function FestivalFeature({
  festival,
}: {
  festival: FestivalArchiveItem;
}) {
  return (
    <div className="flex flex-col xl:flex-row xl:justify-center xl:items-center gap-9 xl:gap-[55px]">
      {festival.heroImage && (
        <SanityImage
          image={festival.heroImage}
          className="w-full xl:w-[637px] h-[576px] xl:h-[606px] object-cover border border-ch-midnite"
        />
      )}
      <div className="flex flex-col justify-center gap-7 xl:w-[604px]">
        <FestivalYearTitle festival={festival} />
        <FestivalDateLines festival={festival} />
        {festival.summary && (
          <p className="font-brook text-2xl leading-[1.2] text-ch-midnite">
            {festival.summary}
          </p>
        )}
        <FestivalActions festival={festival} />
      </div>
    </div>
  );
}
