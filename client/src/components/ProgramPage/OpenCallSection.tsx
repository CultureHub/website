import { PortableText } from "next-sanity";
import SanityImage from "@/components/SanityImage";
import type { SanityImageSource } from "@sanity/image-url";
import type { TypedObject } from "next-sanity";

interface OpenCallSectionProps {
  title: string | null;
  image: SanityImageSource | null;
  timeline: string | null;
  where: string | null;
  benefits: string | null;
  description: TypedObject[] | null;
}

export default function OpenCallSection({
  title,
  image,
  timeline,
  where,
  benefits,
  description,
}: OpenCallSectionProps) {
  const infoItems = [
    { label: "Timeline", value: timeline },
    { label: "Where", value: where },
    { label: "Benefits", value: benefits },
  ].filter((item) => item.value);

  return (
    <section className="px-6 md:px-16 py-9">
      <div className="border-t border-b border-ch-midnite py-6 mb-9">
        <h2 className="font-milling font-bold text-[28px]">Open Call</h2>
      </div>

      <div className="flex flex-col gap-9">
        {image && (
          <SanityImage
            image={image}
            className="w-full border border-ch-midnite"
          />
        )}

        <h3 className="font-milling font-bold text-[40px]">{title}</h3>

        {infoItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
            <div className="flex flex-col gap-6 border-r border-ch-midnite pr-8">
              {infoItems.map((item) => (
                <div key={item.label} className="flex flex-col gap-3">
                  <h4 className="font-brook text-xl uppercase">{item.label}</h4>
                  <p className="font-milling text-xl whitespace-pre-line">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            <div>
              {description && (
                <div className="font-milling text-xl">
                  <PortableText value={description} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
