import { festivalNavItems } from "@/util/festival";
import type { FestivalTemplateData } from "@/sanity/queries";

export function FestivalJumpTo({
  festival,
}: {
  festival: FestivalTemplateData;
}) {
  return (
    <nav className="sticky top-[61px] z-40 bg-ch-lite border-b border-ch-midnite">
      <div className="px-6 md:px-16 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-baseline gap-2.5">
          <span className="font-schoolbook text-[38px] leading-none text-rf-metal">
            {festival.year}
          </span>
          <span className="font-new-edge font-semibold text-4xl tracking-[-0.02em] text-rf-metal">
            {festival.title}
          </span>
        </div>
        <div className="flex flex-wrap gap-4">
          {festivalNavItems(festival.locations ?? []).map((item) => (
            <a
              key={item.anchor}
              href={`#${item.anchor}`}
              className="inline-flex h-[34px] w-[172px] items-center justify-center rounded-[5px] border border-rf-metal bg-rf-blue-smoke px-2.5 pt-[5px] font-new-edge text-xl uppercase text-rf-metal"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
