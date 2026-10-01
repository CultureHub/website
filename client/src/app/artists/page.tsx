import { redirect } from "next/navigation";

export default function ArtistsIndexPage() {
  redirect("/community#artists");
}
