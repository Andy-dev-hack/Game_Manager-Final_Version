/**
 * ErrorBoundary.tsx
 * React Error Boundary to catch and handle component errors
 * Prevents entire app crash when a component throws an error
 */

import { Component, type ErrorInfo, type ReactNode } from "react";
import { logger } from "../utils/error.util";
import styles from "./ErrorBoundary.module.css";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in child component tree
 * Logs errors and displays fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Update state when error is caught
   * @param error - Error object thrown by component
   */
  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  /**
   * Log error details for debugging
   * @param error - Error object
   * @param errorInfo - Component stack trace
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error("Error Boundary caught an error:", { error, errorInfo });

    this.setState({
      error,
      errorInfo,
    });
  }

  /**
   * Reset error state to try rendering again
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <h1 className={styles.errorTitle}>Oops! Something went wrong</h1>
            <p className={styles.errorMessage}>
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className={styles.errorDetails}>
                <summary>Error Details (Development Only)</summary>
                <pre className={styles.errorStack}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className={styles.errorActions}>
              <button
                onClick={() => window.location.reload()}
                className={styles.primaryButton}
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleReset}
                className={styles.secondaryButton}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Exported to App.tsx for application-wide error handling
