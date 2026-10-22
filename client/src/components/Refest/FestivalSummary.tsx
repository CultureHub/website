import DetailSummary from "@/components/shared/DetailSummary";
import {
  FestivalActions,
  FestivalDateLines,
  FestivalYearTitle,
} from "@/components/Festival/FestivalMeta";
import type { FestivalArchiveItem } from "@/sanity/queries";

export default function FestivalSummary({
  festival,
}: {
  festival: FestivalArchiveItem;
}) {
  return (
    <DetailSummary
      image={festival.heroImage}
      imageClassName="w-full h-[374px] object-cover border border-ch-midnite"
      contentClassName="gap-7"
      title={<FestivalYearTitle festival={festival} />}
      meta={<FestivalDateLines festival={festival} />}
      description={
        festival.summary ? (
          <p className="font-brook text-2xl leading-[1.2] text-ch-midnite">
            {festival.summary}
          </p>
        ) : null
      }
      actions={<FestivalActions festival={festival} />}
    />
  );
}
