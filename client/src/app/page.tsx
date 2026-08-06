import Link from "next/link";

export default async function ProjectsIndexPage() {
  return (
    <main className="container mx-auto min-h-screen p-8">
      <Link href="/artists">
        <h1 className="text-4xl font-bold mb-8">Artist</h1>
      </Link>
      <Link href="/art-and-technology">
        <h1 className="text-4xl font-bold mb-8">Art & Technology</h1>
      </Link>
    </main>
  );
}
