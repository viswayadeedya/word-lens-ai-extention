(() => {
  let popup = null;
  let selectionTimeout = null;

  // ── Create popup element ──────────────────────────────────────────────
  function createPopup() {
    const el = document.createElement('div');
    el.id = 'wordlens-popup';
    el.innerHTML = `
      <div class="wl-header">
        <span class="wl-word"></span>
        <button class="wl-close">✕</button>
      </div>
      <div class="wl-tabs">
        <button class="wl-tab active" data-tab="dict">Dictionary</button>
        <button class="wl-tab" data-tab="ai">AI Explain</button>
      </div>
      <div class="wl-body">
        <div class="wl-panel active" id="wl-dict">
          <div class="wl-loader"><span></span><span></span><span></span></div>
        </div>
        <div class="wl-panel" id="wl-ai">
          <div class="wl-loader"><span></span><span></span><span></span></div>
        </div>
      </div>
      <div class="wl-footer">
        <span class="wl-brand">WordLens</span>
      </div>
    `;
    document.body.appendChild(el);

    el.querySelectorAll('.wl-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        el.querySelectorAll('.wl-tab, .wl-panel').forEach(x => x.classList.remove('active'));
        tab.classList.add('active');
        el.querySelector(`#wl-${tab.dataset.tab}`).classList.add('active');
      });
    });

    el.querySelector('.wl-close').addEventListener('click', hidePopup);
    return el;
  }

  function hidePopup() {
    if (popup) {
      popup.classList.remove('wl-visible');
      setTimeout(() => { if (popup) popup.style.display = 'none'; }, 200);
    }
  }

  function showPopup(x, y, word) {
    if (!popup) popup = createPopup();

    popup.querySelector('.wl-word').textContent = word;

    ['dict', 'ai'].forEach(tab => {
      document.getElementById(`wl-${tab}`).innerHTML = '<div class="wl-loader"><span></span><span></span><span></span></div>';
    });

    popup.querySelectorAll('.wl-tab, .wl-panel').forEach(x => x.classList.remove('active'));
    popup.querySelector('[data-tab="dict"]').classList.add('active');
    popup.querySelector('#wl-dict').classList.add('active');

    popup.style.display = 'block';
    popup.style.left = '0px';
    popup.style.top = '0px';

    requestAnimationFrame(() => {
      const pw = popup.offsetWidth;
      const ph = popup.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      let left = x + scrollX + 10;
      let top = y + scrollY + 20;

      if (left + pw > vw + scrollX - 20) left = x + scrollX - pw - 10;
      if (top + ph > vh + scrollY - 20) top = y + scrollY - ph - 10;

      popup.style.left = `${Math.max(scrollX + 8, left)}px`;
      popup.style.top = `${Math.max(scrollY + 8, top)}px`;
      popup.classList.add('wl-visible');
    });

    fetchDictionary(word);
    fetchAI(word);
  }

  // ── Dictionary API ────────────────────────────────────────────────────
  async function fetchDictionary(word) {
    const panel = document.getElementById('wl-dict');
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      const entry = data[0];
      let html = '';

      entry.meanings.slice(0, 3).forEach(m => {
        html += `<div class="wl-pos">${m.partOfSpeech}</div>`;
        m.definitions.slice(0, 2).forEach((d, i) => {
          html += `<div class="wl-def"><span class="wl-num">${i + 1}.</span> ${d.definition}</div>`;
          if (d.example) html += `<div class="wl-example">"${d.example}"</div>`;
        });
        if (m.synonyms?.length) {
          html += `<div class="wl-synonyms">Also: ${m.synonyms.slice(0, 4).join(', ')}</div>`;
        }
      });

      if (entry.phonetics?.find(p => p.text)) {
        const ph = entry.phonetics.find(p => p.text);
        html = `<div class="wl-phonetic">${ph.text}</div>` + html;
      }

      panel.innerHTML = html || '<div class="wl-empty">No definition found.</div>';
    } catch {
      panel.innerHTML = `<div class="wl-empty">No dictionary entry found for "<em>${word}</em>".</div>`;
    }
  }

  // ── AI via background worker → Groq ───────────────────────────────────
  async function fetchAI(word) {
    const panel = document.getElementById('wl-ai');
    try {
      const { apiKey } = await chrome.storage.sync.get('apiKey');
      if (!apiKey) {
        panel.innerHTML = `<div class="wl-empty">Add your free Groq API key in the extension settings.<br><br><a class="wl-settings-link" href="#">Open Settings</a></div>`;
        panel.querySelector('.wl-settings-link')?.addEventListener('click', (e) => {
          e.preventDefault();
          chrome.runtime.sendMessage({ action: 'openSettings' });
        });
        return;
      }

      const pageContext = document.title || window.location.hostname;

      const response = await chrome.runtime.sendMessage({
        action: 'fetchGroq',
        apiKey,
        word,
        pageContext
      });

      if (!response?.success) throw new Error(response?.error || 'Unknown error');

      const text = response.text;
      panel.innerHTML = `<div class="wl-ai-text">${text.replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>')}</div>`;
    } catch (err) {
      panel.innerHTML = `<div class="wl-empty">Error: ${err.message}</div>`;
    }
  }

  // ── Selection listener ────────────────────────────────────────────────
  document.addEventListener('mouseup', (e) => {
    if (popup && popup.contains(e.target)) return;

    clearTimeout(selectionTimeout);
    selectionTimeout = setTimeout(() => {
      const sel = window.getSelection();
      const text = sel?.toString().trim();

      if (!text || text.length < 2 || text.length > 100) { hidePopup(); return; }

      const wordCount = text.split(/\s+/).length;
      if (wordCount > 10) { hidePopup(); return; }

      showPopup(e.clientX, e.clientY, text);
    }, 300);
  });

  document.addEventListener('mousedown', (e) => {
    if (popup && !popup.contains(e.target)) hidePopup();
  });

  document.addEventListener('scroll', hidePopup, { passive: true });

})();
