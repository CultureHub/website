import { PortableText } from "next-sanity";
import CreditItem from "./CreditItem";

export default function CreditGroup({
  group,
}: {
  group: Record<string, unknown>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row py-2.5 justify-center items-center border-t border-b border-ch-midnite gap-2.5">
        <div className="w-[11px] h-[11px] rounded-full bg-ch-midnite shrink-0" />
        <h4 className="font-milling text-xl font-bold uppercase">
          {group.name as string}
        </h4>
      </div>
      {group.description && (
        <div className="font-brook italic text-xl leading-[1.083] tracking-[-0.02em]">
          <PortableText
            value={
              group.description as Parameters<typeof PortableText>[0]["value"]
            }
          />
        </div>
      )}
      {group.items && (group.items as unknown[]).length > 0 && (
        <div className="font-milling text-xl flex flex-col gap-3">
          {(group.items as unknown[]).map((item) => {
            const i = item as Record<string, unknown>;
            return (
              <CreditItem
                key={i._key as string}
                role={(i.role as string) || ""}
                people={(i.people as string) || ""}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
