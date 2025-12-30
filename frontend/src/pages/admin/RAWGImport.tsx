import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useImportFromRAWG } from "../../hooks/useAdmin";
import { FaSearch, FaDownload } from "react-icons/fa";
import type { RAWGGame } from "../../types/rawg.types";
import { handleApiError } from "../../utils/error.util";
import styles from "./RAWGImport.module.css";

const RAWGImport = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<RAWGGame[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const importMutation = useImportFromRAWG();

  const handleSearch = async () => {
    if (searchQuery.trim().length < 3) {
      alert(t("admin.search_placeholder")); // Using placeholder as validation message too for now
      return;
    }

    setIsSearching(true);
    try {
      // Simulated RAWG search (replace with actual API call when backend is ready)
      // const results = await adminService.searchRAWG(searchQuery);

      // For now, show placeholder message
      setSearchResults([]);
      alert("Function not implemented yet.");
    } catch (error) {
      handleApiError(error, "Failed to search RAWG");
    } finally {
      setIsSearching(false);
    }
  };

  const handleImport = async (rawgId: number, title: string) => {
    if (window.confirm(`${t("admin.import_btn")} "${title}"?`)) {
      try {
        await importMutation.mutateAsync({ rawgId });
        alert("Success");
      } catch (error) {
        handleApiError(error, "Failed to import game");
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{t("admin.import_title")}</h1>
        <p className={styles.subtitle}>{t("admin.import_subtitle")}</p>
      </div>

      {/* Search Section */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder={t("admin.search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className={styles.searchInput}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className={styles.searchBtn}
          >
            <FaSearch />{" "}
            {isSearching ? t("admin.searching") : t("admin.btn_search")}
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className={styles.infoBox}>
        <h3>{t("admin.how_it_works")}</h3>
        <ol>
          <li>{t("admin.step_1")}</li>
          <li>{t("admin.step_2")}</li>
          <li>
            {t("admin.step_3")}
            <ul>
              <li>{t("admin.details_list")}</li>
            </ul>
          </li>
        </ol>
      </div>

      {/* Results */}
      {searchResults.length > 0 && (
        <div className={styles.results}>
          <h2>
            {t("admin.results")} ({searchResults.length})
          </h2>
          <div className={styles.grid}>
            {searchResults.map((game) => (
              <div key={game.id} className={styles.card}>
                <div
                  className={styles.cardImage}
                  style={
                    {
                      "--bg-image": `url(${
                        game.background_image ||
                        "https://placehold.co/300x200/1a1a1a/666"
                      })`,
                    } as React.CSSProperties
                  }
                />
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{game.name}</h3>
                  <p className={styles.cardMeta}>
                    {game.released && `${t("admin.release")}: ${game.released}`}
                  </p>
                  {game.rating && (
                    <div className={styles.rating}>⭐ {game.rating}/5</div>
                  )}
                </div>
                <div className={styles.cardActions}>
                  <button
                    onClick={() => handleImport(game.id, game.name)}
                    disabled={importMutation.isPending}
                    className={styles.importBtn}
                  >
                    <FaDownload /> {t("admin.import_btn")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isSearching && searchResults.length === 0 && searchQuery && (
        <div className={styles.emptyState}>
          <p>
            {t("admin.no_results")} "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
};

export default RAWGImport;
