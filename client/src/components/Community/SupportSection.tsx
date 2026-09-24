import Image from "next/image";
import type { GetCommunityPageQueryResult } from "@/sanity/types";
import ImageSlideshow from "@/components/Community/ImageSlideshow";

type CommunityPage = NonNullable<GetCommunityPageQueryResult>;
type Method = NonNullable<CommunityPage["donationMethods"]>[number];

const TIER_BACKGROUNDS = ["bg-ch-lite", "bg-ch-bb", "bg-ch-teal"];

function methodBodyText(body: Method["body"]): string {
  if (!body) return "";
  return body
    .map((block) =>
      (block.children ?? []).map((child) => child.text ?? "").join(""),
    )
    .join("\n\n");
}

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
          <h2 className="font-fig text-[72px] leading-none text-ch-bb">
            {supportTitle || "Support CultureHub"}
          </h2>
          {supportImages.length > 0 && (
            <ImageSlideshow images={supportImages} />
          )}
          <div className="flex flex-col items-center gap-6">
            {supportText && (
              <p className="font-milling font-bold text-center text-[36px] leading-tight text-ch-bb max-w-[896px]">
                {supportText}
              </p>
            )}
            {supportSubtext && (
              <p className="font-milling font-thin text-center text-[32px] leading-snug text-ch-bb max-w-[664px]">
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
            <p className="font-milling font-thin text-center text-[32px] leading-snug text-ch-midnite max-w-[738px]">
              {membershipIntro}
            </p>
          )}
        </div>

        <div className="flex justify-center py-16">
          <Image
            src="/support/membership-graphic.png"
            width={660}
            height={510}
            alt="CultureHub membership card"
            className="w-full max-w-[660px] h-auto"
          />
        </div>

        {membershipTiers.length > 0 && (
          <div className="bg-ch-midnite px-6 md:px-16 py-16">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-9">
              {membershipTiers.map((tier, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center justify-end gap-[63px] p-6 rounded-[20px] border border-ch-midnite md:w-[421px] ${
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
                    <span className="font-fig text-[40px] text-ch-midnite whitespace-nowrap">
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
              <p className="font-milling font-thin text-center text-[32px] leading-snug text-ch-midnite max-w-[712px]">
                {donationText}
              </p>
            )}
          </div>

          <Image
            src="/support/donation.png"
            width={536}
            height={492}
            alt="Make a donation"
            className="w-full max-w-[536px] h-auto"
          />

          <div className="flex flex-col md:flex-row md:justify-between items-stretch w-full gap-9">
            {donationMethods.map((method) => {
              const isOnline = method.title.toLowerCase().includes("online");
              return (
                <div
                  key={method._key}
                  className="flex flex-col gap-9 md:w-[515px]"
                >
                  <div className="flex flex-row items-center gap-6 border-y border-ch-midnite py-[10px]">
                    <Image
                      src={
                        isOnline
                          ? "/support/donate-online.svg"
                          : "/support/donate-mail.svg"
                      }
                      width={49}
                      height={49}
                      alt=""
                    />
                    <span className="font-fig text-[48px] leading-none text-ch-midnite">
                      {method.title}
                    </span>
                  </div>

                  {method.body && (
                    <div className="font-milling text-[32px] leading-snug text-ch-midnite">
                      {isOnline ? (
                        <p className="font-thin">
                          {methodBodyText(method.body)}
                        </p>
                      ) : (
                        (() => {
                          const [intro, ...rest] = methodBodyText(
                            method.body,
                          ).split("\n\n");
                          return (
                            <>
                              <p className="font-thin">{intro}</p>
                              {rest.join("\n\n") && (
                                <p className="font-bold whitespace-pre-line">
                                  {rest.join("\n\n")}
                                </p>
                              )}
                            </>
                          );
                        })()
                      )}
                    </div>
                  )}

                  {isOnline && (
                    <div className="flex flex-row justify-between">
                      <a
                        href="https://www.paypal.com/donate/?hosted_button_id=DAF43FACV9H54"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-[212px] h-[50px] border border-ch-midnite rounded-tl-[10px] rounded-br-[10px] font-milling font-bold text-2xl text-ch-midnite"
                      >
                        PayPal
                      </a>
                      <a
                        href="#"
                        className="inline-flex items-center justify-center w-[212px] h-[50px] border border-ch-midnite rounded-tl-[10px] rounded-br-[10px] font-milling font-bold text-2xl text-ch-midnite"
                      >
                        Zelle
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
