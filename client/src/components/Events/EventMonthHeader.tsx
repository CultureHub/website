import { MONTH_LABELS } from "@/util/events-calendar";

export default function EventMonthHeader({ month }: { month: number }) {
  return (
    <div className="md:hidden flex items-center bg-ch-midnite px-[10px] h-[61px]">
      <span className="font-brook text-xl uppercase text-ch-lite">
        {MONTH_LABELS[month]}
      </span>
    </div>
  );
}
