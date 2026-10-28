export default function SectionHeading({
  title,
  className = "",
  borderTop = true,
  fontClassName = "font-milling",
  fontWeightClassName = "font-bold",
}: {
  title: string;
  className?: string;
  borderTop?: boolean;
  fontClassName?: string;
  fontWeightClassName?: string;
}) {
  return (
    <div
      className={`${
        borderTop ? "border-t " : ""
      }border-b border-ch-midnite py-6 ${className}`}
    >
      <h2
        className={`${fontClassName} ${fontWeightClassName} text-[28px] leading-[1.2]`}
      >
        {title}
      </h2>
    </div>
  );
}
