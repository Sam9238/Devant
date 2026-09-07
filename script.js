// Devant site script: settings, theme, suggestions, logo fallback
(function () {
  console.log('[Devant] script loaded');

  const el = id => document.getElementById(id);
  const settingsBtn = el('settingsBtn');
  const settingsPanel = el('settingsPanel');
  const closeSettings = el('closeSettings');
  const saveSettings = el('saveSettings');
  const cancelSettings = el('cancelSettings');
  const settingsForm = el('settingsForm');

  // Theme setter: updates CSS vars and forces immediate body color/bg
  function setTheme(theme) {
    if (theme === 'light') {
      document.documentElement.style.setProperty('--bg', '#ffffff');
      document.documentElement.style.setProperty('--panel', '#f6f7f9');
      document.documentElement.style.setProperty('--text', '#111111');
      document.documentElement.style.setProperty('--panel-border', 'rgba(0,0,0,0.06)');
    } else {
      document.documentElement.style.setProperty('--bg', '#000000');
      document.documentElement.style.setProperty('--panel', '#121212');
      document.documentElement.style.setProperty('--text', '#ffffff');
      document.documentElement.style.setProperty('--panel-border', 'rgba(255,255,255,0.06)');
    }
    // Force immediate repaint for body
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    const text = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
    if (bg) document.body.style.background = bg;
    if (text) document.body.style.color = text;
  }

  // Storage helpers
  function loadSettings() {
    try {
      const raw = localStorage.getItem('devant_settings');
      if (!raw) {
        const defaults = { suggestions: true, safesearch: 'moderate', language: 'auto', theme: 'dark' };
        localStorage.setItem('devant_settings', JSON.stringify(defaults));
        return defaults;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[Devant] loadSettings error', e);
      return { suggestions: true, safesearch: 'moderate', language: 'auto', theme: 'dark' };
    }
  }
  function saveSettingsObj(obj) {
    try {
      localStorage.setItem('devant_settings', JSON.stringify(obj));
    } catch (e) {
      console.warn('[Devant] saveSettings error', e);
    }
  }

  function loadSettingsIntoForm() {
    const s = loadSettings();
    if (el('suggestions')) el('suggestions').checked = !!s.suggestions;
    if (el('safesearch')) el('safesearch').value = s.safesearch || 'moderate';
    if (el('language')) el('language').value = s.language || 'auto';
    if (settingsForm) {
      const themeInput = settingsForm.querySelector(`input[name="theme"][value="${(s.theme || 'dark')}"]`);
      if (themeInput) themeInput.checked = true;
    }
    setTheme(s.theme || 'dark');
  }

  // Panel open/close
  function openSettings() {
    if (!settingsPanel) return;
    settingsPanel.setAttribute('aria-hidden', 'false');
    if (settingsBtn) settingsBtn.setAttribute('aria-expanded', 'true');
    const first = el('suggestions'); if (first) first.focus();
  }
  function closeSettingsPanel() {
    if (!settingsPanel) return;
    settingsPanel.setAttribute('aria-hidden', 'true');
    if (settingsBtn) settingsBtn.setAttribute('aria-expanded', 'false');
    if (settingsBtn) settingsBtn.focus();
  }

  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      if (!settingsPanel) return;
      const hidden = settingsPanel.getAttribute('aria-hidden') === 'true' || !settingsPanel.getAttribute('aria-hidden');
      if (hidden) openSettings(); else closeSettingsPanel();
    });
  } else { console.warn('[Devant] settingsBtn missing'); }

  if (closeSettings) closeSettings.addEventListener('click', closeSettingsPanel);
  if (cancelSettings) cancelSettings.addEventListener('click', () => { loadSettingsIntoForm(); closeSettingsPanel(); });

  if (saveSettings) {
    saveSettings.addEventListener('click', () => {
      const settings = {
        suggestions: !!(el('suggestions') && el('suggestions').checked),
        safesearch: (el('safesearch') && el('safesearch').value) || 'moderate',
        language: (el('language') && el('language').value) || 'auto',
        theme: (settingsForm && settingsForm.querySelector('input[name="theme"]:checked')?.value) || 'dark'
      };
      saveSettingsObj(settings);
      setTheme(settings.theme);
      closeSettingsPanel();
    });
  } else { console.warn('[Devant] saveSettings missing'); }

  // Theme radio immediate wiring
  (function wireThemeRadios() {
    const radios = document.querySelectorAll('input[name="theme"]');
    radios.forEach(r => r.addEventListener('change', (e) => {
      const t = e.target.value;
      setTheme(t);
      try {
        const stored = loadSettings();
        stored.theme = t;
        saveSettingsObj(stored);
      } catch (err) { console.warn(err); }
    }));
  })();

  // Search handler
  function onSearch(e) {
    e.preventDefault();
    const q = el('q')?.value?.trim();
    if (!q) return false;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
    return false;
  }
  window.onSearch = onSearch;

  // Simple suggestions module
  (function suggestionsModule() {
    const SAMPLE = ['Devant docs','Devant GitHub','Devant support','Devant API','Devant tutorials','Devant features'];
    const q = el('q'); const list = el('suggestionsList');
    function render(items) {
      if (!list) return;
      list.innerHTML = '';
      if (!items || items.length === 0) { list.hidden = true; return; }
      items.forEach(it => {
        const li = document.createElement('li');
        li.textContent = it;
        li.setAttribute('role','option');
        li.tabIndex = 0;
        li.addEventListener('click', ()=>{ if (q) { q.value = it; list.hidden = true; q.focus(); }});
        li.addEventListener('keydown', (e)=>{ if (e.key === 'Enter') { if (q) { q.value = it; list.hidden = true; q.form.requestSubmit(); } }});
        list.appendChild(li);
      });
      list.hidden = false;
    }
    if (q) {
      q.addEventListener('input', (e)=> {
        const v = (e.target.value || '').trim().toLowerCase();
        if (!v) { render([]); return; }
        const matches = SAMPLE.filter(s => s.toLowerCase().includes(v)).slice(0,6);
        render(matches);
      });
      q.addEventListener('blur', ()=> setTimeout(()=> { if (list) list.hidden = true; }, 150));
    }
  })();

  // Logo fallback: show inline SVG if logo.png failed to load
  (function logoFallback() {
    const logo = el('logoImg');
    const fallback = el('logoFallback');
    if (!logo) { if (fallback) fallback.style.display = 'block'; return; }
    logo.addEventListener('error', ()=> { logo.style.display = 'none'; if (fallback) fallback.style.display = 'block'; console.warn('[Devant] logo.png failed to load, using fallback'); });
    if (logo.complete && logo.naturalWidth === 0) { logo.style.display = 'none'; if (fallback) fallback.style.display = 'block'; }
    else { if (fallback) fallback.style.display = 'none'; }
  })();

  // Close settings on outside click / Esc
  document.addEventListener('click', (e)=> {
    if (!settingsPanel || !settingsBtn) return;
    if (settingsPanel.getAttribute('aria-hidden') === 'false' && !settingsPanel.contains(e.target) && !settingsBtn.contains(e.target)) closeSettingsPanel();
  });
  document.addEventListener('keydown', (e)=> { if (e.key === 'Escape') closeSettingsPanel(); });

  // Initialize
  loadSettingsIntoForm();
  console.log('[Devant] initialization complete');
})();
