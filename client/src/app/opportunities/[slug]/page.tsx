import { notFound } from "next/navigation";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import LocationPin from "@/components/LocationPin";
import { PortableText } from "@/components/PortableText";
import { getOpportunityBySlug } from "@/sanity/queries";

export default async function OpportunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const opportunity = await getOpportunityBySlug(slug);
  if (!opportunity) notFound();

  const infoItems = [
    { label: "Timeline", value: opportunity.timeline },
    { label: "Where", value: opportunity.where },
    { label: "Benefits", value: opportunity.benefits },
  ].filter((item) => item.value);

  const description = opportunity.description ?? [];

  return (
    <main className="min-h-screen">
      {/* Breadcrumb + location */}
      <div className="px-6 md:px-16 pt-8 pb-6 flex flex-row justify-between items-start">
        <div className="flex flex-row items-center gap-3 font-milling text-xl text-ch-midnite">
          <Link
            href="/community"
            className="px-[10px] py-[5px] rounded-tr-[10px] rounded-bl-[10px] border border-ch-midnite bg-ch-lite"
          >
            Community
          </Link>
          <span>&gt;</span>
          <Link
            href="/community#opportunities"
            className="px-[10px] py-[5px] rounded-tr-[10px] rounded-bl-[10px] border border-ch-midnite bg-ch-lite"
          >
            Opportunities
          </Link>
        </div>

        {opportunity.locationShort && (
          <LocationPin locations={[opportunity.locationShort]} />
        )}
      </div>

      {/* Hero */}
      {opportunity.heroImage && (
        <div className="px-6 md:px-16 pb-9">
          <SanityImage
            image={opportunity.heroImage}
            className="w-full border border-ch-midnite h-[320px] md:h-[738px] object-cover"
          />
        </div>
      )}

      {/* Summary */}
      <div className="px-6 md:px-16 pb-9">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-16 border-t border-b border-ch-midnite py-9">
          <div className="md:border-r md:border-ch-midnite md:pr-8">
            <h1 className="font-milling font-bold text-[40px] leading-tight">
              {opportunity.title}
            </h1>
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
      </div>

      {/* Description (two columns) */}
      {description.length > 0 && (
        <div className="px-6 md:px-16 pb-9">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
            <div className="font-milling text-xl [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1">
              <PortableText
                value={description.slice(0, Math.ceil(description.length / 2))}
              />
            </div>
            <div className="font-milling text-xl [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1">
              <PortableText
                value={description.slice(Math.ceil(description.length / 2))}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
