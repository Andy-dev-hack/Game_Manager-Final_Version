/**
 * LibraryPage.tsx
 * Displays user's game library with server-side pagination, search, and filters.
 * Uses URL-driven state for shareable links and browser navigation.
 */

import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/Button";
import { GameCard } from "../features/games/components/GameCard";
import { Link, useNavigate } from "react-router-dom";
import styles from "./LibraryPage.module.css";
import { GameFilterBar } from "../components/common/GameFilterBar";
import { Pagination } from "../components/common/Pagination";
import { useLibraryUrl } from "../features/collection/hooks/useLibraryUrl";
import { useLibraryPaginated } from "../features/collection/hooks/useLibraryPaginated";

/**
 * LibraryPage Component
 * Main page for displaying user's game library with pagination and filters.
 * All state is managed via URL parameters for shareability.
 */

const LibraryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // URL state management
  const {
    page,
    query,
    genre,
    platform,
    status,
    sortBy,
    order,
    setPage,
    setSearch,
    setGenre,
    setPlatform,
    setSort,
    clearAll,
  } = useLibraryUrl();

  // Fetch paginated data
  const { data, isLoading } = useLibraryPaginated({
    page,
    limit: 20,
    query,
    status,
    genre,
    platform,
    sortBy,
    order,
  });

  const games = data?.data || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  // Check if filters are active
  const hasActiveFilters = !!(query || genre || platform || status);

  // Differentiated empty states
  const renderEmptyState = () => {
    if (hasActiveFilters) {
      // No results for current filters
      return (
        <div className={styles.emptyState}>
          <h2 className="text-gradient">{t("library.noResults")}</h2>
          <p className={styles.emptyStateText}>
            {t("library.noResultsDescription")}
          </p>
          <Button variant="secondary" onClick={clearAll}>
            {t("library.clearFilters")}
          </Button>
        </div>
      );
    } else {
      // Truly empty library
      return (
        <div className={styles.emptyState}>
          <h2 className="text-gradient">{t("library.emptyLibrary")}</h2>
          <p className={styles.emptyStateText}>
            {t("library.emptyDescription")}
          </p>
          <Link to="/" className={styles.browseLink}>
            {t("library.browseStore")}
          </Link>
        </div>
      );
    }
  };

  if (isLoading)
    return <div className={styles.loadingState}>{t("library.loading")}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className="text-gradient">{t("nav.library")}</h1>
          <span className={styles.gameCount}>
            {pagination.total}{" "}
            {pagination.total === 1 ? t("wishlist.game") : t("wishlist.games")}
          </span>
        </div>

        <div className={styles.headerActions}>
          <Button variant="primary" size="sm">
            {t("library.myGames")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/wishlist")}
            size="sm"
          >
            {t("library.wishlist")}
          </Button>
        </div>
      </div>

      <GameFilterBar
        searchQuery={query}
        genre={genre}
        platform={platform}
        sortBy={sortBy}
        order={order}
        onSearchChange={setSearch}
        onGenreChange={setGenre}
        onPlatformChange={setPlatform}
        onSortChange={setSort}
        onClear={clearAll}
        collapsible
      />

      {pagination.total === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {pagination.pages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={pagination.pages}
              onPageChange={setPage}
              isLoading={isLoading}
            />
          )}

          <div className={styles.grid}>
            {games.map((item) => (
              <GameCard key={item._id} game={item.game} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LibraryPage;

// Exported to App.tsx for routing
