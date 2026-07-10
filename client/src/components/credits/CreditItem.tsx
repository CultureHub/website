export default function CreditItem({
  role,
  people,
}: {
  role: string;
  people: string;
}) {
  return (
    <div>
      {role && <p className="font-brook uppercase">{role}</p>}
      <p className="font-milling">{people}</p>
    </div>
  );
}
