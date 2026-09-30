export const FALLBACK_IMAGE = '/assets/images/hero_luxury_showcase_1790499579518.jpg';
export const WATCH_FALLBACK = '/assets/images/product_chronograph_watch_1790499593612.jpg';
export const HEADPHONES_FALLBACK = '/assets/images/product_anc_headphones_1790499604746.jpg';
export const PERFUME_FALLBACK = '/assets/images/product_royal_oud_perfume_1790499617705.jpg';
export const BAG_FALLBACK = '/assets/images/product_leather_bag_1790499629986.jpg';

/**
 * Universal image sanitizer:
 * Converts any stale `/src/assets/images/...` paths into `/assets/images/...`
 * which are guaranteed to exist statically on Netlify, Vercel, and dev.
 */
export const sanitizeImagePath = (path?: string | null, fallback = FALLBACK_IMAGE): string => {
  if (!path || typeof path !== 'string' || path.trim() === '') {
    return fallback;
  }

  const clean = path.trim();

  // If it's a data URL, blob URL, or external http(s) URL, keep it
  if (
    clean.startsWith('data:') ||
    clean.startsWith('blob:') ||
    clean.startsWith('http://') ||
    clean.startsWith('https://')
  ) {
    return clean;
  }

  // Convert old /src/assets/images/ paths
  if (clean.startsWith('/src/assets/images/')) {
    return clean.replace('/src/assets/images/', '/assets/images/');
  }

  if (clean.startsWith('src/assets/images/')) {
    return '/' + clean.replace('src/assets/images/', 'assets/images/');
  }

  if (clean.startsWith('assets/images/')) {
    return '/' + clean;
  }

  return clean;
};

/**
 * Safe image onError handler:
 * Prevents images from disappearing (style.display = 'none').
 * Gracefully swaps to a beautiful fallback luxury asset.
 */
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback = FALLBACK_IMAGE
) => {
  const target = e.currentTarget;
  // Prevent infinite loops if fallback itself fails
  target.onerror = null;
  target.src = fallback;
};
