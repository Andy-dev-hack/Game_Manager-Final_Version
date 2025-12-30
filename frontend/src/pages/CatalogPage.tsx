import { useTranslation } from "react-i18next";
import { useGames } from "../features/games/hooks/useGames";
import { useCatalogUrl } from "../features/games/hooks/useCatalogUrl";
import { GameCard } from "../features/games/components/GameCard";
import { CatalogControls } from "../features/games/components/CatalogControls";
import { Button } from "../components/ui/Button";
import type { Game } from "../services/games.service";
import styles from "./CatalogPage.module.css";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { clsx } from "clsx";

const CatalogPage = () => {
  const { t } = useTranslation();

  // Use URL params for state
  const {
    query,
    genre,
    platform,
    developer,
    publisher,
    maxPrice,
    onSale,
    sortBy,
    order,
    page,
    setPage,
  } = useCatalogUrl();

  // Fetch games with standard pagination
  const { data, isLoading, isError, isPlaceholderData } = useGames({
    page,
    limit: 12, // Consistent 12 items per page
    query, // Changed from 'search' to match backend
    genre,
    platform,
    developer,
    publisher,
    maxPrice,
    onSale,
    sortBy,
    order,
  });

  // Wait, useGames uses gamesService.getCatalog which returns { data, pagination }.
  // Wait, I need to double check useGames return type.
  // gamesService.getCatalog returns { data: Game[], pagination: ... } ?
  // Let's check games.service.ts again quickly.

  // Actually, I should assume standard service structure.
  // If useGames returns `useQuery` result, then `data` is the result of `gamesService.getCatalog`.

  // Code fix plan: Check structure in next step if needed, but standardizing:
  // gamesService used to return { games, total, ... } from backend, BUT mapped in service?
  // I viewed games.service.ts in step 223:
  // return { data: rawData.games, pagination: { ... } };

  // So data structure is:
  // data.data (Array of games)
  // data.pagination (Pagination info)

  const gamesList = data?.data || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (!isPlaceholderData && page < pagination.pages) {
      setPage(page + 1);
    }
  };

  /**
   * Get smart page numbers for pagination
   * Shows: first, last, current, nearby pages with ellipsis for gaps
   */
  const getPageNumbers = (
    currentPage: number,
    totalPages: number
  ): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [];

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    // Add ellipsis if gap between 1 and start
    if (start > 2) {
      pages.push("ellipsis");
    }

    // Add pages around current
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis if gap between end and last
    if (end < totalPages - 1) {
      pages.push("ellipsis");
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={styles.container}>
      {/* Hero section */}
      <section className={styles.hero}>
        <div className={styles.introContent}>
          <h1 className={`${styles.title} text-gradient`}>
            <h1 className={`${styles.title} text-gradient`}>
              {t("home.hero_title") || "Discover Your Next Adventure"}
            </h1>
          </h1>
          <p className={styles.subtitle}>{t("home.hero_subtitle")}</p>
        </div>
      </section>

      <div className={styles.contentWrapper}>
        {/* Controls (Search, Filter, Sort) */}
        <CatalogControls />

        {/* Loading / Error / Grid */}
        {isLoading ? (
          <div className={styles.loadingState}>
            <span className={`text-gradient ${styles.loadingText}`}>
              {t("catalog.loading")}
            </span>
          </div>
        ) : isError ? (
          <div className={styles.errorState}>{t("catalog.error")}</div>
        ) : gamesList.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>{t("catalog.noGames")}</h3>
            <p>{t("catalog.tryAdjusting")}</p>
          </div>
        ) : (
          <>
            {/* Sticky Pagination - Above Grid */}
            {pagination.pages > 1 && (
              <div className={styles.stickyPaginationWrapper}>
                <div className={styles.stickyPagination}>
                  <Button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    variant="secondary"
                    size="sm"
                  >
                    <FiChevronLeft />
                  </Button>

                  {/* Page Numbers */}
                  <div className={styles.pageNumbers}>
                    {getPageNumbers(page, pagination.pages).map(
                      (pageNum, idx) =>
                        pageNum === "ellipsis" ? (
                          <span
                            key={`ellipsis-${idx}`}
                            className={styles.ellipsis}
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={clsx(
                              styles.pageButton,
                              page === pageNum && styles.pageButtonActive
                            )}
                            disabled={isPlaceholderData}
                          >
                            {pageNum}
                          </button>
                        )
                    )}
                  </div>

                  <Button
                    onClick={handleNextPage}
                    disabled={page === pagination.pages || isPlaceholderData}
                    variant="secondary"
                    size="sm"
                  >
                    <FiChevronRight />
                  </Button>
                </div>
              </div>
            )}

            {/* Game Grid */}
            <div className={styles.grid}>
              {gamesList.map((game: Game) => (
                <GameCard key={game._id} game={game} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;
