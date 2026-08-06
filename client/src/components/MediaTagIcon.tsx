import Image from "next/image";

export type MediaTagType = "watch" | "read" | "project" | "event" | "artist";

export default function MediaTagIcon({ type }: { type: MediaTagType }) {
  switch (type) {
    case "project":
      return (
        <Image
          width="11"
          height="10"
          src="/projectIcon.svg"
          alt="Project Icon"
        />
      );
    case "artist":
      return (
        <Image
          width="11"
          height="10"
          src="/artistProfileIcon.svg"
          alt="Artist Icon"
        />
      );
    case "event":
      return (
        <Image width="9" height="10" src="/eventIcon.svg" alt="Event Icon" />
      );
    case "watch":
      return (
        <Image width="8" height="9" src="/watchIcon.svg" alt="Watch Icon" />
      );
    case "read":
      return <Image width="5" height="9" src="/readIcon.png" alt="Read Icon" />;
  }
}
