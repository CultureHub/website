import Link from "next/link";
import type { GetCommunityPageQueryResult } from "@/sanity/types";

type CommunityPage = NonNullable<GetCommunityPageQueryResult>;
type Opportunity = NonNullable<CommunityPage["opportunities"]>[number];

function Star() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="#0a0018"
      aria-hidden="true"
    >
      <path d="M9 0 11.2 6.1 18 6.5 12.5 10.6 14.3 17 9 13.3 3.7 17 5.5 10.6 0 6.5 6.8 6.1Z" />
    </svg>
  );
}

export default function OpportunitiesSection({
  title,
  intro,
  currentTitle,
  opportunities,
}: {
  title: CommunityPage["opportunitiesTitle"];
  intro: CommunityPage["opportunitiesIntro"];
  currentTitle: CommunityPage["currentOpportunitiesTitle"];
  opportunities: Opportunity[];
}) {
  return (
    <section id="opportunities" className="flex flex-col items-center">
      <div className="w-full px-6 md:px-16">
        <div className="flex flex-col md:flex-row justify-between gap-6 py-12 border-b border-black">
          <h2 className="font-milling font-bold text-[40px] leading-tight">
            {title || "Opportunities"}
          </h2>
          {intro && (
            <p className="font-sans font-thin text-2xl leading-snug md:max-w-[683px]">
              {intro}
            </p>
          )}
        </div>

        <div className="py-6 border-b border-black">
          <h3 className="font-milling font-bold text-[28px]">
            {currentTitle || "Current Opportunities"}
          </h3>
        </div>
      </div>

      <div className="w-full px-6 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-9">
          {opportunities.map((opp) => {
            const href =
              opp._type === "program"
                ? `/${opp.slug}`
                : `/opportunities/${opp.slug}`;
            return (
              <Link
                key={opp._id}
                href={href}
                className="flex flex-col gap-[18px]"
              >
                <div className="flex flex-row justify-between items-center">
                  <div className="flex flex-row items-center gap-[18px]">
                    <Star />
                    <span className="font-brook text-base uppercase text-ch-midnite">
                      {opp.tag}
                    </span>
                  </div>
                  {opp.location && (
                    <span className="font-brook text-base text-ch-midnite">
                      {opp.location}
                    </span>
                  )}
                </div>
                <div className="border-t border-black pt-0">
                  <span className="font-milling font-normal text-2xl">
                    {opp.title}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
