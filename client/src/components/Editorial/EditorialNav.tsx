import Link from "next/link";
import styles from "./editorial.module.css";

export default function EditorialNav({ mode }: { mode: "read" }) {
  return (
    <nav aria-label="Editorial" className={styles.editorialNav}>
      <Link
        href="/read"
        aria-current={mode === "read" ? "page" : undefined}
        className={styles.activeRead}
      >
        Read
      </Link>
      <span
        aria-disabled="true"
        title="Watch is not available yet"
        className={styles.unavailableWatch}
      >
        Watch
      </span>
    </nav>
  );
}
