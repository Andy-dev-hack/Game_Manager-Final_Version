/**
 * NavbarSearch.tsx
 * Dropdown search component for the navigation bar.
 * Provides real-time search with keyboard navigation (arrow keys, Enter, Escape).
 * Displays up to 5 results in a dropdown with game thumbnail, title, price, genre,
 * developer/publisher, and release date. Includes a "View All" link to the catalog page.
 * Debounces API calls (300ms) to reduce server load during typing.
 */

import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";
import { gamesService, type Game } from "../../../services/games.service";
import styles from "./NavbarSearch.module.css";
import { useTranslation } from "react-i18next";

/**
 * NavbarSearch Component Props
 */
interface NavbarSearchProps {
  onClose?: () => void; // Optional callback to close the search
  autoFocus?: boolean; // Auto-focus input when mounted
}

/**
 * NavbarSearch Component
 * Renders a search input with dropdown results.
 * Features:
 * - Debounced search (300ms delay)
 * - Keyboard navigation (ArrowUp/Down, Enter, Escape)
 * - Click outside to close
 * - Navigates to catalog page with search query on "View All"
 * - Optional auto-focus and close callback for expandable mode
 *
 * @param {NavbarSearchProps} props - Component props
 * @returns Search input with dropdown overlay
 */

export const NavbarSearch = ({
  onClose,
  autoFocus = false,
}: NavbarSearchProps = {}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when autoFocus prop is true
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          // Call public endpoint
          // Call Unified Search (Eager Sync)
          const { data } = await gamesService.searchUnified(query);

          setResults(data.slice(0, 5));
          setShowDropdown(true);
        } catch (error) {
          console.error("Search error:", error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowDropdown(false);
    if (onClose) {
      onClose(); // Close the expanded search if callback provided
    } else {
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;

    // Arrow Down
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(
        (prev) => (prev < results.length ? prev + 1 : prev) // +1 allows reaching "View All" (index = results.length)
      );
    }
    // Arrow Up
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }
    // Enter
    else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        // Navigate to game
        navigate(`/game/${results[activeIndex]._id}`);
        setShowDropdown(false);
        setQuery("");
      } else if (activeIndex === results.length) {
        // "View All" selected
        navigate(`/catalog?query=${encodeURIComponent(query)}`);
        setShowDropdown(false);
      } else {
        // Default enter behavior (View All)
        navigate(`/catalog?query=${encodeURIComponent(query)}`);
        setShowDropdown(false);
      }
    }
    // Escape
    else if (e.key === "Escape") {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <div className={styles.inputWrapper}>
        <FiSearch className={styles.icon} />
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder={t("search.placeholder") ?? "Search games..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
        />
        {/* Show X button when in expandable mode (onClose) or when there's text */}
        {(onClose || query) && (
          <button className={styles.clearButton} onClick={handleClear}>
            <FiX />
          </button>
        )}
      </div>

      {showDropdown && query.length >= 2 && (
        <div className={styles.dropdown}>
          {loading ? (
            <div className={styles.noResults}>{t("search.searching")}</div>
          ) : results.length > 0 ? (
            <>
              {results.map((game, index) => (
                <Link
                  key={game._id}
                  to={`/game/${game._id}`}
                  className={`${styles.resultItem} ${
                    index === activeIndex ? styles.active : ""
                  }`}
                  onClick={() => {
                    setShowDropdown(false);
                    setQuery("");
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <img
                    src={game.assets?.cover || game.image || "/placeholder.jpg"}
                    alt={game.title}
                    className={styles.resultImage}
                  />
                  <div className={styles.resultInfo}>
                    <div className={styles.resultTitle}>{game.title}</div>
                    <div className={styles.resultMeta}>
                      <span className={styles.resultPrice}>
                        {game.price === 0
                          ? "Free"
                          : `$${game.price?.toFixed(2) || "0.00"}`}
                      </span>
                      <span>•</span>
                      <span>{game.genres?.slice(0, 2).join(", ")}</span>
                      {(game.developer || game.publisher) && (
                        <>
                          <span>•</span>
                          <span className={styles.resultDeveloper}>
                            {game.developer || game.publisher}
                          </span>
                        </>
                      )}
                    </div>
                    {game.releaseDate && (
                      <div className={styles.resultDate}>
                        {new Date(game.releaseDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
              <Link
                to={`/catalog?query=${encodeURIComponent(query)}`}
                className={`${styles.viewAll} ${
                  activeIndex === results.length ? styles.active : ""
                }`}
                onMouseEnter={() => setActiveIndex(results.length)}
                onClick={() => setShowDropdown(false)}
              >
                {t("search.viewAll", { query }) ||
                  `View all results for "${query}"`}
              </Link>
            </>
          ) : (
            <div className={styles.noResults}>
              {t("search.noResults", { query }) ||
                `No results found for "${query}"`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Exported to Navbar component for global search functionality
