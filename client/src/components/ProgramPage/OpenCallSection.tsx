import { PortableText } from "@/components/PortableText";
import SanityImage from "@/components/SanityImage";
import type { GetProgramBySlugQueryResult } from "@/sanity/types";

type Program = NonNullable<GetProgramBySlugQueryResult>;
type OpenCall = NonNullable<Program["openCall"]>;

interface OpenCallSectionProps {
  title: OpenCall["title"];
  image: OpenCall["heroImage"];
  timeline: OpenCall["timeline"];
  where: OpenCall["where"];
  benefits: OpenCall["benefits"];
  description: OpenCall["description"];
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
    <section id="open-call" className="px-6 md:px-16 py-6 md:py-9">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-16">
          <div className="flex flex-col justify-start border-ch-midnite md:border-r md:pr-8 py-6 md:py-0">
            <h3 className="font-milling font-bold text-[40px]">{title}</h3>
          </div>

          {infoItems.length > 0 && (
            <div className="flex flex-col gap-6">
              {infoItems.map((item) => (
                <div key={item.label} className="flex flex-col gap-3">
                  <h4 className="font-brook text-xl uppercase">{item.label}</h4>
                  <p className="font-milling text-xl whitespace-pre-line">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {description &&
          (() => {
            const mid = Math.ceil(description.length / 2);
            return (
              <div className="border-t border-ch-midnite pt-9">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
                  <div className="font-milling text-xl [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1">
                    <PortableText value={description.slice(0, mid)} />
                  </div>
                  <div className="font-milling text-xl [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1">
                    <PortableText value={description.slice(mid)} />
                  </div>
                </div>
              </div>
            );
          })()}
      </div>
    </section>
  );
}
