import { PortableText } from "next-sanity";
import type { Project } from "@/sanity/types";
import CreditItem from "./CreditItem";

type CreditData = NonNullable<Project["credits"]>;
type CreditLocationData = NonNullable<CreditData["locations"]>[number];
type CreditGroupData = NonNullable<CreditLocationData["groups"]>[number];
type CreditItemData = NonNullable<CreditGroupData["items"]>[number];

export default function CreditGroup({ group }: { group: CreditGroupData }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row py-2.5 justify-center items-center border-t border-b border-ch-midnite gap-2.5">
        <div className="w-[11px] h-[11px] rounded-full bg-ch-midnite shrink-0" />
        <h4 className="font-milling text-xl font-bold uppercase">
          {group.name}
        </h4>
      </div>
      {group.description && (
        <div className="font-brook italic text-xl leading-[1.083] tracking-[-0.02em]">
          <PortableText value={group.description} />
        </div>
      )}
      {group.items && group.items.length > 0 && (
        <div className="font-milling text-xl flex flex-col gap-3">
          {group.items.map((item) => (
            <CreditItem
              key={item._key}
              role={item.role ?? ""}
              people={item.people ?? ""}
            />
          ))}
        </div>
      )}
    </div>
  );
}
