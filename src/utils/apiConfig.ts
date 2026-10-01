/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Shared API URL resolver for cross-device synchronization.
 * Guarantees that whether running on Cloud Run, Netlify, mobile, or external laptop,
 * all devices communicate with the unified live store backend.
 */
export const getApiBaseUrl = (): string => {
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;

  // If on Netlify, Vercel, GitHub Pages, or external static hosting
  if (
    hostname.includes('netlify.app') ||
    hostname.includes('vercel.app') ||
    hostname.includes('github.io') ||
    hostname.includes('pages.dev')
  ) {
    return (
      (import.meta as any).env?.VITE_API_URL ||
      'https://ais-pre-gw4icw5ehzck6qtjp5qbuj-961553608473.asia-southeast1.run.app'
    );
  }

  return '';
};

export const apiUrl = (endpoint: string): string => {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${cleanEndpoint}`;
};
