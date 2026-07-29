interface ProjectLike {
  people?: string | null;
  artists?: Array<{ name: string }> | null;
}

export function getProjectPeople(project: ProjectLike): string {
  return project.people || project.artists?.map((a) => a.name).join(", ") || "";
}

export function getProjectPeopleOrNull(project: ProjectLike): string | null {
  return (
    project.people || project.artists?.map((a) => a.name).join(", ") || null
  );
}
