// Replace/insert this in your script.js

function setTheme(theme) {
  if (theme === 'light') {
    document.documentElement.style.setProperty('--bg', '#ffffff');        // page background
    document.documentElement.style.setProperty('--panel', '#f6f7f9');     // panel/background elements
    document.documentElement.style.setProperty('--text', '#000000');      // primary text becomes black
    document.documentElement.style.setProperty('--panel-border', 'rgba(0,0,0,0.08)');
  } else { // dark
    document.documentElement.style.setProperty('--bg', '#000000');
    document.documentElement.style.setProperty('--panel', '#121212');
    document.documentElement.style.setProperty('--text', '#ffffff');
    document.documentElement.style.setProperty('--panel-border', 'rgba(255,255,255,0.06)');
  }
}

// Keep applySettings but delegate to setTheme (so existing code that calls applySettings continues to work)
function applySettings(s) {
  if (!s) return;
  setTheme(s.theme || 'dark');

  // future: handle suggestions / safesearch etc.
}

// Make the theme radios apply immediately when toggled (so user sees the color switch right away)
document.querySelectorAll('input[name="theme"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    const t = e.target.value;
    setTheme(t);
    // optionally update localStorage immediately so the change persists without pressing Save:
    try {
      const raw = localStorage.getItem('devant_settings');
      const settings = raw ? JSON.parse(raw) : {};
      settings.theme = t;
      localStorage.setItem('devant_settings', JSON.stringify(settings));
    } catch (err) { /* ignore storage errors */ }
  });
});
