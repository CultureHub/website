type CreditItemData = {
  _key: string;
  role?: string | null;
  people?: string | null;
};

export default function CreditItem({ role, people }: CreditItemData) {
  return (
    <div>
      <span className="font-brook uppercase">{role}</span>
      <span className="font-milling">{people}</span>
    </div>
  );
}
