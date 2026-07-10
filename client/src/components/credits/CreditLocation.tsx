import Image from "next/image";
import { PortableText, type PortableTextBlock } from "next-sanity";
import CreditGroup from "./CreditGroup";

type CreditLocationData = {
  _key: string;
  name?: string | null;
  description?: PortableTextBlock[] | null;
  groups?: Array<{
    _key: string;
    name?: string | null;
    description?: PortableTextBlock[] | null;
    items?: Array<{
      _key: string;
      role?: string | null;
      people?: string | null;
    }> | null;
  }> | null;
};

export default function CreditLocation({
  location,
}: {
  location: CreditLocationData;
}) {
  return (
    <div className="flex flex-col gap-6 break-inside-avoid mb-11">
      <div className="flex flex-row py-2.5 justify-start items-center border-t border-b border-ch-midnite gap-3">
        <Image width="8" height="14" src="/pin.svg" alt="Location pin" />
        <p className="font-milling text-2xl font-bold uppercase">
          {location.name}
        </p>
      </div>
      {location.description && (
        <div className="font-brook italic text-2xl leading-[1.083] tracking-[-0.02em]">
          <PortableText value={location.description} />
        </div>
      )}
      {location.groups && location.groups.length > 0 && (
        <div className="flex flex-col gap-4">
          {location.groups.map((group) => (
            <CreditGroup key={group._key} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
