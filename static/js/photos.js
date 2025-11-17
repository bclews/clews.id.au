/**
 * Photo Gallery Lightbox
 * Vanilla JavaScript implementation with keyboard and touch support
 */

(function() {
  'use strict';

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
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
  }

  function openLightbox(index) {
    currentIndex = index;
    isLightboxOpen = true;

    // Store original overflow
    originalBodyOverflow = document.body.style.overflow;

    updateLightboxImage();
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus on close button for accessibility
    lightboxClose.focus();
  }

  function closeLightbox() {
    isLightboxOpen = false;
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');

    // Restore original overflow
    document.body.style.overflow = originalBodyOverflow;

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

  function updateLightboxImage() {
    const currentPhoto = photoItems[currentIndex];
    const imgSrc = currentPhoto.getAttribute('data-src');
    const imgAlt = currentPhoto.getAttribute('data-alt') ||
                   currentPhoto.querySelector('img').getAttribute('alt') ||
                   'Photo';

    lightboxImage.src = imgSrc;
    lightboxImage.alt = imgAlt;

    // Error handling for image load failures
    lightboxImage.onerror = function() {
      console.error('Failed to load image:', imgSrc);
      this.alt = 'Failed to load image';
    };

    // Update navigation buttons
    lightboxPrev.disabled = currentIndex === 0;
    lightboxNext.disabled = currentIndex === photoItems.length - 1;

    // Update ARIA label with current position
    lightbox.setAttribute('aria-label', `Photo ${currentIndex + 1} of ${photoItems.length}`);
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
