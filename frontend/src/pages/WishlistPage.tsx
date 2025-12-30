/**
 * WishlistPage.tsx
 * Page for displaying the user's wishlist games with server-side pagination.
 * Uses URL-driven state for shareable links and browser navigation.
 */

import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BsHeart } from "react-icons/bs";
import { GameCard } from "../features/games/components/GameCard";
import { Loader } from "../components/ui/Loader";
import { Button } from "../components/ui/Button";
import styles from "./WishlistPage.module.css";
import { useAuth } from "../features/auth/AuthContext";
import { GameFilterBar } from "../components/common/GameFilterBar";
import { Pagination } from "../components/common/Pagination";
import { useWishlistUrl } from "../features/wishlist/hooks/useWishlistUrl";
import { useWishlistPaginated } from "../features/wishlist/hooks/useWishlistPaginated";

/**
 * WishlistPage Component
 * Displays user's wishlist with pagination and filters.
 * WishlistContext is used for mutations (add/remove), hook for display.
 */

export const WishlistPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // URL state management
  const {
    page,
    query,
    genre,
    platform,
    sortBy,
    order,
    setPage,
    setSearch,
    setGenre,
    setPlatform,
    setSort,
    clearAll,
  } = useWishlistUrl();

  // Fetch paginated data
  const { data, isLoading } = useWishlistPaginated({
    page,
    limit: 20,
    query,
    genre,
    platform,
    sortBy,
    order,
  });

  const games = data?.data || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  // Check if filters are active
  const hasActiveFilters = !!(query || genre || platform);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.emptyContainer}>
        <BsHeart size={48} className={styles.emptyIcon} />
        <h2>{t("wishlist.pleaseLogin")}</h2>
        <p>{t("wishlist.loginRequired")}</p>
        <Link to="/login" className={styles.browseButton}>
          {t("common.login")}
        </Link>
      </div>
    );
  }

  // Differentiated empty states
  const renderEmptyState = () => {
    if (hasActiveFilters) {
      // No results for current filters
      return (
        <div className={styles.emptyStateContainer}>
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
      // Truly empty wishlist
      return (
        <div className={styles.emptyStateContainer}>
          <h2 className="text-gradient">{t("wishlist.emptyWishlist")}</h2>
          <p className={styles.emptyStateText}>
            {t("wishlist.emptyDescription")}
          </p>
          <Link to="/home" className={styles.browseLink}>
            {t("library.browseStore")}
          </Link>
        </div>
      );
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className="text-gradient">{t("wishlist.title")}</h1>
          <span className={styles.count}>
            {pagination.total}{" "}
            {pagination.total === 1 ? t("wishlist.game") : t("wishlist.games")}
          </span>
        </div>

        <div className={styles.actionsArea}>
          <Button
            variant="ghost"
            onClick={() => navigate("/library")}
            size="sm"
          >
            {t("wishlist.myGames")}
          </Button>
          <Button variant="primary" size="sm">
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
            {games.map((game) => (
              <GameCard key={game._id} game={game} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default WishlistPage;

// Exported to App.tsx for routing
