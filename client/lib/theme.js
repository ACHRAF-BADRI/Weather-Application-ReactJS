import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'theme';
const THEME_COLORS = { dark: '#020617', light: '#f1f5f9' };

// Runs in <head> before the page paints (see pages/_document.js), so there is no
// flash of the wrong theme. Uses the saved choice, else the system preference.
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');
if(t!=='light'&&t!=='dark')t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';
document.documentElement.classList.add(t);}catch(e){document.documentElement.classList.add('dark');}})();`;

function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
}

export function useTheme() {
  const [theme, setThemeState] = useState(null); // unknown until mounted

  useEffect(() => {
    const current = document.documentElement.classList.contains('light') ? 'light' : 'dark';
    setThemeState(current);
    applyTheme(current);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((previous) => {
      const next = previous === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
