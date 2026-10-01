import Image from "next/image";

export default function EventsEmptyState() {
  return (
    <div className="flex flex-col md:flex-row">
      <div className="md:w-[671px] px-6 py-6 flex flex-col gap-6 border-b md:border-b-0 border-ch-midnite">
        <p className="font-brook italic text-xl text-ch-midnite whitespace-pre-line">
          There are no upcoming events scheduled at this time.{"\n\n"}
          To be the first to hear about future opportunities, you can sign up
          for the CultureHub Newsletter.
        </p>
        <div className="flex flex-row items-center gap-4">
          <input
            aria-label="Your Email"
            placeholder="Your Email"
            className="w-[309px] h-[33px] px-2 rounded-lg border border-ch-midnite placeholder-neutral-400"
          />
          <button
            aria-label="Submit"
            className="w-[59px] h-[33px] flex items-center justify-center rounded-lg border border-ch-midnite text-ch-midnite"
          >
            &rarr;
          </button>
        </div>
      </div>
      <div className="md:w-[641px] shrink-0 border border-ch-midnite bg-ch-lite overflow-hidden">
        <Image
          src="/c-pattern.svg"
          alt=""
          width={641}
          height={1045}
          className="w-full h-auto"
        />
      </div>
    </div>
  );
}
