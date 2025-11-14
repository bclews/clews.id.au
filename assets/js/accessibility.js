/**
 * Accessibility enhancements for clews.id.au
 * Mobile menu improvements - scroll lock and backdrop behavior
 */

(function() {
    'use strict';

    // Mobile menu scroll lock and backdrop blur
    const menuTrigger = document.getElementById('menu-trigger');
    if (menuTrigger) {
        menuTrigger.addEventListener('change', function() {
            const wrapper = document.querySelector('.wrapper');
            const body = document.body;

            if (this.checked) {
                // Menu is opening
                if (wrapper) {
                    wrapper.classList.add('blurry');
                }
                body.classList.add('menu-open');
            } else {
                // Menu is closing
                if (wrapper) {
                    wrapper.classList.remove('blurry');
                }
                body.classList.remove('menu-open');
            }
        });
    }

    // Update theme toggle aria-label dynamically
    const modeToggle = document.getElementById('mode');
    if (modeToggle) {
        // Listen for theme changes
        const updateAriaLabel = () => {
            const isDark = document.documentElement.classList.contains('dark');
            modeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        };

        // Update initially
        updateAriaLabel();

        // Update on click
        modeToggle.addEventListener('click', () => {
            // Wait for theme to change
            setTimeout(updateAriaLabel, 100);
        });

        // Also listen for system theme changes
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeQuery.addEventListener('change', updateAriaLabel);
    }
})();
