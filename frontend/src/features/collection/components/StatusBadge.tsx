import { clsx } from "clsx";
import type { CollectionItem } from "../services/collection.service";
import styles from "./StatusBadge.module.css";

interface StatusBadgeProps {
  status: CollectionItem["status"];
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return <span className={clsx(styles.badge, styles[status])}>{status}</span>;
};
