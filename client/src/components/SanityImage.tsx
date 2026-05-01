import Image from "next/image";
import { urlFor } from "@/sanity/url";
import { getImageDimensions } from "@sanity/asset-utils";
import type { SanityImageSource } from "@sanity/image-url";

type ImageComponentProps = {
  image: SanityImageSource;
  className?: string;
  width?: number | `${number}`;
  height?: number | `${number}`;
  fill?: boolean;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
};

export default function SanityImage({
  image,
  className = "",
  width,
  height,
  fill,
  objectFit,
}: ImageComponentProps) {
  const imageUrl = urlFor(image)?.url();
  const imageDimensions = imageUrl ? getImageDimensions(imageUrl) : null;

  if (!imageUrl) return null;

  const imageWidth = width !== undefined ? width : imageDimensions?.width;
  const imageHeight = height !== undefined ? height : imageDimensions?.height;

  return (
    <Image
      src={imageUrl}
      alt={typeof image === "object" && "alt" in image ? image.alt || "" : ""}
      width={fill ? undefined : imageWidth}
      height={fill ? undefined : imageHeight}
      fill={fill}
      className={className}
      style={objectFit ? { objectFit } : undefined}
    />
  );
}
