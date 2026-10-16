export function getStoredTheme() {
  try {
    const stored = window.localStorage.getItem('vridhi-theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
}

export function persistTheme(theme) {
  try {
    window.localStorage.setItem('vridhi-theme', theme);
  } catch {
    // Keep the in-memory theme working when storage is unavailable.
  }
}
