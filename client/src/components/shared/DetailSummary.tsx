import type { ReactNode } from "react";
import SanityImage from "@/components/SanityImage";
import type { SanityImageSource } from "@sanity/image-url";

interface DetailSummaryProps {
  image?: SanityImageSource | null;
  imageClassName?: string;
  title: ReactNode;
  meta?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  contentClassName?: string;
}

export default function DetailSummary({
  image,
  imageClassName = "w-full h-[381px] object-cover",
  title,
  meta,
  description,
  actions,
  contentClassName = "gap-8",
}: DetailSummaryProps) {
  return (
    <div className="flex flex-col items-center gap-[18px]">
      {image && <SanityImage image={image} className={imageClassName} />}
      <div
        className={`flex flex-col px-6 pb-6 w-full max-w-[604px] ${contentClassName}`}
      >
        {title}
        {meta}
        {description}
        {actions}
      </div>
    </div>
  );
}
