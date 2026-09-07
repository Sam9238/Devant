// Settings popover + localStorage + theme application + logo fallback

(function(){
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const closeSettings = document.getElementById('closeSettings');
  const saveSettings = document.getElementById('saveSettings');
  const cancelSettings = document.getElementById('cancelSettings');
  const settingsForm = document.getElementById('settingsForm');

  // Safe-guards in case elements are missing
  function el(id){ return document.getElementById(id); }

  function openSettings(){
    if (!settingsPanel) return;
    settingsPanel.setAttribute('aria-hidden','false');
    settingsBtn.setAttribute('aria-expanded','true');
    const first = el('suggestions');
    if (first) first.focus();
  }
  function closeSettingsPanel(){
    if (!settingsPanel) return;
    settingsPanel.setAttribute('aria-hidden','true');
    settingsBtn.setAttribute('aria-expanded','false');
    if (settingsBtn) settingsBtn.focus();
  }

  if (settingsBtn){
    settingsBtn.addEventListener('click', (e) => {
      if (!settingsPanel) return;
      const hidden = settingsPanel.getAttribute('aria-hidden') === 'true' || !settingsPanel.getAttribute('aria-hidden');
      if (hidden) openSettings(); else closeSettingsPanel();
    });
  }
  if (closeSettings) closeSettings.addEventListener('click', closeSettingsPanel);
  if (cancelSettings) cancelSettings.addEventListener('click', () => {
    loadSettingsIntoForm();
    closeSettingsPanel();
  });

  // Save/apply settings
  if (saveSettings){
    saveSettings.addEventListener('click', () => {
      const settings = {
        suggestions: !!(el('suggestions') && el('suggestions').checked),
        safesearch: (el('safesearch') && el('safesearch').value) || 'moderate',
        language: (el('language') && el('language').value) || 'auto',
        theme: (settingsForm && settingsForm.querySelector('input[name="theme"]:checked')?.value) || 'dark'
      };
      try { localStorage.setItem('devant_settings', JSON.stringify(settings)); } catch(e){}
      applySettings(settings);
      closeSettingsPanel();
    });
  }

  function loadSettings(){
    try {
      const raw = localStorage.getItem('devant_settings');
      if (!raw) {
        const defaults = { suggestions: true, safesearch: 'moderate', language: 'auto', theme: 'dark'};
        localStorage.setItem('devant_settings', JSON.stringify(defaults));
        return defaults;
      }
      return JSON.parse(raw);
    } catch(e) {
      return { suggestions: true, safesearch: 'moderate', language: 'auto', theme: 'dark'};
    }
  }

  function applySettings(s){
    if (!s) return;
    if (s.theme === 'light'){
      document.documentElement.style.setProperty('--bg','#f6f7f9');
      document.documentElement.style.setProperty('--panel','#ffffff');
      document.documentElement.style.setProperty('--text','#111');
      document.documentElement.style.setProperty('--panel-border','rgba(0,0,0,0.06)');
    } else {
      document.documentElement.style.setProperty('--bg','#000');
      document.documentElement.style.setProperty('--panel','#121212');
      document.documentElement.style.setProperty('--text','#fff');
      document.documentElement.style.setProperty('--panel-border','rgba(255,255,255,0.06)');
    }
    // Placeholder: you can implement actual suggestions/safesearch behavior later
  }

  function loadSettingsIntoForm(){
    const s = loadSettings();
    if (el('suggestions')) el('suggestions').checked = !!s.suggestions;
    if (el('safesearch')) el('safesearch').value = s.safesearch || 'moderate';
    if (el('language')) el('language').value = s.language || 'auto';
    if (settingsForm){
      const themeInput = settingsForm.querySelector(`input[name="theme"][value="${(s.theme||'dark')}"]`);
      if (themeInput) themeInput.checked = true;
    }
    applySettings(s);
  }

  // close panel by clicking outside or pressing Esc
  document.addEventListener('click', (e) => {
    if (!settingsPanel || !settingsBtn) return;
    if (settingsPanel.getAttribute('aria-hidden') === 'false' && !settingsPanel.contains(e.target) && !settingsBtn.contains(e.target)) {
      closeSettingsPanel();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSettingsPanel();
  });

  function onSearch(e){
    e.preventDefault();
    const q = el('q')?.value?.trim();
    if(!q) return false;
    // Example behavior: open Google in a new tab. Replace with your own search URL if desired.
    window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
    return false;
  }
  window.onSearch = onSearch;

  // Logo fallback: if logo.png fails to load, show inline SVG
  const logoImg = el('logoImg');
  const logoSvg = el('logoSvg');
  if (logoImg){
    logoImg.addEventListener('error', () => {
      logoImg.style.display = 'none';
      if (logoSvg) logoSvg.style.display = 'block';
    });
    // If already attempted to load and naturalWidth == 0 -> failed
    if (logoImg.complete && logoImg.naturalWidth === 0){
      logoImg.style.display = 'none';
      if (logoSvg) logoSvg.style.display = 'block';
    } else {
      if (logoSvg) logoSvg.style.display = 'none';
    }
  } else {
    if (logoSvg) logoSvg.style.display = 'block';
  }

  // Initialize
  loadSettingsIntoForm();
})();
