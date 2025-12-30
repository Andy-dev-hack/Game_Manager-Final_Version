import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useGames } from "../../games/hooks/useGames";
import { GameCard } from "../../games/components/GameCard";
import styles from "./DealSection.module.css";
import { SeasonalOffersMarquee } from "./SeasonalOffersMarquee";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const DealSection = () => {
    const { t } = useTranslation();
    const { data: freeResponse, isLoading: loadingFree } = useGames({
        maxPrice: 0,
        sortBy: "score",
        limit: 16,
    });

    const { data: cheapResponse, isLoading: loadingCheap } = useGames({
        maxPrice: 10,
        sortBy: "score",
        limit: 16,
    });

    const [freeIndex, setFreeIndex] = useState(0);
    const [cheapIndex, setCheapIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const freeGamesAll = freeResponse?.data || [];
    const cheapGamesAll = cheapResponse?.data || [];

    // Calculate visible batches (4 games each, wider layout)
    const pageSize = 4;
    const freeTotalPages = Math.ceil(freeGamesAll.length / pageSize);
    const cheapTotalPages = Math.ceil(cheapGamesAll.length / pageSize);

    const visibleFreeGames = freeGamesAll.slice(freeIndex * pageSize, (freeIndex + 1) * pageSize);
    const visibleCheapGames = cheapGamesAll.slice(cheapIndex * pageSize, (cheapIndex + 1) * pageSize);

    // Synchronized rotation logic (Alternating every 4 seconds)
    useEffect(() => {
        if (freeGamesAll.length <= 4 && cheapGamesAll.length <= 4) return;

        // Start by rotating Free Games immediately
        let shouldRotateFree = true;

        const interval = setInterval(() => {
            // Pause animation if hovering over any card
            if (isPaused) return;

            if (shouldRotateFree) {
                // Rotate Free Games
                if (freeGamesAll.length > 4) {
                    setFreeIndex((prev) => {
                        const nextIndex = prev + 1;
                        return nextIndex < freeTotalPages ? nextIndex : 0;
                    });
                }
            } else {
                // Rotate Cheap Games
                if (cheapGamesAll.length > 4) {
                    setCheapIndex((prev) => {
                        const nextIndex = prev + 1;
                        return nextIndex < cheapTotalPages ? nextIndex : 0;
                    });
                }
            }
            // Toggle for next iteration
            shouldRotateFree = !shouldRotateFree;
        }, 4000);

        return () => clearInterval(interval);
    }, [freeGamesAll.length, cheapGamesAll.length, isPaused]);

    const handlePrevFree = (e: React.MouseEvent) => {
        e.preventDefault();
        setFreeIndex((prev) => (prev > 0 ? prev - 1 : freeTotalPages - 1));
    };

    const handleNextFree = (e: React.MouseEvent) => {
        e.preventDefault();
        setFreeIndex((prev) => (prev < freeTotalPages - 1 ? prev + 1 : 0));
    };

    const handlePrevCheap = (e: React.MouseEvent) => {
        e.preventDefault();
        setCheapIndex((prev) => (prev > 0 ? prev - 1 : cheapTotalPages - 1));
    };

    const handleNextCheap = (e: React.MouseEvent) => {
        e.preventDefault();
        setCheapIndex((prev) => (prev < cheapTotalPages - 1 ? prev + 1 : 0));
    };

    if (loadingFree || loadingCheap) return <div className="text-center py-10">{t("home.loading")}</div>;

    return (
        <>
            <SeasonalOffersMarquee />
            <section className={styles.container}>
                {/* Free Games Column */}
                <motion.div
                    className={`glass-panel ${styles.dealColumn} ${styles.flashColumn}`}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                >
                    <div className={styles.header}>
                        <h2 className={styles.title}>
                            🎁 <span className={styles.flashTitle}>{t("home.free_games")}</span>
                        </h2>
                        <Link to="/catalog?maxPrice=0" className={styles.link} style={{ color: "var(--bg-primary)" }}>
                            {t("home.view_all")}
                        </Link>
                    </div>
                    <div className={styles.grid}>
                        <AnimatePresence mode="wait" initial={false}>
                            {visibleFreeGames.map((game, index) => (
                                <motion.div
                                    key={game._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{
                                        duration: 0.4,
                                        ease: "easeInOut",
                                        delay: index * 0.02,
                                    }}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        overflow: "hidden",
                                    }}
                                    onMouseEnter={() => setIsPaused(true)}
                                    onMouseLeave={() => setIsPaused(false)}
                                >
                                    <GameCard game={game} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {freeGamesAll.length === 0 && <p className="text-muted">{t("home.no_free_games")}</p>}
                    </div>

                    {/* Navigation Buttons */}
                    {freeGamesAll.length > pageSize && (
                        <>
                            <button
                                className={`${styles.navButton} ${styles.prevButton}`}
                                onClick={handlePrevFree}
                                aria-label="Previous Free Games"
                            >
                                <FiChevronLeft />
                            </button>
                            <button
                                className={`${styles.navButton} ${styles.nextButton}`}
                                onClick={handleNextFree}
                                aria-label="Next Free Games"
                            >
                                <FiChevronRight />
                            </button>
                        </>
                    )}
                </motion.div>

                {/* Under $10 Column */}
                <motion.div
                    className={`glass-panel ${styles.dealColumn}`}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    <div className={styles.header}>
                        <h2 className={styles.title}>
                            💎 <span className="text-gradient">{t("home.under_10")}</span>
                        </h2>
                        <Link to="/catalog?maxPrice=10" className={styles.link}>
                            {t("home.view_all")}
                        </Link>
                    </div>

                    <div className={styles.grid}>
                        <AnimatePresence mode="wait" initial={false}>
                            {visibleCheapGames.map((game, index) => (
                                <motion.div
                                    key={game._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{
                                        duration: 0.4,
                                        ease: "easeInOut",
                                        delay: index * 0.02,
                                    }}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        overflow: "hidden",
                                    }}
                                    onMouseEnter={() => setIsPaused(true)}
                                    onMouseLeave={() => setIsPaused(false)}
                                >
                                    <GameCard game={game} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {cheapGamesAll.length === 0 && <p className="text-muted">{t("home.no_cheap_games")}</p>}
                    </div>

                    {/* Navigation Buttons */}
                    {cheapGamesAll.length > pageSize && (
                        <>
                            <button
                                className={`${styles.navButton} ${styles.prevButton}`}
                                onClick={handlePrevCheap}
                                aria-label="Previous Cheap Games"
                            >
                                <FiChevronLeft />
                            </button>
                            <button
                                className={`${styles.navButton} ${styles.nextButton}`}
                                onClick={handleNextCheap}
                                aria-label="Next Cheap Games"
                            >
                                <FiChevronRight />
                            </button>
                        </>
                    )}
                </motion.div>
            </section>
        </>
    );
};
