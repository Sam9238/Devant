// Final site script: settings panel, localStorage, theme application
(function(){
  console.log('[Devant] script running');

  function el(id){ return document.getElementById(id); }
  const settingsBtn = el('settingsBtn');
  const settingsPanel = el('settingsPanel');
  const closeSettings = el('closeSettings');
  const saveSettings = el('saveSettings');
  const cancelSettings = el('cancelSettings');
  const settingsForm = el('settingsForm');

  function openSettings(){
    if (!settingsPanel) return;
    settingsPanel.setAttribute('aria-hidden','false');
    if (settingsBtn) settingsBtn.setAttribute('aria-expanded','true');
    const first = el('suggestions'); if (first) first.focus();
  }
  function closeSettingsPanel(){
    if (!settingsPanel) return;
    settingsPanel.setAttribute('aria-hidden','true');
    if (settingsBtn) settingsBtn.setAttribute('aria-expanded','false');
    if (settingsBtn) settingsBtn.focus();
  }

  if (settingsBtn){
    settingsBtn.addEventListener('click', (e)=>{
      if (!settingsPanel) return;
      const hidden = settingsPanel.getAttribute('aria-hidden') === 'true' || !settingsPanel.getAttribute('aria-hidden');
      if (hidden) openSettings(); else closeSettingsPanel();
    });
  } else { console.warn('[Devant] settingsBtn not found'); }

  if (closeSettings) closeSettings.addEventListener('click', closeSettingsPanel);
  if (cancelSettings) cancelSettings.addEventListener('click', ()=>{ loadSettingsIntoForm(); closeSettingsPanel(); });

  if (saveSettings){
    saveSettings.addEventListener('click', ()=>{
      const settings = {
        suggestions: !!(el('suggestions') && el('suggestions').checked),
        safesearch: (el('safesearch') && el('safesearch').value) || 'moderate',
        language: (el('language') && el('language').value) || 'auto',
        theme: (settingsForm && settingsForm.querySelector('input[name="theme"]:checked')?.value) || 'dark'
      };
      try { localStorage.setItem('devant_settings', JSON.stringify(settings)); } catch(e){ console.error(e); }
      applySettings(settings);
      closeSettingsPanel();
    });
  }

  function loadSettings(){
    try {
      const raw = localStorage.getItem('devant_settings');
      if (!raw){ const defaults = { suggestions: true, safesearch: 'moderate', language: 'auto', theme: 'dark'}; localStorage.setItem('devant_settings', JSON.stringify(defaults)); return defaults; }
      return JSON.parse(raw);
    } catch(e){ return { suggestions: true, safesearch: 'moderate', language: 'auto', theme: 'dark'}; }
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
  }

  function loadSettingsIntoForm(){
    const s = loadSettings();
    if (el('suggestions')) el('suggestions').checked = !!s.suggestions;
    if (el('safesearch')) el('safesearch').value = s.safesearch || 'moderate';
    if (el('language')) el('language').value = s.language || 'auto';
    if (settingsForm){ const themeInput = settingsForm.querySelector(`input[name="theme"][value="${(s.theme||'dark')}"]`); if (themeInput) themeInput.checked = true; }
    applySettings(s);
  }

  document.addEventListener('click', (e)=>{
    if (!settingsPanel || !settingsBtn) return;
    if (settingsPanel.getAttribute('aria-hidden') === 'false' && !settingsPanel.contains(e.target) && !settingsBtn.contains(e.target)) closeSettingsPanel();
  });
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeSettingsPanel(); });

  function onSearch(e){ e.preventDefault(); const q = (el('q') && el('q').value && el('q').value.trim()); if (!q) return false; window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank'); return false; }
  window.onSearch = onSearch;

  // Initialize
  loadSettingsIntoForm();

})();

