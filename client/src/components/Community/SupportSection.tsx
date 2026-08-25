import type { GetCommunityPageQueryResult } from "@/sanity/types";
import ImageSlideshow from "@/components/Community/ImageSlideshow";
import DonationAccordion from "@/components/Community/DonationAccordion";

type CommunityPage = NonNullable<GetCommunityPageQueryResult>;

const TIER_BACKGROUNDS = ["bg-ch-lite", "bg-ch-bb", "bg-ch-teal"];

export default function SupportSection({
  supportTitle,
  supportImages,
  supportText,
  supportSubtext,
  membershipTitle,
  membershipIntro,
  membershipTiers,
  donationTitle,
  donationText,
  donationMethods,
}: {
  supportTitle: CommunityPage["supportTitle"];
  supportImages: NonNullable<CommunityPage["supportImages"]>;
  supportText: CommunityPage["supportText"];
  supportSubtext: CommunityPage["supportSubtext"];
  membershipTitle: CommunityPage["membershipTitle"];
  membershipIntro: CommunityPage["membershipIntro"];
  membershipTiers: NonNullable<CommunityPage["membershipTiers"]>;
  donationTitle: CommunityPage["donationTitle"];
  donationText: CommunityPage["donationText"];
  donationMethods: NonNullable<CommunityPage["donationMethods"]>;
}) {
  return (
    <section id="support" className="flex flex-col">
      {/* Support CultureHub */}
      <div className="bg-ch-midnite px-6 md:px-16 py-8">
        <div className="flex flex-col items-center gap-9 py-9">
          <h2 className="font-fig text-[72px] text-ch-bb">
            {supportTitle || "Support CultureHub"}
          </h2>
          {supportImages.length > 0 && (
            <ImageSlideshow images={supportImages} />
          )}
          <div className="flex flex-col items-center gap-6">
            {supportText && (
              <p className="font-sans font-bold text-center text-[36px] leading-tight text-ch-bb max-w-[896px]">
                {supportText}
              </p>
            )}
            {supportSubtext && (
              <p className="font-sans font-thin text-center text-[32px] leading-snug text-ch-bb max-w-[664px]">
                {supportSubtext}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Membership */}
      <div className="bg-ch-bb">
        <div className="flex flex-col items-center gap-9 py-8">
          <h2 className="font-fig text-[72px] text-ch-midnite">
            {membershipTitle || "Become a Member"}
          </h2>
          {membershipIntro && (
            <p className="font-sans font-thin text-center text-[32px] leading-snug text-ch-midnite max-w-[738px]">
              {membershipIntro}
            </p>
          )}
        </div>

        {membershipTiers.length > 0 && (
          <div className="bg-ch-midnite px-6 md:px-16 py-16">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-9">
              {membershipTiers.map((tier, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center gap-[63px] p-6 rounded-[20px] border border-ch-midnite md:w-[421px] ${
                    TIER_BACKGROUNDS[i % TIER_BACKGROUNDS.length]
                  }`}
                >
                  <span className="font-fig text-[64px] text-ch-midnite">
                    {tier.name}
                  </span>
                  <div className="w-full border-y border-ch-midnite py-[10px] text-center">
                    {tier.price && (
                      <span className="font-brook text-4xl uppercase text-ch-midnite">
                        {tier.price}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-[63px] w-full">
                    <span className="font-fig text-[40px] text-ch-midnite">
                      {tier.name} Receive:
                    </span>
                    {tier.benefits && (
                      <span className="font-milling font-normal text-[32px] text-ch-midnite whitespace-pre-line">
                        {tier.benefits}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Make a Donation */}
      <div className="bg-ch-teal px-6 md:px-16 py-8">
        <div className="flex flex-col items-center gap-[63px]">
          <div className="flex flex-col items-center gap-9">
            <h2 className="font-fig text-[72px] text-ch-midnite">
              {donationTitle || "Make a Donation"}
            </h2>
            {donationText && (
              <p className="font-sans font-thin text-center text-[32px] leading-snug text-ch-midnite max-w-[712px]">
                {donationText}
              </p>
            )}
          </div>
          {donationMethods.length > 0 && (
            <DonationAccordion methods={donationMethods} />
          )}
        </div>
      </div>
    </section>
  );
}
