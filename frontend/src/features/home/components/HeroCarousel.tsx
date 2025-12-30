/**
 * HeroCarousel.tsx
 * Dynamic Home Page Banner featuring a diagonal split layout.
 * Displays pairs of games that rotate automatically every 5 seconds.
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGames } from "../../games/hooks/useGames";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import styles from "./HeroCarousel.module.css";

export const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch latest 6 games
  const { data, isLoading } = useGames({ limit: 6 });

  // Safe access to data
  const games = data?.data || [];

  // Auto-rotation logic
  useEffect(() => {
    if (games.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % games.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [games.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + games.length) % games.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % games.length);
  };

  // If loading or no games found
  if (isLoading || games.length === 0) {
    return null;
  }

  return (
    <div className={styles.carouselContainer}>
      {/* GM Logo Badge - Simplified specifically for this layout */}
      <div className={styles.logoBadge}>
        <div className={styles.logoText}>
          <span className={styles.logoG}>G</span>
          <span className={styles.logoM}>M</span>
        </div>
      </div>

      {/* Slides */}
      {games.map((game, index) => (
        <div
          key={game._id}
          className={`${styles.slideWrapper} ${
            index === currentIndex ? styles.active : ""
          }`}
          aria-hidden={index !== currentIndex}
        >
          <Link to={`/game/${game._id}`} className={styles.slideContent}>
            {/* Background: Blurred Cover for atmosphere */}
            <div
              className={styles.blurBackground}
              style={
                {
                  "--bg-image": `url(${
                    game.assets?.cover || "/placeholder.jpg"
                  })`,
                } as React.CSSProperties
              }
            />

            {/* Foreground: The actual Cover (Contained) to show full art */}
            <div className={styles.mainImageWrapper}>
              <img
                src={game.assets?.cover || "/placeholder.jpg"}
                alt={game.title}
                className={styles.mainImage}
              />
            </div>

            {/* Info Overlay */}
            <div className={styles.gameInfo}>
              <h3 className={styles.gameTitle}>{game.title}</h3>
              <span className={styles.gameGenre}>
                {game.genres?.slice(0, 2).join(", ")}
              </span>
            </div>
          </Link>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        className={`${styles.navButton} ${styles.prevButton}`}
        onClick={handlePrev}
        aria-label="Previous slide"
      >
        <FiChevronLeft />
      </button>

      <button
        className={`${styles.navButton} ${styles.nextButton}`}
        onClick={handleNext}
        aria-label="Next slide"
      >
        <FiChevronRight />
      </button>

      {/* Indicators / Dots (Optional, adding for better UX with 6 items) */}
      <div className={styles.indicators}>
        {games.map((_, idx) => (
          <button
            key={idx}
            className={`${styles.indicator} ${
              idx === currentIndex ? styles.activeIndicator : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
          />
        ))}
      </div>
    </div>
  );
};
