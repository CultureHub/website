import Image from "next/image";
import { urlFor } from "@/sanity/url";
import { getImageDimensions } from "@sanity/asset-utils";
import type { SanityImageSource } from "@sanity/image-url";

type ImageComponentProps = {
  image: SanityImageSource;
  className?: string;
};

export default function SanityImage({
  image,
  className = "",
}: ImageComponentProps) {
  const imageUrl = urlFor(image)?.url();
  const imageDimensions = imageUrl ? getImageDimensions(imageUrl) : null;

  if (!imageUrl) return null;

  return (
    <Image
      src={imageUrl}
      alt={typeof image === "object" && "alt" in image ? image.alt || "" : ""}
      width={imageDimensions?.width}
      height={imageDimensions?.height}
      className={`rounded-[20px] ${className}`}
    />
  );
}
