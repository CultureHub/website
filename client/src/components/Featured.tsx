import { getPrograms } from "@/sanity/queries";
import FeaturedComponent from "@/components/FeaturedComponent";

export default async function Featured() {
  const programs = await getPrograms();

  return <FeaturedComponent programs={programs} />;
}
