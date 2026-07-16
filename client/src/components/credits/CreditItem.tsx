export default function CreditItem({
  role,
  people,
}: {
  role: string;
  people: string;
}) {
  return (
    <div>
      {role && <p className="font-brook uppercase text-xl">{role}</p>}
      <p className="font-milling font-bold text-xl">{people}</p>
    </div>
  );
}
