import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText, type SanityDocument } from "next-sanity";
import { getImageDimensions } from "@sanity/asset-utils";
import { getProjectBySlug } from "@/sanity/queries";

import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/url";
import Button from "@/components/Button";
import ProjectContentRow from "@/components/ProjectContentRow";

type ProjectBreadcrumbsProps = {
  program: string;
};
function ProjectBreadcrumbs({ program }: ProjectBreadcrumbsProps) {
  return (
    <div className="flex flex-row items-center gap-3">
      <Button variant="pill" className="px-[10px] py-[5px]" href="/projects">
        Projects
      </Button>
      <span className="font-normal">&gt;</span>
      <Button variant="pill" className="px-[10px] py-[5px]">
        {program}
      </Button>
    </div>
  );
}

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
  const heroImageUrl = project.heroImage
    ? urlFor(project.heroImage)?.url()
    : null;
  const heroImageDimensions = heroImageUrl
    ? getImageDimensions(heroImageUrl)
    : null;

  const startDate = new Date(project.date);
  const endDate = new Date(project.endDate ? project.endDate : project.date);

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <main className="border-t-1 border-ch-midnite min-h-screen">
      <div className="flex flex-col gap-9 my-9 mx-8">
        <div className="flex flex-row justify-between gap-9">
          <div className="flex flex-col items-start gap-6">
            <ProjectBreadcrumbs program={project.program} />
            <h1 className="text-4xl font-bold">{project.title}</h1>
            {project.date && <p>{formatter.formatRange(startDate, endDate)}</p>}
            {Array.isArray(project.pressLinks) && (
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
          <div className="flex flex-col gap-18 max-w-[485px]">
            {Array.isArray(project.locations) && (
              <div className="flex flex-row justify-end items-center gap-2">
                <Image
                  width="8"
                  height="14"
                  src="/pin.svg"
                  alt="Location pin"
                />
                <span>{project.locations.join(", ")}</span>
              </div>
            )}
            {Array.isArray(project.description) && (
              <PortableText value={project.description} />
            )}
          </div>
        </div>
        <div>
          {heroImageUrl && (
            <Image
              src={heroImageUrl}
              alt={project.title}
              width={heroImageDimensions?.width}
              height={heroImageDimensions?.height}
              className="rounded-[20px]"
            />
          )}
        </div>
        {project.content &&
          project.content.map((content, i) => (
            <ProjectContentRow key={i} content={content} />
          ))}
      </div>
    </main>
  );
}
