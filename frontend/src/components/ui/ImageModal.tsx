import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "./ImageModal.module.css";

interface ImageModalProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const ImageModal = ({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: ImageModalProps) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Navigate with arrow keys
  useEffect(() => {
    const handleArrowKeys = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === "ArrowRight" && currentIndex < images.length - 1) {
        onNavigate(currentIndex + 1);
      }
    };
    window.addEventListener("keydown", handleArrowKeys);
    return () => window.removeEventListener("keydown", handleArrowKeys);
  }, [currentIndex, images.length, onNavigate]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          <FaTimes />
        </button>

        {/* Navigation Buttons */}
        {currentIndex > 0 && (
          <button
            className={`${styles.navBtn} ${styles.prevBtn}`}
            onClick={handlePrevious}
            aria-label="Previous image"
          >
            <FaChevronLeft />
          </button>
        )}

        {currentIndex < images.length - 1 && (
          <button
            className={`${styles.navBtn} ${styles.nextBtn}`}
            onClick={handleNext}
            aria-label="Next image"
          >
            <FaChevronRight />
          </button>
        )}

        {/* Image */}
        <img
          src={images[currentIndex]}
          alt={`Screenshot ${currentIndex + 1}`}
          className={styles.image}
        />

        {/* Counter */}
        <div className={styles.counter}>
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>,
    document.body
  );
};
