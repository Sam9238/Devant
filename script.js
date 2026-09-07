// --- UI helpers for hero + search suggestions ---
(function(){
  // sample suggestions - replace with real suggestions or API later
  const SAMPLE = [
    'Devant docs',
    'Devant GitHub',
    'Devant support',
    'Devant API',
    'Devant tutorials',
    'Devant features'
  ];

  const q = document.getElementById('q');
  const list = document.getElementById('suggestionsList');

  function renderSuggestions(items){
    if (!list) return;
    list.innerHTML = '';
    if (!items || items.length === 0){ list.hidden = true; return; }
    items.forEach((it, i) => {
      const li = document.createElement('li');
      li.textContent = it;
      li.setAttribute('role','option');
      li.tabIndex = 0;
      li.addEventListener('click', () => { q.value = it; list.hidden = true; q.focus(); });
      li.addEventListener('keydown', (e) => { if (e.key==='Enter') { q.value = it; list.hidden = true; q.form.requestSubmit(); }});
      list.appendChild(li);
    });
    list.hidden = false;
  }

  if (q){
    q.addEventListener('input', (e) => {
      const v = (e.target.value || '').trim().toLowerCase();
      if (!v){ renderSuggestions([]); return; }
      // filter SAMPLE for now; replace with API call later
      const matches = SAMPLE.filter(s => s.toLowerCase().includes(v)).slice(0,6);
      renderSuggestions(matches);
    });

    // hide suggestions on blur (small delay to allow click)
    q.addEventListener('blur', () => setTimeout(()=>{ if (list) list.hidden = true; }, 150));
  }

  // Example CTA handlers
  document.getElementById('getStartedBtn')?.addEventListener('click', (e) => { e.preventDefault(); window.open('https://github.com/Sam9238/Devant', '_blank'); });
  document.getElementById('docsBtn')?.addEventListener('click', (e) => { e.preventDefault(); window.open('https://github.com/Sam9238/Devant#README', '_blank'); });

})();
