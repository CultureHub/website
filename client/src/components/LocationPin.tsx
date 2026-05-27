import Image from "next/image";

export default function LocationPin({ locations }: { locations: string[] }) {
  return (
    <div className="flex flex-row md:justify-end items-center gap-2">
      <Image width="8" height="14" src="/pin.svg" alt="Location pin" />
      <span>{locations.join(", ")}</span>
    </div>
  );
}
