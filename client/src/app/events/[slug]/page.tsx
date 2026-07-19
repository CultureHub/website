import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";

import Breadcrumbs from "@/components/Breadcrumbs";
import Button from "@/components/Button";
import { CreditSection } from "@/components/credits";
import LocationPin from "@/components/LocationPin";
import SanityImage from "@/components/SanityImage";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { getEventBySlug } from "@/sanity/queries";
import { formatEventDates } from "@/util/event-date";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  const dates = formatEventDates(event.dateTimes ?? []);

  return (
    <main className="min-h-screen">
      <div className="py-9 flex flex-col items-center gap-5 bg-ch-lite">
        <div className="flex justify-between w-full px-16">
          <div className="flex flex-col gap-6">
            <Breadcrumbs
              buttons={[
                {
                  label: "Events",
                  href: "/events",
                  variant: "square" as const,
                },
                ...(event.program
                  ? [
                      {
                        label: event.program.shortLabel ?? "",
                        children: event.program.title,
                        variant: "pill" as const,
                      },
                    ]
                  : []),
              ]}
            />
          </div>

          {(event.locationShort || event.location) && (
            <div className="flex flex-col items-end">
              <LocationPin
                locations={[event.locationShort ?? event.location ?? ""]}
              />
            </div>
          )}
        </div>

        <div className="flex justify-between items-center w-full max-w-[1312px]">
          <h1 className="font-milling font-bold text-5xl text-ch-midnite">
            {event.title}
          </h1>
          {event.links && event.links.length > 0 && (
            <div className="flex gap-2.5">
              {event.links.map((link) => (
                <Button
                  key={link._key}
                  variant="ticket"
                  href={link.url ?? undefined}
                >
                  {link.shortLabel ?? link.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <SanityImage
        image={event.heroImage}
        className="w-full h-[676px] object-cover"
      />

      {event.heroImage?.credits && (
        <div className="flex justify-end px-16 py-9">
          <p className="font-brook italic text-sm text-[#ACACAC]">
            {event.heroImage.credits}
          </p>
        </div>
      )}

      <div className="px-16 py-9 flex justify-between">
        <div className="w-[449px] pr-8 border-r border-ch-midnite flex flex-col gap-5">
          {dates && (
            <div className="flex flex-col gap-3">
              <h3 className="font-brook text-xl uppercase">When</h3>
              <p className="font-milling text-xl text-ch-midnite">
                {dates.dateRange}
                <br />
                {dates.timeDescription}
              </p>
            </div>
          )}

          {event.location && (
            <div className="flex flex-col gap-3">
              <h3 className="font-brook text-xl uppercase">Where</h3>
              <p className="font-milling text-xl text-ch-midnite whitespace-pre-line">
                {event.location}
              </p>
            </div>
          )}

          {event.cost && (
            <div className="flex flex-col gap-3">
              <h3 className="font-brook text-xl uppercase">Cost</h3>
              <p className="font-milling text-xl text-ch-midnite">
                {event.cost}
              </p>
            </div>
          )}

          {event.accessInfo && (
            <div className="flex flex-col gap-3">
              <h3 className="font-brook text-xl uppercase">Access</h3>
              <p className="font-milling text-xl text-ch-midnite whitespace-pre-line">
                {event.accessInfo}
              </p>
            </div>
          )}
        </div>

        <div className="w-[816px] flex flex-col gap-[46px]">
          {event.description && (
            <div className="max-w-[788px] font-milling text-2xl font-light">
              <PortableText value={event.description} />
            </div>
          )}

          {event.links && event.links.length > 0 && (
            <div className="flex gap-2.5">
              {event.links.map((link) => (
                <Button
                  key={link._key}
                  variant="ticket"
                  href={link.url ?? undefined}
                  className="w-1/2"
                >
                  {link.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {event.featuredArtists && event.featuredArtists.length > 0 && (
        <section className="px-16 py-9 flex flex-col gap-9">
          <div className="border-t border-b border-ch-midnite py-6">
            <h3 className="font-milling font-bold text-2xl">
              About the Artists
            </h3>
          </div>
          {event.featuredArtists.map((artist) => (
            <div
              key={artist._key}
              className="flex justify-between items-center"
            >
              {artist.image && (
                <SanityImage
                  image={artist.image}
                  className="w-[297px] h-[267px] object-cover border border-ch-midnite"
                />
              )}
              <div className="max-w-[660px] font-milling text-2xl font-light">
                {artist.bio && <PortableText value={artist.bio} />}
              </div>
            </div>
          ))}
        </section>
      )}

      {event.artworks && event.artworks.length > 0 && (
        <section className="px-16 py-9 flex flex-col gap-9">
          <div className="border-t border-b border-ch-midnite py-6">
            <h3 className="font-milling font-bold text-2xl">
              Artworks on View
            </h3>
          </div>
          {event.artworks.map((artwork) => (
            <div
              key={artwork._key}
              className="flex justify-between items-center"
            >
              <SanityImage
                image={artwork.image}
                className="w-[421px] h-[379px] object-cover"
              />
              <div className="max-w-[660px] font-milling text-xl font-light">
                {artwork.description && (
                  <PortableText value={artwork.description} />
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {event.aboutProgram && (
        <section className="px-16 py-9 flex flex-col gap-9">
          <div className="border-t border-b border-ch-midnite py-6">
            <h3 className="font-milling font-bold text-2xl">
              About the Program
            </h3>
          </div>
          <div className="max-w-[1034px] font-milling text-2xl font-light">
            <PortableText value={event.aboutProgram} />
          </div>
        </section>
      )}

      {event.schedule?.items && event.schedule.items.length > 0 && (
        <section className="px-16 py-9 flex flex-col gap-9">
          <div className="border-t border-b border-ch-midnite py-6">
            <h3 className="font-milling font-bold text-2xl">Schedule</h3>
          </div>
          {event.schedule.description && (
            <div className="max-w-[788px] font-milling text-2xl font-light">
              <PortableText value={event.schedule.description} />
            </div>
          )}
          <div className="flex flex-col gap-6">
            {event.schedule.items.map((item) => (
              <div key={item._key} className="flex gap-6">
                {item.time && (
                  <span className="font-brook text-xl uppercase w-32 shrink-0">
                    {item.time}
                  </span>
                )}
                <div>
                  <h4 className="font-milling font-bold text-xl">
                    {item.title}
                  </h4>
                  {item.description && (
                    <div className="font-milling text-xl font-light mt-2">
                      <PortableText value={item.description} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {event.credits && (
        <section className="px-16 py-9">
          <CreditSection credits={event.credits} />
        </section>
      )}

      <UpcomingEvents />
    </main>
  );
}
