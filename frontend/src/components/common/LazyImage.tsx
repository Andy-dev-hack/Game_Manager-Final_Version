/**
 * @file LazyImage.tsx
 * @description Reusable image component that implements lazy loading with a skeleton loader.
 * Improves performance by deferring off-screen image loading and providing visual feedback during load.
 * @module Components/Common/LazyImage
 */

import { useState, type ImgHTMLAttributes } from "react";
import styles from "./LazyImage.module.css";
import { clsx } from "clsx";

/**
 * LazyImage component props
 * Extends standard HTML Image attributes but enforces 'src' and 'alt'.
 */
interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string; // Wrapper class name
  imageClassName?: string; // Specific image class name
}

/**
 * LazyImage Component
 *
 * Renders an image with a skeleton loader placeholder until the image is fully loaded.
 * Uses native `loading="lazy"` for browser-level optimization.
 *
 * @param {LazyImageProps} props - Component props
 * @returns {JSX.Element} Image with loading state handling
 */
export const LazyImage = ({
  src,
  alt,
  className,
  imageClassName,
  ...props
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true); // Stop loading state even on error
  };

  return (
    <div className={clsx(styles.wrapper, className)}>
      {/* Skeleton / Loading State */}
      {!isLoaded && <div className={styles.skeleton} aria-hidden="true" />}

      {/* Actual Image */}
      <img
        src={hasError ? "https://placehold.co/600x400?text=Error" : src}
        alt={alt}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        className={clsx(styles.image, imageClassName, {
          [styles.visible]: isLoaded,
        })}
        {...props}
      />
    </div>
  );
};
