import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiSearch, FiFilter, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { Button } from "../ui/Button";
import styles from "./GameFilterBar.module.css";
import { useFilters } from "../../features/games/hooks/useGames";

interface GameFilterBarProps {
  // Filter States
  searchQuery: string;
  genre: string;
  platform: string;
  sortBy: string;
  order: "asc" | "desc";

  // Handlers
  onSearchChange: (value: string) => void;
  onGenreChange: (value: string) => void;
  onPlatformChange: (value: string) => void;
  onSortChange: (sortBy: string, order: "asc" | "desc") => void;
  onClear: () => void;

  // Configuration
  collapsible?: boolean;
}

export const GameFilterBar = ({
  searchQuery,
  genre,
  platform,
  sortBy,
  order,
  onSearchChange,
  onGenreChange,
  onPlatformChange,
  onSortChange,
  onClear,
  collapsible = false,
}: GameFilterBarProps) => {
  const { t } = useTranslation();
  const { data: filterOptions, isLoading } = useFilters();
  const [isExpanded, setIsExpanded] = useState(!collapsible);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "price_asc") onSortChange("price", "asc");
    else if (value === "price_desc") onSortChange("price", "desc");
    else if (value === "date_desc") onSortChange("releaseDate", "desc");
    else if (value === "title_asc") onSortChange("title", "asc");
    else if (value === "title_desc") onSortChange("title", "desc");
  };

  const getCurrentSortValue = () => {
    if (sortBy === "price") return order === "asc" ? "price_asc" : "price_desc";
    if (sortBy === "releaseDate") return "date_desc";
    if (sortBy === "title") return order === "asc" ? "title_asc" : "title_desc";
    return "date_desc";
  };

  const toggleExpand = () => setIsExpanded(!isExpanded);

  if (collapsible && !isExpanded) {
    return (
      <div className={styles.toggleButtonWrapper}>
        <Button variant="ghost" onClick={toggleExpand} size="sm">
          <FiFilter className={styles.filterIcon} />
          {t("catalog.filter", "Filter")} <FiChevronDown style={{ marginLeft: 6 }} />
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.controlsContainer}>
        {collapsible && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                 <Button variant="ghost" onClick={toggleExpand} size="sm" title="Hide filters">
                    {t("catalog.hideFilters", "Hide")} <FiChevronUp style={{ marginLeft: 6 }} />
                 </Button>
            </div>
        )}

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
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              className={styles.clearButton}
              onClick={() => onSearchChange("")}
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
            onChange={(e) => onGenreChange(e.target.value)}
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
            onChange={(e) => onPlatformChange(e.target.value)}
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
            onClick={onClear}
            title={t("catalog.clear")}
          >
            <FiFilter className={styles.filterIcon} />
            {t("catalog.clear")}
          </Button>
        </div>
      </div>
    </div>
  );
};
