"use client";

import { useState } from "react";
import { PortableText } from "@/components/PortableText";
import type { GetCommunityPageQueryResult } from "@/sanity/types";

type CommunityPage = NonNullable<GetCommunityPageQueryResult>;
type Method = NonNullable<CommunityPage["donationMethods"]>[number];

export default function DonationAccordion({ methods }: { methods: Method[] }) {
  const [openTitle, setOpenTitle] = useState<string | null>(null);

  return (
    <div className="flex flex-col md:flex-row md:justify-between items-stretch w-full gap-9">
      {methods.map((method) => {
        const isOpen = openTitle === method.title;
        return (
          <div
            key={method.title}
            className="flex flex-col gap-9 md:w-[515px] self-stretch"
          >
            <button
              onClick={() => setOpenTitle(isOpen ? null : method.title)}
              className="flex flex-row items-center justify-between border-y border-black py-[10px] text-left"
            >
              <span className="font-fig text-[48px] leading-none">
                {method.title}
              </span>
              <span className="font-fig text-[32px] uppercase leading-none">
                {isOpen ? "\u2212" : "+"}
              </span>
            </button>
            {isOpen && method.body && (
              <div className="font-sans font-thin text-xl [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1">
                <PortableText value={method.body} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
