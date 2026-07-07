import FeaturedComponent from "@/components/FeaturedComponent";
import type { Program } from "@/sanity/types";

export default function Featured({ programs }: { programs: Program[] }) {
  return <FeaturedComponent programs={programs} />;
}
