import { PortableText } from "next-sanity";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getArtistsBySlug } from "@/sanity/queries";
import SanityImage from "@/components/SanityImage";
import Breadcrumbs from "@/components/Breadcrumbs";
import LocationPin from "@/components/LocationPin";
import Button from "@/components/Button";
import MediaTagIcon from "@/components/MediaTagIcon";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = await getArtistsBySlug(slug);
  if (!artist) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <div className="flex flex-col gap-8 m-0 md:m-8">
        <div className="flex flex-col mx-6 mt-6 md:m-0 md:flex-row justify-between gap-9">
          <div className="flex flex-col items-start gap-6 w-full md:border-b">
            <div className="flex flex-row justify-between w-full ml-2">
              <Breadcrumbs
                buttons={[
                  { text: "Artist", href: "/artists", variant: "half" },
                  { text: artist.program },
                ]}
              />
              {artist.locations && <LocationPin locations={artist.locations} />}
            </div>
            <h1 className="text-4xl RaRfont-bold md:my-6">{artist.name}</h1>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-9 md:gap-14">
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <SanityImage
                image={artist.image}
                className="md:outline md:outline-1 md:outline-offset-[-1px] md:rounded-tr-[10px] md:rounded-bl-[10px] md:outline-ch-midnite"
              />
              {artist.image.credits && (
                <div className="text-14/6 text-neutral-400 tracking-tight mx-6 md:ml-[10px]">
                  {artist.image.credits}
                </div>
              )}
            </div>
            {artist.links && (
              <div className="flex flex-row gap-[30px] mx-6 md:m-0 md:px-2">
                {artist.links.map((link) => (
                  <Button
                    key={link._key}
                    variant="rounded"
                    href={link.url}
                    openNewTab
                    className="p-[5px]"
                  >
                    <div className="font-normal underline leading-6">
                      {link.label}
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-13 mx-6 md:mt-8 md:mr-8">
            {artist.bio && (
              <div className="flex flex-col gap-3">
                <div className="font-bold text-16/6 uppercase tracking-tight">
                  About
                </div>
                <div className="font-thin text-2xl tracking-tight">
                  <PortableText value={artist.bio} />
                </div>
              </div>
            )}
            {artist.projectStatement && (
              <div className="flex flex-col gap-3">
                <div className="font-bold text-16/6 uppercase tracking-tight">
                  Project Statement
                </div>
                <div className="font-normal text-2xl italic font-brook tracking-tight">
                  <PortableText value={artist.projectStatement} />
                </div>
              </div>
            )}
          </div>
        </div>

        {artist.projects ? (
          <div className="mx-6 md:m-0">
            <h2 className="py-1 text-18/6 tracking-tight uppercase font-brook border-t-1 border-b-1">
              Projects
            </h2>
            <ul>
              {artist.projects?.map((project, index) => (
                <li key={project._id}>
                  <Link
                    href={`/projects/${project.slug?.current}`}
                    className={`flex flex-row h-[89px] group hover:bg-ch-bb active:bg-ch-teal justify-between items-center ${index > 0 ? "border-t-1" : ""}`}
                  >
                    <SanityImage
                      className="h-full w-auto py-1"
                      image={project.heroImage}
                    />
                    <div className="flex flex-row gap-3">
                      <MediaTagIcon type="project" />
                      <p className="text-20/6 tracking-tight group-hover:underline group-active:underline underline-offset-10 pr-4">
                        {project.title}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* TODO: Handle events, read, and watch */}
      </div>
    </main>
  );
}
