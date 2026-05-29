import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText, type SanityDocument } from "next-sanity";
import { getImageDimensions } from "@sanity/asset-utils";
import { getProjectBySlug } from "@/sanity/queries";

import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/url";
import ProjectContentRow from "@/components/ProjectContentRow";
import SanityImage from "@/components/SanityImage";
import RelatedCarousel from "@/components/RelatedCarousel";
import Breadcrumbs from "@/components/Breadcrumbs";
import LocationPin from "@/components/LocationPin";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) {
    notFound();
  }

  const startDate = new Date(project.date);
  const endDate = new Date(project.endDate ? project.endDate : project.date);

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <main className="min-h-screen">
      <div className="flex flex-col gap-9 my-9 md:mx-8">
        <div className="flex flex-col md:flex-row justify-between gap-9 mx-6 md:mx-0">
          <div className="flex flex-col items-start gap-6">
            <Breadcrumbs
              buttons={[
                { text: "Project", href: "/projects" },
                { text: project.program.shortLabel },
              ]}
            />
            <h1 className="text-4xl font-bold">{project.title}</h1>
            {project.date && <p>{formatter.formatRange(startDate, endDate)}</p>}
            {project.pressLinks && (
              <div className="">
                <span className="text-base font-bold">Press: </span>
                {project.pressLinks.map(({ url, label }, index) => (
                  <span key={label} className="font-light">
                    <a href={url} className="underline">
                      {label}
                    </a>
                    {index < (project?.pressLinks?.length || 0) - 1 && ", "}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-6 md:gap-18 md:max-w-[485px]">
            {project.locations && <LocationPin locations={project.locations} />}
            {project.description && (
              <PortableText value={project.description} />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-9 md:mx-8">
          <SanityImage
            image={project.heroImage}
            className="rounded-[20px]"
          />

          {project.content &&
            project.content.map((content, i) => (
              <ProjectContentRow key={i} content={content} />
            ))}

          {project.credits && (
            <div className="flex flex-col gap-[52px] mx-6 md:mx-0">
              <div className="w-full py-6 border-t border-black">
                <h3 className="text-3xl font-bold uppercase">Credits</h3>
              </div>

              {project.credits.description && (
                <div className="text-2xl font-normal font-brook">
                  <PortableText value={project.credits.description} />
                </div>
              )}

              {project.credits.locations && (
                <div className="columns-1 md:columns-2 md:gap-x-16">
                  {project.credits.locations.map((location) => (
                    <div
                      key={location._key}
                      className="flex flex-col gap-6 break-inside-avoid mb-11"
                    >
                      <div className="flex flex-row py-2.5 justify-start items-center border-t border-b text-2xl font-normal font-brook uppercase gap-3">
                        <Image
                          width="8"
                          height="14"
                          src="/pin.svg"
                          alt="Location pin"
                        />
                        <p>{location.name}</p>
                      </div>
                      {location.description && (
                        <div className="text-2xl font-normal font-brook leading-6">
                          <PortableText value={location.description} />
                        </div>
                      )}
                      {location.organizations &&
                        location.organizations.map((organization) => (
                          <div
                            key={organization._key}
                            className="flex flex-col gap-4.5"
                          >
                            <h4 className="text-2xl font-normal font-brook uppercase">
                              {organization.name}
                            </h4>
                            {organization.description && (
                              <div className="text-2xl font-normal font-brook leading-6">
                                <PortableText
                                  value={organization.description}
                                />
                              </div>
                            )}
                            <div className="font-milling text-2xl">
                              {organization.teams &&
                                organization.teams.map((team) => (
                                  <div key={team.role}>
                                    <span className="font-bold">
                                      {team.role}:{" "}
                                    </span>
                                    <span className="font-thin">
                                      {team.people}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {project.related && (
            <div className="flex flex-col gap-[21px] mx-6 md:mx-0">
              <div className="w-full py-6 border-t border-black">
                <h3 className="text-3xl font-bold uppercase">Related</h3>
              </div>
              <RelatedCarousel related={project.related} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
