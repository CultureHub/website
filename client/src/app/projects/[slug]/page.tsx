import React from "react";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import { getProjectBySlug } from "@/sanity/queries";
import ProjectContentRow from "@/components/ProjectContentRow";
import SanityImage from "@/components/SanityImage";
import RelatedCarousel from "@/components/RelatedCarousel";
import Breadcrumbs from "@/components/Breadcrumbs";
import LocationPin from "@/components/LocationPin";
import { CreditSection } from "@/components/credits";

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
        <div className="flex flex-col md:flex-row justify-between gap-9 mx-6 md:mx-8">
          <div className="flex flex-col items-start gap-6">
            <Breadcrumbs
              buttons={[
                { label: "Projects", href: "/art-and-technology" },
                {
                  label: project.program.shortLabel,
                  children: project.program.title,
                },
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
          <SanityImage image={project.heroImage} className="rounded-[20px]" />

          {project.content &&
            project.content.map((content, i) => (
              <ProjectContentRow key={i} content={content} />
            ))}

          <CreditSection credits={project.credits} />

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
