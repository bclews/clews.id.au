/**
 * Photo Gallery Lightbox
 * Vanilla JavaScript implementation with keyboard and touch support
 */

(function() {
  'use strict';

  const grid = document.getElementById('photoGrid');
  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.querySelector('.lightbox-content');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const liveRegion = document.getElementById('lightboxLive');
  const photoItems = document.querySelectorAll('.photo-item');

  // Focusable elements in lightbox for focus trap
  const focusableElements = [lightboxClose, lightboxPrev, lightboxNext];

  let currentIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;
  let originalBodyOverflow = '';
  let isLightboxOpen = false;

  // Initialize photo gallery
  function init() {
    if (!photoItems.length) return;

    // Add click listeners to photo items
    photoItems.forEach((item, index) => {
      item.addEventListener('click', () => openLightbox(index));
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');

      // Keyboard support for photo items
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });
    });

    // Lightbox controls
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', showPrevious);
    lightboxNext.addEventListener('click', showNext);

    // Click outside image to close
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Touch support for swipe
    lightbox.addEventListener('touchstart', handleTouchStart, { passive: true });
    lightbox.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Keyboard navigation - scoped to lightbox active state
    document.addEventListener('keydown', handleKeyboard);

    // Focus trap
    document.addEventListener('keydown', handleFocusTrap);

    // Browser/Android back button closes the lightbox instead of leaving the page
    window.addEventListener('popstate', () => {
      if (isLightboxOpen) closeLightbox(true);
    });

    // Masonry layout (order-preserving). Run now, on load, and on resize.
    layoutMasonry();
    window.addEventListener('load', layoutMasonry);
    window.addEventListener('resize', debounce(layoutMasonry, 150));
  }

  /*
   * Set each grid item's row span from its rendered height so a CSS grid packs
   * like masonry while preserving DOM (reading) order. The image keeps its
   * aspect ratio via width/height attributes, so heights are known before the
   * pixels finish downloading.
   */
  function layoutMasonry() {
    if (!grid || !photoItems.length) return;

    grid.classList.add('masonry-ready');
    const styles = window.getComputedStyle(grid);
    const rowHeight = parseFloat(styles.gridAutoRows) || 8;
    const rowGap = parseFloat(styles.rowGap) || 0;

    photoItems.forEach((item) => {
      const img = item.querySelector('img');
      const height = img ? img.getBoundingClientRect().height : item.getBoundingClientRect().height;
      if (!height) return;
      const span = Math.ceil((height + rowGap) / (rowHeight + rowGap));
      item.style.gridRowEnd = 'span ' + span;
    });
  }

  function debounce(fn, wait) {
    let timer;
    return function() {
      clearTimeout(timer);
      timer = setTimeout(fn, wait);
    };
  }

  function openLightbox(index) {
    // Capture the page's overflow only on a genuine open, never when already
    // open, or we'd memorise the locked value and fail to restore it on close.
    if (!isLightboxOpen) {
      originalBodyOverflow = document.body.style.overflow;
    }
    currentIndex = index;
    isLightboxOpen = true;

    updateLightboxImage();
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Push a history entry so the back button closes the lightbox
    history.pushState({ lightbox: true }, '');

    // Focus on close button for accessibility
    lightboxClose.focus();
  }

  // fromPopState avoids pushing/popping history twice when triggered by back nav
  function closeLightbox(fromPopState) {
    isLightboxOpen = false;
    lightbox.setAttribute('aria-hidden', 'true');

    // Restore original overflow
    document.body.style.overflow = originalBodyOverflow;

    // Unwind the history entry added on open (unless the pop already did it)
    if (!fromPopState && history.state && history.state.lightbox) {
      history.back();
    }

    // Return focus to the clicked photo
    if (photoItems[currentIndex]) {
      photoItems[currentIndex].focus();
    }
  }

  function showPrevious() {
    if (currentIndex > 0) {
      currentIndex--;
      updateLightboxImage();
    }
  }

  function showNext() {
    if (currentIndex < photoItems.length - 1) {
      currentIndex++;
      updateLightboxImage();
    }
  }

  function preload(index) {
    const item = photoItems[index];
    if (!item) return;
    const src = item.getAttribute('data-src');
    if (src) {
      const img = new Image();
      img.src = src;
    }
  }

  function updateLightboxImage() {
    const currentPhoto = photoItems[currentIndex];
    const imgSrc = currentPhoto.getAttribute('data-src');
    const imgAlt = currentPhoto.getAttribute('data-alt') ||
                   currentPhoto.querySelector('img').getAttribute('alt') ||
                   'Photo';
    const caption = currentPhoto.getAttribute('data-caption') || '';

    // Show loading state until the full-size image is ready
    lightboxContent.classList.add('is-loading');
    lightboxImage.onload = function() {
      lightboxContent.classList.remove('is-loading');
    };
    lightboxImage.onerror = function() {
      lightboxContent.classList.remove('is-loading');
      console.error('Failed to load image:', imgSrc);
      this.alt = 'Failed to load image';
    };

    lightboxImage.src = imgSrc;
    lightboxImage.alt = imgAlt;

    if (lightboxCaption) {
      lightboxCaption.textContent = caption;
    }

    // Preload neighbours so paging feels instant
    preload(currentIndex - 1);
    preload(currentIndex + 1);

    // Move focus off a button that is about to be disabled, or it lands on
    // <body> and the focus trap can no longer keep Tab inside the modal.
    const active = document.activeElement;
    if ((active === lightboxPrev && currentIndex === 0) ||
        (active === lightboxNext && currentIndex === photoItems.length - 1)) {
      lightboxClose.focus();
    }

    // Update navigation buttons
    lightboxPrev.disabled = currentIndex === 0;
    lightboxNext.disabled = currentIndex === photoItems.length - 1;

    // Announce position to screen readers via a live region (changing an
    // aria-label alone does not trigger an announcement).
    if (liveRegion) {
      liveRegion.textContent = `Photo ${currentIndex + 1} of ${photoItems.length}`;
    }
  }

  function handleKeyboard(e) {
    if (!isLightboxOpen) return;

    switch(e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        showPrevious();
        break;
      case 'ArrowRight':
        showNext();
        break;
    }
  }

  function handleFocusTrap(e) {
    if (!isLightboxOpen || e.key !== 'Tab') return;

    const firstFocusable = focusableElements.find(el => !el.disabled);
    const lastFocusable = focusableElements.slice().reverse().find(el => !el.disabled);

    if (!firstFocusable) return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
  }

  function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) < swipeThreshold) return;

    if (diff > 0) {
      // Swipe left - next photo
      showNext();
    } else {
      // Swipe right - previous photo
      showPrevious();
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
