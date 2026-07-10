export default function CreditItem({
  role,
  people,
}: {
  role: string;
  people: string;
}) {
  return (
    <div>
      <span className="font-brook uppercase">{role}</span>
      <span className="font-milling">{people}</span>
    </div>
  );
}
