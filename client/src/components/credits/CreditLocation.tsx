import Image from "next/image";
import { PortableText } from "next-sanity";
import type { Project } from "@/sanity/types";
import CreditGroup from "./CreditGroup";

type CreditData = NonNullable<Project["credits"]>;
type CreditLocationData = NonNullable<CreditData["locations"]>[number];
type CreditGroupData = NonNullable<CreditLocationData["groups"]>[number];

export default function CreditLocation({
  location,
}: {
  location: CreditLocationData;
}) {
  return (
    <div className="flex flex-col gap-6 break-inside-avoid mb-11">
      <div className="flex flex-row py-2.5 justify-start items-center border-t border-b border-ch-midnite gap-3">
        <Image width="8" height="14" src="/pin.svg" alt="Location pin" />
        <p className="font-milling text-2xl font-bold">{location.name}</p>
      </div>
      {location.description && (
        <div className="font-brook italic text-2xl leading-[1.083] tracking-[-0.02em]">
          <PortableText value={location.description} />
        </div>
      )}
      {location.groups && location.groups.length > 0 && (
        <div className="flex flex-col gap-4">
          {location.groups.map((group) => (
            <CreditGroup key={group._key} group={group as CreditGroupData} />
          ))}
        </div>
      )}
    </div>
  );
}
