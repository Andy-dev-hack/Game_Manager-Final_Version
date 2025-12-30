/**
 * Button.tsx
 * Reusable button component with variants, sizes, and loading states.
 * Uses CSS modules for scoped styling and supports all native button props.
 * Implements forwardRef for compatibility with form libraries and refs.
 */

import React from "react";
import { clsx } from "clsx";
import styles from "./Button.module.css";

/**
 * Button component props
 * Extends native HTML button attributes
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "secondary"; // Visual style variant
  size?: "sm" | "md" | "lg"; // Button size
  isLoading?: boolean; // Shows loading spinner and disables button
}

/**
 * Button component
 * Customizable button with variants, sizes, and loading state.
 *
 * @param {ButtonProps} props - Button properties
 * @param {React.Ref} ref - Forwarded ref to button element
 * @returns {JSX.Element} Styled button element
 *
 * Usage:
 * <Button variant="primary" size="md" onClick={handleClick}>Click me</Button>
 * <Button isLoading>Loading...</Button>
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={clsx(
          styles.button,
          styles[variant],
          styles[size],
          className
        )}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading ? <span className={styles.spinner}>⏳</span> : children}
      </button>
    );
  }
);

// Display name for React DevTools
Button.displayName = "Button";

// Exported to pages and components for user interactions
