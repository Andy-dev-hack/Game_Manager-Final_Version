/**
 * Pagination.tsx
 * Reusable pagination component with i18n support.
 * Displays page numbers with smart ellipsis for large page counts.
 */

import { useTranslation } from "react-i18next";
import { Button } from "../ui/Button";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { clsx } from "clsx";
import styles from "./Pagination.module.css";

/**
 * Pagination component props
 */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

/**
 * Pagination Component
 * Renders pagination controls with prev/next buttons and page numbers.
 * Shows smart ellipsis for large page counts (1 ... 5 6 7 ... 20).
 *
 * @param currentPage - Current active page (1-indexed)
 * @param totalPages - Total number of pages
 * @param onPageChange - Callback when page changes
 * @param isLoading - Optional loading state to disable buttons
 */

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}: PaginationProps) => {
  const { t } = useTranslation();

  /**
   * Get smart page numbers for pagination
   * Shows: first, last, current, nearby pages with ellipsis for gaps
   */
  const getPageNumbers = (
    current: number,
    total: number
  ): (number | "ellipsis")[] => {
    if (total <= 7) {
      // Show all pages if 7 or fewer
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [];

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    // Add ellipsis if gap between 1 and start
    if (start > 2) {
      pages.push("ellipsis");
    }

    // Add pages around current
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis if gap between end and last
    if (end < total - 1) {
      pages.push("ellipsis");
    }

    // Always show last page
    if (total > 1) {
      pages.push(total);
    }

    return pages;
  };

  const handlePrevPage = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className={styles.paginationWrapper}>
      <div className={styles.pagination}>
        <Button
          onClick={handlePrevPage}
          disabled={currentPage === 1 || isLoading}
          variant="secondary"
          size="sm"
          aria-label={t("pagination.previous")}
        >
          <FiChevronLeft />
        </Button>

        {/* Page Numbers */}
        <div className={styles.pageNumbers}>
          {getPageNumbers(currentPage, totalPages).map((pageNum, idx) =>
            pageNum === "ellipsis" ? (
              <span key={`ellipsis-${idx}`} className={styles.ellipsis}>
                ...
              </span>
            ) : (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={clsx(
                  styles.pageButton,
                  currentPage === pageNum && styles.pageButtonActive
                )}
                disabled={isLoading}
                aria-label={t("pagination.page", { page: pageNum })}
              >
                {pageNum}
              </button>
            )
          )}
        </div>

        <Button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || isLoading}
          variant="secondary"
          size="sm"
          aria-label={t("pagination.next")}
        >
          <FiChevronRight />
        </Button>
      </div>
    </div>
  );
};

// Exported to LibraryPage, WishlistPage, and CatalogPage for pagination UI
