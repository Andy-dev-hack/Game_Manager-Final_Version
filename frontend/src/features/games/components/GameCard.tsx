/**
 * GameCard.tsx
 * Displays individual game information in a card format.
 * Shows game cover, title, genre, platform, score, and pricing with offer calculations.
 * Navigates to game details page on click.
 */

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BsCartPlus, BsHeart, BsHeartFill } from "react-icons/bs";
import { Card } from "../../../components/ui/Card";
import type { Game } from "../../../services/games.service";
import { formatCurrency, formatPlatformName } from "../../../utils/format";
import { useCart } from "../../cart/CartContext";
import { useWishlist } from "../../wishlist/WishlistContext";
import { useIsGameOwned } from "../../collection/hooks/useIsGameOwned";
import { FaCheckCircle } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";
import { gamesService } from "../../../services/games.service";
import { LazyImage } from "../../../components/common/LazyImage";
import styles from "./GameCard.module.css";

/**
 * GameCard component props
 */
interface GameCardProps {
  game: Game;
  className?: string;
  style?: React.CSSProperties;
}

export const GameCard = ({ game, className, style }: GameCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const queryClient = useQueryClient();
  const isOwned = useIsGameOwned(game._id);

  /**
   * Navigate to game details page
   */
  const handleCardClick = () => {
    navigate(`/game/${game._id}`);
  };

  /**
   * Navigate to catalog filtered by tag
   */
  const handleTagClick = (
    e: React.MouseEvent,
    key: "genre" | "developer" | "platform",
    value: string
  ) => {
    e.stopPropagation();
    // Encode value to handle spaces/special chars
    const encodedValue = encodeURIComponent(value);
    navigate(`/catalog?${key}=${encodedValue}`);
  };

  /**
   * Prefetch game details on hover
   * Improves perceived performance by loading data before click
   */
  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: ["game", game._id],
      queryFn: () => gamesService.getGameById(game._id),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  // Calculate offer pricing
  // const hasOffer = game.isOffer && game.offerPrice !== undefined;
  // const currentPrice = hasOffer ? game.offerPrice : game.price;

  return (
    <Card
      className={`${styles.gameCard} ${className || ""}`}
      style={style}
      padding="none"
      hoverable
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
    >
      {/* Game cover image */}
      <div className={styles.coverImageWrapper}>
        <LazyImage
          src={
            game.assets?.cover ||
            game.image ||
            "https://placehold.co/600x400/101010/FFF?text=No+Cover"
          }
          alt={game.title}
          imageClassName={styles.coverImage}
        />
        <button
          className={styles.addToCart}
          onClick={(e) => {
            e.stopPropagation();
            addItem(game);
          }}
          title="Add to cart"
        >
          <BsCartPlus />
        </button>
        <button
          className={`${styles.wishlistBtn} ${
            isInWishlist(game._id) ? styles.active : ""
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (isInWishlist(game._id)) {
              removeFromWishlist(game._id);
            } else {
              addToWishlist(game);
            }
          }}
          title={
            isInWishlist(game._id) ? "Remove from wishlist" : "Add to wishlist"
          }
        >
          {isInWishlist(game._id) ? <BsHeartFill /> : <BsHeart />}
        </button>
        {isOwned && (
          <div className={styles.purchasedBadge} title="En biblioteca">
            <FaCheckCircle />
          </div>
        )}
      </div>

      {/* Game information */}
      <div className={styles.content}>
        {/* Header: Title and Score */}
        <div className={styles.header}>
          <h3 className={styles.title} title={game.title}>
            {game.title}
          </h3>
          {game.score && (
            <span className={styles.scoreBadge}>⭐ {game.score}</span>
          )}
        </div>

        {/* Meta Info: Genre */}
        <div className={styles.metaContainer}>
          {game.genres?.map((g) => (
            <span
              key={g}
              className={styles.genreBadge}
              onClick={(e) => handleTagClick(e, "genre", g)}
            >
              {g}
            </span>
          ))}
        </div>

        {/* Platform Badges */}
        <div className={styles.platformContainer}>
          {(game.platforms?.length ? game.platforms : ["Unknown"]).map(
            (platform, index) => (
              <span
                key={index}
                className={styles.platformBadge}
                onClick={(e) => handleTagClick(e, "platform", platform)}
              >
                {formatPlatformName(platform)}
              </span>
            )
          )}
        </div>

        {/* Footer with pricing */}
        <div className={styles.footer}>
          <div className={styles.developerContainer}>
            {game.developer && (
              <span
                className={styles.developerBadge}
                onClick={(e) => handleTagClick(e, "developer", game.developer)}
              >
                {game.developer}
              </span>
            )}
          </div>

          <div className={styles.priceContainer}>
            {/* Discount percentage badge */}
            {(game.originalPrice || 0) > (game.price || 0) && (
              <span className={styles.discount}>
                -
                {Math.round(
                  (((game.originalPrice || 0) - game.price) /
                    (game.originalPrice || 1)) *
                    100
                )}
                %
              </span>
            )}
            {/* Original price (strikethrough) */}
            {(game.originalPrice || 0) > (game.price || 0) && (
              <span className={styles.oldPrice}>
                {formatCurrency(game.originalPrice || 0, game.currency)}
              </span>
            )}
            {/* Current price */}
            <span className={styles.price}>
              {game.price === 0
                ? t("catalog.free")
                : formatCurrency(game.price || 0, game.currency)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Exported to Home and other pages for game grid display
