/**
 * CatalogControls.tsx
 * Filter and sort controls for the catalog page.
 * Provides search input, genre/platform filters, and sorting options.
 * All state is managed via URL parameters (useCatalogUrl hook) for shareable links.
 * Includes a "Clear All" button to reset all filters.
 */

import { useTranslation } from "react-i18next";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";
import { useCatalogUrl } from "../hooks/useCatalogUrl";
import { useFilters } from "../hooks/useGames";
import { Button } from "../../../components/ui/Button";
import styles from "./CatalogControls.module.css";
import { useState, useEffect } from "react";

/**
 * CatalogControls Component
 * Renders filter controls for the catalog page.
 * Features:
 * - Search input (synced with URL, debounced)
 * - Genre dropdown filter
 * - Platform dropdown filter
 * - Sort by dropdown (price, release date, title)
 * - Sort order toggle (asc/desc)
 * - Clear all filters button
 *
 * @returns Filter controls UI
 */

export const CatalogControls = () => {
  const { t } = useTranslation();
  const {
    query,
    genre,
    platform,
    maxPrice,
    onSale,
    sortBy,
    order,
    setSearch,
    setFilter,
    setMaxPrice,
    setOnSale,
    removeFilter,
    setSort,
    clearAll,
  } = useCatalogUrl();

  const { data: filterOptions, isLoading } = useFilters();
  const [localSearch, setLocalSearch] = useState(query);

  const hasActiveFilters =
    genre || platform || maxPrice !== undefined || onSale || query;

  // Sync local search input with URL query param if it changes externally
  useEffect(() => {
    setLocalSearch(query);
  }, [query]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
    setSearch(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "price_asc") setSort("price", "asc");
    else if (value === "price_desc") setSort("price", "desc");
    else if (value === "date_desc") setSort("releaseDate", "desc");
    else if (value === "title_asc") setSort("title", "asc");
    else if (value === "title_desc") setSort("title", "desc");
  };

  // Helper to get current sort string
  const getCurrentSortValue = () => {
    if (sortBy === "price") return order === "asc" ? "price_asc" : "price_desc";
    if (sortBy === "releaseDate") return "date_desc";
    if (sortBy === "title") return order === "asc" ? "title_asc" : "title_desc";
    return "date_desc"; // Default to newest
  };

  return (
    <div className={styles.controlsContainer}>
      {/* Search Bar */}
      <div className={styles.searchSection}>
        <div className={styles.searchInputWrapper}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder={
              t("search.placeholder") ?? "Search by title, publisher..."
            }
            value={localSearch}
            onChange={handleSearchChange}
          />
          {/* Clear button - always visible when there's text */}
          {localSearch && (
            <button
              className={styles.clearButton}
              onClick={() => {
                setLocalSearch("");
                setSearch("");
              }}
              title="Clear search"
            >
              <FiX />
            </button>
          )}
        </div>
      </div>

      {/* Filters & Sort */}
      <div className={styles.filtersRow}>
        {/* Genre Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>{t("catalog.genre")}</label>
          <select
            className={styles.select}
            value={genre}
            onChange={(e) => setFilter("genre", e.target.value)}
            disabled={isLoading}
          >
            <option value="">{t("catalog.all_genres")}</option>
            {filterOptions?.genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Platform Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>{t("catalog.platform")}</label>
          <select
            className={styles.select}
            value={platform}
            onChange={(e) => setFilter("platform", e.target.value)}
            disabled={isLoading}
          >
            <option value="">{t("catalog.all_platforms")}</option>
            {filterOptions?.platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Price Filter */}
        <div className={styles.filterGroup}>
          <label htmlFor="filter-price" className={styles.label}>
            {t("catalog.price")}
          </label>
          <select
            id="filter-price"
            className={styles.select}
            value={maxPrice === undefined ? "" : maxPrice.toString()}
            onChange={(e) =>
              setMaxPrice(e.target.value ? Number(e.target.value) : undefined)
            }
          >
            <option value="">{t("catalog.all_prices")}</option>
            <option value="0">{t("catalog.free")}</option>
            <option value="10">{t("catalog.under10")}</option>
            <option value="30">{t("catalog.under30")}</option>
            <option value="60">{t("catalog.under60")}</option>
          </select>
        </div>

        {/* Offers Toggle */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>&nbsp;</label>
          <button
            className={`${styles.toggleButton} ${onSale ? styles.active : ""}`}
            onClick={() => setOnSale(!onSale)}
            title={t("home.seasonal_offers")}
          >
            {onSale ? "🎄 " : "❄️ "} {t("home.seasonal_offers")}
          </button>
        </div>

        {/* Sort */}
        <div className={styles.filterGroup}>
          <label className={styles.label}>{t("catalog.orderBy")}</label>
          <select
            className={styles.select}
            value={getCurrentSortValue()}
            onChange={handleSortChange}
          >
            <option value="date_desc">{t("catalog.newest")}</option>
            <option value="price_asc">{t("catalog.priceLowHigh")}</option>
            <option value="price_desc">{t("catalog.priceHighLow")}</option>
            <option value="title_asc">{t("catalog.nameAZ")}</option>
            <option value="title_desc">{t("catalog.nameZA")}</option>
          </select>
        </div>

        {/* Reset Button */}
        <div>
          <Button
            variant="secondary"
            className={styles.resetButton}
            onClick={clearAll}
            title={t("catalog.clear")}
          >
            <FiFilter className={styles.filterIcon} />
            {t("catalog.clear")}
          </Button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className={styles.activeFilters}>
          {genre && (
            <div className={styles.chip}>
              <span className={styles.chipLabel}>{t("catalog.genre")}:</span>
              {genre}
              <button
                onClick={() => removeFilter("genre")}
                className={styles.chipClose}
              >
                <FiX />
              </button>
            </div>
          )}

          {platform && (
            <div className={styles.chip}>
              <span className={styles.chipLabel}>{t("catalog.platform")}:</span>
              {platform}
              <button
                onClick={() => removeFilter("platform")}
                className={styles.chipClose}
              >
                <FiX />
              </button>
            </div>
          )}

          {maxPrice !== undefined && (
            <div className={styles.chip}>
              <span className={styles.chipLabel}>{t("catalog.price")}:</span>
              {maxPrice === 0 ? t("catalog.free") : `< ${maxPrice}€`}
              <button
                onClick={() => removeFilter("maxPrice")}
                className={styles.chipClose}
              >
                <FiX />
              </button>
            </div>
          )}

          {onSale && (
            <div className={`${styles.chip} ${styles.active}`}>
              <span className={styles.chipLabel}>
                {t("home.seasonal_offers")}
              </span>
              <button
                onClick={() => removeFilter("onSale")}
                className={styles.chipClose}
                style={{ color: "white" }}
              >
                <FiX />
              </button>
            </div>
          )}

          {query && (
            <div className={styles.chip}>
              <span className={styles.chipLabel}>{t("common.search")}:</span>"
              {query}"
              <button
                onClick={() => {
                  setLocalSearch("");
                  setSearch("");
                }}
                className={styles.chipClose}
              >
                <FiX />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Exported to CatalogPage for filter and sort functionality
