import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { clsx } from "clsx";
import { useGameDetails } from "../features/games/hooks/useGameDetails";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { formatCurrency } from "../utils/format";
import { useCheckout } from "../features/checkout/hooks/useCheckout";
import { useCart } from "../features/cart/CartContext";
import styles from "./CheckoutPage.module.css";

const CheckoutPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: game, isLoading } = useGameDetails(id);
  const { items: cartItems, clear: clearCart } = useCart();
  const { mutate: purchase, isPending } = useCheckout();
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const itemsToCheckout = useMemo(() => {
    if (id && game) {
      const hasOffer = game.isOffer && game.offerPrice !== undefined;
      return [
        {
          _id: game._id,
          title: game.title,
          price: hasOffer ? game.offerPrice ?? game.price : game.price,
          currency: game.currency,
          cover: game.assets?.cover,
        },
      ];
    }
    return cartItems;
  }, [id, game, cartItems]);

  const totalAmount = itemsToCheckout.reduce(
    (acc, item) => acc + (item.price || 0),
    0
  );

  if (isLoading && id) {
    return <div className={styles.loadingState}>{t("checkout.loading")}</div>;
  }

  if (!id && cartItems.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2 className="text-gradient">{t("cart.emptyCart")}</h2>
        <Button onClick={() => navigate("/")}>{t("cart.browseGames")}</Button>
      </div>
    );
  }

  if (id && !game) {
    return (
      <div className={styles.errorState}>{t("checkout.gameNotFound")}</div>
    );
  }

  const handlePurchase = () => {
    const ids = itemsToCheckout.map((item) => item._id);
    purchase(ids, {
      onSuccess: () => {
        if (!id) clearCart();
        // Invalidate queries to refetch data
        queryClient.invalidateQueries({ queryKey: ["library"] });
        queryClient.invalidateQueries({ queryKey: ["orders"] }); // Also refresh orders
        setShowSuccessModal(true);
      },
      onError: (error) => {
        console.error("Purchase failed:", error);
        alert(t("checkout.purchaseFailed"));
      },
    });
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate("/library");
  };

  return (
    <div className={styles.container}>
      <h1 className={clsx("text-gradient", styles.pageTitle)}>
        {t("checkout.title")}
      </h1>

      <Card>
        <div className={styles.summary}>
          <h3>{t("checkout.orderSummary")}</h3>
          <div className={styles.productList}>
            {itemsToCheckout.map((item) => (
              <div key={item._id} className={styles.productRow}>
                <div className={styles.productInfo}>
                  <img
                    src={item.cover || "https://placehold.co/100x60/101010/FFF"}
                    alt={item.title}
                    className={styles.productImage}
                  />
                  <span>{item.title}</span>
                </div>
                <span>
                  {item.price === 0
                    ? t("common.free")
                    : formatCurrency(item.price || 0, item.currency)}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.totalRow}>
            <span>{t("cart.total")}</span>
            <span className={styles.totalPrice}>
              {totalAmount === 0
                ? t("common.free")
                : formatCurrency(
                    totalAmount,
                    itemsToCheckout[0]?.currency || "USD"
                  )}
            </span>
          </div>
        </div>

        <h3 className={styles.sectionTitle}>{t("checkout.paymentMethod")}</h3>
        <div className={styles.paymentMethods}>
          <div
            className={clsx(
              styles.method,
              selectedMethod === "card" && styles.selected
            )}
            onClick={() => setSelectedMethod("card")}
          >
            {t("checkout.creditCard")}
          </div>
          <div
            className={clsx(
              styles.method,
              selectedMethod === "paypal" && styles.selected
            )}
            onClick={() => setSelectedMethod("paypal")}
          >
            {t("checkout.paypal")}
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            disabled={isPending}
          >
            {t("checkout.cancel")}
          </Button>
          <Button
            className={styles.confirmButton}
            onClick={handlePurchase}
            isLoading={isPending}
          >
            {t("checkout.confirmPurchase")}
          </Button>
        </div>
      </Card>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.successIcon}>✔</div>
            <h2>{t("checkout.purchaseSuccess")}</h2>
            <p>
              {itemsToCheckout.length === 1 ? (
                <>
                  <strong>{itemsToCheckout[0].title}</strong>{" "}
                  {t("checkout.addedToLibrary")}
                </>
              ) : (
                <>
                  <strong>{itemsToCheckout.length}</strong>{" "}
                  {t("checkout.gamesAddedToLibrary")}
                </>
              )}
            </p>
            <Button onClick={handleCloseModal}>
              {t("checkout.goToLibrary")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
