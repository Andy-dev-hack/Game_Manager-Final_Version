/**
 * GameDetails.tsx
 * Detailed game information page with purchase and wishlist functionality.
 * Features:
 * - Game cover, screenshots, and videos
 * - Full game description and metadata
 * - Purchase button with checkout navigation
 * - Wishlist add/remove functionality
 * - Image modal for viewing screenshots
 * - Responsive layout with glassmorphism design
 */

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { clsx } from "clsx";
import { useTranslation } from "react-i18next";
import { BsCartPlus, BsHeart, BsHeartFill } from "react-icons/bs";
import { useGameDetails } from "../features/games/hooks/useGameDetails";
import { useWishlist } from "../features/wishlist/WishlistContext";
import { useCart } from "../features/cart/CartContext";
import { useIsGameOwned } from "../features/collection/hooks/useIsGameOwned";
import { FaCheckCircle } from "react-icons/fa";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ImageModal } from "../components/ui/ImageModal";
import { formatCurrency } from "../utils/format";
import { useAuth } from "../features/auth/AuthContext";
import styles from "./GameDetails.module.css";

/**
 * GameDetails component
 * Displays comprehensive game information with purchase and wishlist options.
 * Fetches game data using useGameDetails hook.
 *
 * @returns {JSX.Element} Game details page
 */

const GameDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { data: game, isLoading, error } = useGameDetails(id);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addItem } = useCart();
  const isOwned = useIsGameOwned(id || "");

  // Modal state for screenshot lightbox
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isWishlisted = isInWishlist(game?._id || "");

  const handleToggleWishlist = async () => {
    if (!game) return;
    if (isWishlisted) {
      await removeFromWishlist(game._id);
    } else {
      await addToWishlist(game);
    }
  };

  if (isLoading)
    return (
      <div className={styles.loadingState}>{t("gameDetails.loading")}</div>
    );
  if (error || !game)
    return (
      <div className={styles.errorState}>{t("gameDetails.gameNotFound")}</div>
    );
  const hasOffer = game.isOffer && game.offerPrice !== undefined;
  const currentPrice = hasOffer ? game.offerPrice : game.price;

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <img
          src={
            game.assets?.cover ||
            "https://placehold.co/1200x600/101010/FFF?text=No+Cover"
          }
          alt={game.title}
          className={styles.heroBackground}
        />
        <div className={styles.heroOverlay} />

        {/* Purchased Indicator - Top Left */}
        {isOwned && (
          <div className={styles.purchasedDetailsBadge}>
            <FaCheckCircle />
            <span>{t("gameDetails.inLibrary")}</span>
          </div>
        )}

        {/* Developer Badge Top-Right */}
        {game.developer && (
          <Link
            to={`/catalog?developer=${encodeURIComponent(game.developer)}`}
            className={styles.developerBadge}
          >
            {game.developer}
          </Link>
        )}

        <div className={styles.heroContent}>
          <h1 className={`${styles.title} text-gradient`}>{game.title}</h1>
          <div className={styles.meta}>
            {(game.platforms?.length ? game.platforms : ["Unknown"]).map(
              (platform, index) => (
                <Link
                  key={index}
                  to={`/catalog?platform=${encodeURIComponent(platform)}`}
                  className={styles.platformTag}
                >
                  {platform}
                </Link>
              )
            )}
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.mainInfo}>
          <Card>
            <h2 className={styles.sectionTitle}>
              {t("gameDetails.aboutGame")}
            </h2>
            <p className={styles.description}>{game.description}</p>
          </Card>

          {/* Screenshot Gallery */}
          {game.assets?.screenshots && game.assets.screenshots.length > 0 && (
            <Card>
              <h2 className={styles.sectionTitle}>
                {t("gameDetails.screenshots")}
              </h2>
              <div className={styles.gallery}>
                {game.assets.screenshots.slice(0, 6).map((screenshot, i) => (
                  <img
                    key={i}
                    src={screenshot}
                    alt={`${game.title} screenshot ${i + 1}`}
                    className={styles.screenshot}
                    onClick={() => {
                      setCurrentImageIndex(i);
                      setModalOpen(true);
                    }}
                  />
                ))}
              </div>
            </Card>
          )}
        </div>

        <aside className={styles.sidebar}>
          {/* Cover Image Card */}
          <Card padding="none">
            <img
              src={
                game.assets?.cover ||
                "https://placehold.co/350x500/101010/FFF?text=No+Cover"
              }
              alt={game.title}
              className={styles.coverImage}
            />
          </Card>

          <Card className={styles.priceCard} padding="lg">
            <div className={styles.priceRow}>
              <div className={styles.priceColumn}>
                {hasOffer && (
                  <span className={styles.originalPrice}>
                    {formatCurrency(game.price, game.currency)}
                  </span>
                )}
                <span className={styles.price}>
                  {currentPrice === 0
                    ? t("common.free")
                    : formatCurrency(currentPrice || 0, game.currency)}
                </span>
              </div>
              {hasOffer && (
                <span className={styles.discountBadge}>
                  {t("gameDetails.offer")}
                </span>
              )}
            </div>

            <div className={styles.actions}>
              <Button
                size="lg"
                disabled={!isAuthenticated}
                title={!isAuthenticated ? "Login to buy" : ""}
                onClick={() => navigate(`/checkout/${game._id}`)}
              >
                <BsCartPlus /> {t("gameDetails.buyNow")}
              </Button>
              <Button
                variant="ghost"
                disabled={!isAuthenticated}
                onClick={() => addItem(game)}
              >
                {t("gameDetails.addToCart")}
              </Button>
              <Button
                variant="ghost"
                disabled={!isAuthenticated}
                onClick={handleToggleWishlist}
              >
                {isWishlisted ? (
                  <BsHeartFill color="var(--accent-primary)" />
                ) : (
                  <BsHeart />
                )}
                {isWishlisted
                  ? t("gameDetails.inWishlist")
                  : t("gameDetails.addToWishlist")}
              </Button>
              {!isAuthenticated && (
                <p className={styles.loginPrompt}>
                  {t("gameDetails.loginToPurchase")}
                </p>
              )}
            </div>
          </Card>

          <Card padding="md">
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>
                {t("gameDetails.genre")}
              </span>
              <div className={styles.genresContainer}>
                {game.genres?.map((g) => (
                  <Link
                    key={g}
                    to={`/catalog?genre=${encodeURIComponent(g)}`}
                    className={styles.genreValue}
                  >
                    {g}
                  </Link>
                ))}
              </div>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>
                {t("gameDetails.developer")}
              </span>
              <Link
                to={`/catalog?developer=${encodeURIComponent(game.developer)}`}
                className={styles.linkValue}
              >
                {game.developer}
              </Link>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>
                {t("gameDetails.publisher")}
              </span>
              <Link
                to={`/catalog?publisher=${encodeURIComponent(game.publisher)}`}
                className={styles.linkValue}
              >
                {game.publisher}
              </Link>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>
                {t("gameDetails.releaseDate")}
              </span>
              <span>
                {game.releaseDate
                  ? new Date(game.releaseDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : t("gameDetails.tba")}
              </span>
            </div>
            {game.metacritic && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>
                  {t("gameDetails.metacritic")}
                </span>
                <span className={styles.metacriticScore}>
                  {game.metacritic}/100
                </span>
              </div>
            )}
            {game.score && (
              <div className={clsx(styles.detailRow, styles.userScore)}>
                <span className={styles.detailLabel}>
                  {t("gameDetails.userScore")}
                </span>
                <span className={styles.userScoreValue}>{game.score}/10</span>
              </div>
            )}
          </Card>
        </aside>
      </div>

      {/* Image Modal */}
      {modalOpen && game?.assets?.screenshots && (
        <ImageModal
          images={game.assets.screenshots}
          currentIndex={currentImageIndex}
          onClose={() => setModalOpen(false)}
          onNavigate={setCurrentImageIndex}
        />
      )}
    </div>
  );
};

export default GameDetails;
