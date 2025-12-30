/**
 * Input.tsx
 * Reusable form input component with label and error display.
 * Supports all native HTML input attributes via forwardRef.
 * Used in forms throughout the application (login, register, profile).
 */

import React from "react";
import { clsx } from "clsx";
import styles from "./Input.module.css";

/**
 * Input component props
 * Extends native HTML input attributes
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; // Optional label text
  error?: string; // Error message to display
}

/**
 * Input component
 * Form input with optional label and error message display.
 * Uses forwardRef for compatibility with react-hook-form.
 *
 * @param {InputProps} props - Input properties
 * @param {React.Ref} ref - Forwarded ref to input element
 * @returns {JSX.Element} Styled input with label and error
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || props.name; // Use name as fallback ID

    return (
      <div className={clsx(styles.container, className)}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.inputWrapper}>
          <input
            id={inputId}
            ref={ref}
            className={clsx(styles.input, error && styles.errorInput)}
            {...props}
          />
        </div>
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  }
);

// Display name for React DevTools
Input.displayName = "Input";

// Exported to forms (LoginPage, RegisterPage, etc.)
