// Lightweight Image Protection Utilities
// Consolidated: single protection layer (was previously triple-loaded)

let protectionInitialized = false;

export const initImageProtection = () => {
  if (protectionInitialized) return; // Prevent duplicate initialization
  protectionInitialized = true;

  // Block right-click on images/videos only (not entire page)
  document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
      e.preventDefault();
      return false;
    }
  }, { capture: true, passive: false });

  // Prevent dragging images
  document.addEventListener('dragstart', function(e) {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
      return false;
    }
  }, { capture: true, passive: false });

  // Block keyboard shortcuts for saving/printing
  document.addEventListener('keydown', function(e) {
    // Ctrl+S (Save)
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.keyCode === 83)) {
      e.preventDefault();
      return false;
    }
    // Ctrl+P (Print)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.keyCode === 80)) {
      e.preventDefault();
      return false;
    }
    // F12, Ctrl+Shift+I/J/C, Ctrl+U (DevTools/View Source)
    if (
      e.keyCode === 123 ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
      ((e.ctrlKey || e.metaKey) && e.keyCode === 85)
    ) {
      e.preventDefault();
      return false;
    }
  }, { capture: true, passive: false });
};

// No-op: kept for backward compatibility with App.jsx import
export const disableBrowserImageFeatures = () => {
  // Functionality merged into initImageProtection
};

export default {
  initImageProtection,
  disableBrowserImageFeatures
};
