(() => {
    "use strict";
    const LS_THEME_KEY = "theme";
    const THEMES = {
        LIGHT: "light",
        DARK: "dark",
        AUTO: "auto",
    };

    const getThemeState = () => {
        const lsState = localStorage.getItem(LS_THEME_KEY);
        if (lsState) return lsState;

        const body = document.body;
        const config = body.getAttribute("data-theme");

        let state;
        switch (config) {
            case THEMES.DARK:
                state = THEMES.DARK;
                break;
            case THEMES.LIGHT:
                state = THEMES.LIGHT;
                break;
            case THEMES.AUTO:
            default:
                state = window.matchMedia("(prefers-color-scheme: dark)")
                    .matches
                    ? THEMES.DARK
                    : THEMES.LIGHT;
                break;
        }
        return state;
    };

    const initTheme = (state) => {
        if (state === THEMES.DARK) {
            document.documentElement.classList.add(THEMES.DARK);
            document.documentElement.classList.remove(THEMES.LIGHT);
        } else if (state === THEMES.LIGHT) {
            document.documentElement.classList.remove(THEMES.DARK);
            document.documentElement.classList.add(THEMES.LIGHT);
        }
    };

    const toggleTheme = () => {
        const state = getThemeState();
        if (state === THEMES.DARK) {
            localStorage.setItem(LS_THEME_KEY, THEMES.LIGHT);
            initTheme(THEMES.LIGHT);
        } else if (state === THEMES.LIGHT) {
            localStorage.setItem(LS_THEME_KEY, THEMES.DARK);
            initTheme(THEMES.DARK);
        }
    };

    window.addEventListener("DOMContentLoaded", () => {
        // Theme switch
        const lamp = document.getElementById("mode");
        if (lamp) {
            lamp.addEventListener("click", () => toggleTheme());
        }

        // Blur the content when the menu is open
        const cbox = document.getElementById("menu-trigger");
        if (cbox) {
            cbox.addEventListener("change", function () {
                const area = document.querySelector(".wrapper");
                if (area) {
                    if (this.checked) {
                        area.classList.add("blurry");
                    } else {
                        area.classList.remove("blurry");
                    }
                }
            });
        }
    });
})();
