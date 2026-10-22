import type { FestivalTemplateData } from "@/sanity/queries";

export function FestivalPartners({
  groups,
}: {
  groups: FestivalTemplateData["partnerGroups"];
}) {
  const visibleGroups = (groups ?? []).filter(
    (group) => (group.names?.length ?? 0) > 0,
  );
  if (visibleGroups.length === 0) return null;

  return (
    <section className="bg-rf-highlighter px-6 py-8 md:px-16">
      <div className="flex flex-col md:flex-row md:justify-between gap-16">
        <h2 className="font-schoolbook italic text-[40px] text-rf-metal">
          Partners
        </h2>
        <div className="flex flex-col gap-7 md:max-w-[736px]">
          {visibleGroups.map((group) => (
            <div key={group._key} className="flex flex-col gap-3">
              <h3 className="font-schoolbook-condensed text-2xl text-rf-metal">
                {group.title}
              </h3>
              <div className="flex flex-col font-new-edge font-semibold text-2xl leading-tight text-rf-metal">
                {group.names?.map((name, index) => (
                  <span key={`${name}-${index}`}>{name}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
