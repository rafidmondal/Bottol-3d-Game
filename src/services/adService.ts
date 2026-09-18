export const AD_DIRECT_LINK =
  'https://www.profitableratecpmnetwork.com/d2rja4vv?key=66617ce7733a2d3946999c4787be2a37';

/**
 * Triggers the direct sponsor ad link in a new tab/window
 * reliably across standard browsers and iframe wrappers.
 */
export function triggerDirectAd(): void {
  try {
    // 1. Open Ad in new tab
    const opened = window.open(AD_DIRECT_LINK, '_blank', 'noopener,noreferrer');
    if (!opened) {
      const anchor = document.createElement('a');
      anchor.href = AD_DIRECT_LINK;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      setTimeout(() => {
        if (anchor.parentNode) {
          anchor.parentNode.removeChild(anchor);
        }
      }, 200);
    }

    // 2. Clipboard action (as requested in user example)
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText('hallo ami apnar asees').catch(() => {});
    }
  } catch (err) {
    console.warn('Direct ad trigger failed:', err);
  }
}
