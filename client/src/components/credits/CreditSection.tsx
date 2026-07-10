import { PortableText } from "next-sanity";
import type { Project } from "@/sanity/types";
import CreditLocation from "./CreditLocation";
import CreditGroup from "./CreditGroup";

type CreditData = NonNullable<Project["credits"]>;
type CreditLocationData = NonNullable<CreditData["locations"]>[number];
type CreditGroupData = NonNullable<CreditLocationData["groups"]>[number];

export default function CreditSection({
  credits,
  columns = 2,
}: {
  credits: CreditData | null | undefined;
  columns?: number;
}) {
  if (!credits) return null;

  const { description, locations } = credits;
  if (!locations || locations.length === 0) return null;

  const isMultiLocation = locations.length > 1;

  return (
    <div className="flex flex-col gap-[52px]">
      <div className="w-full py-6 border-t border-b border-ch-midnite">
        <h3 className="font-milling text-[28px] font-bold text-ch-midnite">
          Credits
        </h3>
      </div>

      {description && (
        <div className="font-brook italic text-2xl leading-[1.083] tracking-[-0.02em] max-w-[800px]">
          <PortableText value={description} />
        </div>
      )}

      {isMultiLocation ? (
        <div className="columns-1 md:columns-2 md:gap-x-16">
          {locations.map((location) => (
            <CreditLocation
              key={location._key}
              location={location as CreditLocationData}
            />
          ))}
        </div>
      ) : (
        (() => {
          const firstLoc = locations[0] as CreditLocationData;
          const groups = firstLoc.groups;
          if (!groups) return null;
          return (
            <div
              className="grid gap-[50px]"
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {groups.map((group) => (
                <CreditGroup
                  key={group._key}
                  group={group as CreditGroupData}
                />
              ))}
            </div>
          );
        })()
      )}
    </div>
  );
}
