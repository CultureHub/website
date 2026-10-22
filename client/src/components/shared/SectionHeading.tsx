export default function SectionHeading({
  title,
  className = "",
  borderTop = true,
}: {
  title: string;
  className?: string;
  borderTop?: boolean;
}) {
  return (
    <div
      className={`${
        borderTop ? "border-t " : ""
      }border-b border-ch-midnite py-6 ${className}`}
    >
      <h2 className="font-milling font-bold text-[28px] leading-[1.2]">
        {title}
      </h2>
    </div>
  );
}
