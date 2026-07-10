import { PortableText } from "next-sanity";
import CreditLocation from "./CreditLocation";
import CreditGroup from "./CreditGroup";

interface CreditSectionData {
  description?: unknown;
  locations?: unknown[];
}

export default function CreditSection({
  credits,
  columns = 2,
}: {
  credits: CreditSectionData | null | undefined;
  columns?: number;
}) {
  if (!credits) return null;

  const { description, locations } = credits;
  if (!locations || locations.length === 0) return null;

  const isMultiLocation = locations.length > 1;

  return (
    <div className="flex flex-col gap-[52px]">
      <div className="w-full py-6 border-t border-ch-midnite">
        <h3 className="font-milling text-[28px] font-bold uppercase text-ch-midnite">
          Credits
        </h3>
      </div>

      {description && (
        <div className="font-brook italic text-2xl leading-[1.083] tracking-[-0.02em]">
          <PortableText
            value={description as Parameters<typeof PortableText>[0]["value"]}
          />
        </div>
      )}

      {isMultiLocation ? (
        <div className="columns-1 md:columns-2 md:gap-x-16">
          {locations.map((location: Record<string, unknown>) => (
            <CreditLocation key={location._key as string} location={location} />
          ))}
        </div>
      ) : (
        <div
          className="grid gap-[52px]"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {(locations[0] as Record<string, unknown>).groups &&
            ((locations[0] as Record<string, unknown>).groups as unknown[]).map(
              (group) => (
                <CreditGroup
                  key={(group as Record<string, unknown>)._key as string}
                  group={group as Record<string, unknown>}
                />
              ),
            )}
        </div>
      )}
    </div>
  );
}
