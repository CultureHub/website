import EditorialNav from "./EditorialNav";
import styles from "./editorial.module.css";

export default function EditorialHeader({
  heading,
  mode,
}: {
  heading: string;
  mode: "read";
}) {
  return (
    <header className={styles.editorialHeader}>
      <h1 className="font-milling text-[40px] font-bold leading-tight">
        {heading}
      </h1>
      <EditorialNav mode={mode} />
    </header>
  );
}
