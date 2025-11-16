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

  let currentIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;

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

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboard);

    // Touch support for swipe
    lightbox.addEventListener('touchstart', handleTouchStart, { passive: true });
    lightbox.addEventListener('touchend', handleTouchEnd, { passive: true });
  }

  function openLightbox(index) {
    currentIndex = index;
    updateLightboxImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus on close button for accessibility
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';

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
    const imgAlt = currentPhoto.querySelector('img').getAttribute('alt');

    lightboxImage.src = imgSrc;
    lightboxImage.alt = imgAlt;

    // Update navigation buttons
    lightboxPrev.disabled = currentIndex === 0;
    lightboxNext.disabled = currentIndex === photoItems.length - 1;

    // Add animation
    lightboxImage.style.animation = 'none';
    setTimeout(() => {
      lightboxImage.style.animation = '';
    }, 10);
  }

  function handleKeyboard(e) {
    if (!lightbox.classList.contains('active')) return;

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
