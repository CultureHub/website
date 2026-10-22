import type { FestivalLocation } from "@/sanity/queries";

export function FestivalSchedule({
  schedule,
}: {
  schedule: NonNullable<FestivalLocation["schedule"]>;
}) {
  const days = schedule.days ?? [];
  if (days.length === 0) return null;

  return (
    <section className="bg-rf-cream px-6 py-9 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:auto-rows-fr">
        {days.map((day) => (
          <div
            key={day._key}
            data-equal-height-group="schedule"
            className="flex h-full w-full flex-col"
          >
            <div className="border-2 border-rf-ocher bg-rf-highlighter px-6 py-8 text-center">
              <h3 className="font-milling font-semibold text-4xl uppercase text-rf-ocher">
                {day.dateLabel}
              </h3>
            </div>
            {(day.items ?? []).map((item) => (
              <div
                key={item._key}
                className="flex flex-col md:flex-row md:justify-between gap-2 border-x-2 border-b-2 border-rf-ocher bg-rf-cream px-6 py-2.5"
              >
                {item.time && (
                  <span className="font-milling font-semibold text-[32px] text-rf-ocher shrink-0 whitespace-nowrap">
                    {item.time}
                  </span>
                )}
                <div className="font-brook text-2xl text-rf-metal whitespace-pre-line">
                  {item.description}
                  {item.links?.map((link) => (
                    <a
                      key={link._key}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 underline"
                    >
                      {link.shortLabel ?? link.label} →
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
