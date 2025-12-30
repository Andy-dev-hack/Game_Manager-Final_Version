import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { GameCard } from "../../games/components/GameCard";
import { useGames } from "../../games/hooks/useGames";
import styles from "./SeasonalOffersMarquee.module.css";

export const SeasonalOffersMarquee = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch games strictly on sale
    const { data: seasonalGamesResponse, isLoading } = useGames({
        onSale: true,
        limit: 10,
        sortBy: "discount", // Assuming backend supports this or just defaults
    });

    const seasonalGames = seasonalGamesResponse?.data || [];

    // Carousel Logic
    // Infinite Carousel Logic
    // We triple the items to allow seamless scrolling in both directions
    const items = seasonalGames;
    const extendedItems = [...items, ...items, ...items];
    const totalItems = items.length;

    const [currentIndex, setCurrentIndex] = useState(totalItems); // Start at middle set
    const [isTransitioning, setIsTransitioning] = useState(true);

    // Reset logic when we reach the ends
    const handleTransitionEnd = () => {
        if (currentIndex >= totalItems * 2) {
            setIsTransitioning(false);
            setCurrentIndex(currentIndex - totalItems);
            // Restore transition in next tick is handled by the fact that next render w/ state change re-enables it?
            // No, we need to force reflow or wait. simpler:
            // Just set transition off here. Then allow next interaction to enable it?
            // Better: use a small timeout to re-enable, or just rely on the effect below.
        } else if (currentIndex < totalItems) {
            setIsTransitioning(false);
            setCurrentIndex(currentIndex + totalItems);
        }
    };

    // Re-enable transition after index reset
    useEffect(() => {
        if (!isTransitioning) {
            // Force reflow/wait a tick
            const timer = requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsTransitioning(true);
                });
            });
            return () => cancelAnimationFrame(timer);
        }
    }, [isTransitioning]);

    // if (isLoading || seasonalGames.length === 0) return null; // MOVED DOWN

    // Triple items logic handled above

    const handlePrev = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isTransitioning) return;
        setCurrentIndex((prev) => prev - 1);
    };

    const handleNext = (e: React.MouseEvent) => {
        // If event is provided (manual click), prevent default
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!isTransitioning) return;
        setCurrentIndex((prev) => prev + 1);
    };

    // Auto-rotation
    useEffect(() => {
        if (totalItems === 0) return;
        const interval = setInterval(() => {
            // Auto rotate
            if (isTransitioning) {
                setCurrentIndex((prev) => prev + 1);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [totalItems, isTransitioning]);

    if (isLoading || seasonalGames.length === 0) return null;

    return (
        <div className={styles.marqueeContainer} ref={containerRef}>
            <div className={styles.header}>
                <div className={styles.seasonalTitle}>🎄 {t("home.seasonal_offers")} 🎄</div>
                <button className={styles.viewAllBtn} onClick={() => navigate("/catalog?onSale=true")}>
                    {t("home.view_all")}
                </button>
            </div>

            <div className={styles.trackWrapper}>
                <div
                    className={styles.marqueeTrack}
                    onTransitionEnd={handleTransitionEnd}
                    style={{
                        transform: `translateX(-${currentIndex * (320 + 32)}px)`, // 320px width + 2rem (32px) gap
                        transition: isTransitioning ? "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)" : "none",
                    }}
                >
                    {extendedItems.map((game, index) => (
                        <GameCard key={`${game._id}-${index}`} game={game} className={styles.seasonalCard} />
                    ))}
                </div>
            </div>

            {/* Navigation Buttons */}
            <button className={`${styles.navButton} ${styles.prevButton}`} onClick={handlePrev} aria-label="Previous">
                <FiChevronLeft />
            </button>

            <button className={`${styles.navButton} ${styles.nextButton}`} onClick={handleNext} aria-label="Next">
                <FiChevronRight />
            </button>
        </div>
    );
};
