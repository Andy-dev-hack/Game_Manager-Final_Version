/**
 * Card.tsx
 * Reusable card container component with glassmorphism styling.
 * Provides consistent visual container for content throughout the application.
 * Supports hover effects and configurable padding.
 */

import React from "react";
import { clsx } from "clsx";
import styles from "./Card.module.css";

/**
 * Card component props
 * Extends native HTML div attributes
 */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean; // Enable hover lift effect
  padding?: "none" | "sm" | "md" | "lg"; // Internal padding size
}

/**
 * Card component
 * Container with glassmorphism effect and optional hover animation.
 *
 * @param {CardProps} props - Card properties
 * @returns {JSX.Element} Styled card container
 *
 * Usage:
 * <Card hoverable padding="md">Content</Card>
 */
export const Card = ({
  children,
  className,
  hoverable = false,
  padding = "md",
  ...props
}: CardProps) => {
  return (
    <div
      className={clsx(
        styles.card,
        hoverable && styles.hoverable,
        styles[`padding-${padding}`],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Exported to pages and components as content container
