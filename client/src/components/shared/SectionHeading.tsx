export default function SectionHeading({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) {
  return (
    <div className={`border-t border-b border-ch-midnite py-6 ${className}`}>
      <h2 className="font-milling font-bold text-[28px]">{title}</h2>
    </div>
  );
}
