/**
 * Loader.tsx
 * Reusable loading spinner component with configurable sizes.
 * Used across the application for loading states in pages and components.
 */
import styles from "./Loader.module.css";
import { clsx } from "clsx";

/**
 * Loader component props
 */
interface LoaderProps {
  size?: "sm" | "md" | "lg"; // Size variant: small, medium, large
  className?: string; // Additional CSS classes for customization
}

/**
 * Loader Component
 * Displays an animated spinner to indicate loading state.
 * Uses CSS modules for styling with three size variants.
 *
 * @param size - Size variant (default: 'md')
 * @param className - Optional additional CSS classes
 * @returns Loading spinner element
 */
export const Loader = ({ size = "md", className }: LoaderProps) => {
  return (
    <div className={clsx(styles.loader, styles[size], className)}>
      <div className={styles.spinner} />
    </div>
  );
};

// Exported to pages and components for loading states (WishlistPage, LibraryPage, etc.)
