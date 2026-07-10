import Image from "next/image";
import { PortableText } from "next-sanity";
import CreditGroup from "./CreditGroup";

export default function CreditLocation({
  location,
}: {
  location: Record<string, unknown>;
}) {
  return (
    <div className="flex flex-col gap-6 break-inside-avoid mb-11">
      <div className="flex flex-row py-2.5 justify-start items-center border-t border-b border-ch-midnite gap-3">
        <Image width="8" height="14" src="/pin.svg" alt="Location pin" />
        <p className="font-milling text-2xl font-bold uppercase">
          {location.name as string}
        </p>
      </div>
      {location.description && (
        <div className="font-brook italic text-2xl leading-[1.083] tracking-[-0.02em]">
          <PortableText
            value={
              location.description as Parameters<
                typeof PortableText
              >[0]["value"]
            }
          />
        </div>
      )}
      {location.groups && (location.groups as unknown[]).length > 0 && (
        <div className="flex flex-col gap-4">
          {(location.groups as unknown[]).map((group) => (
            <CreditGroup
              key={(group as Record<string, unknown>)._key as string}
              group={group as Record<string, unknown>}
            />
          ))}
        </div>
      )}
    </div>
  );
}
