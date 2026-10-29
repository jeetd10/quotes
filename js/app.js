// Anthology of Love - Main Application Logic
(function () {
  'use strict';

  // --- State & LocalStorage Keys ---
  const STORAGE_KEYS = {
    FAVORITES: 'anthology_favorites_v1',
    NOTES: 'anthology_notes_v1',
    THEME: 'anthology_theme_v1'
  };

  let favorites = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[]'));
  let notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '{}');
  let currentTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';

  let currentCategory = 'all';
  let searchQuery = '';
  let favoritesOnly = false;
  let notesOnly = false;
  let activeSpotlightId = null;

  // Web Audio Ambient Synthesizer
  let audioCtx = null;
  let ambientInterval = null;
  let isAmbientPlaying = false;

  // --- DOM Elements ---
  const passagesGrid = document.getElementById('passages-grid');
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const categoryTabs = document.getElementById('category-tabs');
  const filterFavoritesBtn = document.getElementById('filter-favorites-btn');
  const filterNotesBtn = document.getElementById('filter-notes-btn');
  const resultsCount = document.getElementById('results-count');
  const favCounter = document.getElementById('fav-counter');
  const notesCounter = document.getElementById('notes-counter');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const ambientAudioBtn = document.getElementById('ambient-audio-btn');
  const randomPassageBtn = document.getElementById('random-passage-btn');
  const exportNotesBtn = document.getElementById('export-notes-btn');
  const toastContainer = document.getElementById('toast-container');

  // Spotlight Modal DOM
  const spotlightModal = document.getElementById('spotlight-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const spotlightCategory = document.getElementById('spotlight-category');
  const spotlightWc = document.getElementById('spotlight-wc');
  const spotlightTitle = document.getElementById('spotlight-title');
  const spotlightText = document.getElementById('spotlight-text');
  const spotlightFavBtn = document.getElementById('spotlight-fav-btn');
  const spotlightFavLabel = document.getElementById('spotlight-fav-label');
  const spotlightCopyBtn = document.getElementById('spotlight-copy-btn');
  const spotlightExportImgBtn = document.getElementById('spotlight-export-img-btn');
  const spotlightNextBtn = document.getElementById('spotlight-next-btn');
  const spotlightNoteInput = document.getElementById('spotlight-note-input');
  const spotlightNoteStatus = document.getElementById('spotlight-note-status');

  // --- Initial Theme Setup ---
  function applyTheme(theme) {
    currentTheme = theme;
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeIcon.textContent = '☼';
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeIcon.textContent = '☾';
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }

  // --- Helper Functions ---
  function getWordCount(text) {
    return text.trim().split(/\s+/).length;
  }

  function getCategorySlug(category) {
    return category.toLowerCase().replace(/\s+/g, '-');
  }

  function showToast(message, icon = '✓') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3000);
  }

  function saveFavorites() {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(Array.from(favorites)));
    updateCounters();
  }

  function saveNotes() {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    updateCounters();
  }

  function updateCounters() {
    favCounter.textContent = favorites.size;
    const writtenNotesCount = Object.keys(notes).filter(k => notes[k] && notes[k].trim().length > 0).length;
    notesCounter.textContent = writtenNotesCount;
  }

  // --- Web Audio Ambient Synthesizer (Gentle Wind-Chime / Harp Tones) ---
  function toggleAmbientSound() {
    if (isAmbientPlaying) {
      stopAmbientSound();
    } else {
      startAmbientSound();
    }
  }

  function startAmbientSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        showToast('Web Audio not supported on this browser', '✕');
        return;
      }
      if (!audioCtx) {
        audioCtx = new AudioContext();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      isAmbientPlaying = true;
      ambientAudioBtn.classList.add('primary');
      ambientAudioBtn.querySelector('.label').textContent = 'Mute Chimes';
      showToast('Ambient chime soundscapes playing softly', '♫');

      // Pentatonic scale frequencies in Hz (peaceful, tranquil frequencies)
      const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

      function playGentleChime() {
        if (!isAmbientPlaying || !audioCtx) return;
        const freq = scale[Math.floor(Math.random() * scale.length)];
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.045, audioCtx.currentTime + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 3.8);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 4.0);
      }

      playGentleChime();
      ambientInterval = setInterval(playGentleChime, 3200);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  function stopAmbientSound() {
    isAmbientPlaying = false;
    if (ambientInterval) {
      clearInterval(ambientInterval);
      ambientInterval = null;
    }
    ambientAudioBtn.classList.remove('primary');
    ambientAudioBtn.querySelector('.label').textContent = 'Ambient Sound';
    showToast('Ambient sound paused', '⏸');
  }

  // --- Filtering & Rendering ---
  function getFilteredPassages() {
    return LOVE_PASSAGES.filter(passage => {
      // Category filter
      if (currentCategory !== 'all' && passage.category !== currentCategory) {
        return false;
      }

      // Favorites filter
      if (favoritesOnly && !favorites.has(passage.id)) {
        return false;
      }

      // Notes filter
      if (notesOnly) {
        const passageNote = notes[passage.id];
        if (!passageNote || passageNote.trim().length === 0) return false;
      }

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchTitle = passage.title.toLowerCase().includes(query);
        const matchText = passage.text.toLowerCase().includes(query);
        const matchCategory = passage.category.toLowerCase().includes(query);
        if (!matchTitle && !matchText && !matchCategory) return false;
      }

      return true;
    });
  }

  function renderPassages() {
    const list = getFilteredPassages();
    passagesGrid.innerHTML = '';

    resultsCount.innerHTML = `Showing <strong>${list.length}</strong> of <strong>${LOVE_PASSAGES.length}</strong> passages`;

    if (list.length === 0) {
      passagesGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📜</div>
          <h3>No Passages Found</h3>
          <p>We couldn't find any passages matching your current search or active filters. Try broadening your keywords or resetting filters.</p>
          <button class="btn-pill" id="reset-filters-btn">Reset All Filters</button>
        </div>
      `;
      document.getElementById('reset-filters-btn')?.addEventListener('click', resetAllFilters);
      return;
    }

    const fragment = document.createDocumentFragment();

    list.forEach(passage => {
      const isFav = favorites.has(passage.id);
      const userNote = notes[passage.id] || '';
      const hasNote = userNote.trim().length > 0;
      const wordCount = getWordCount(passage.text);
      const catSlug = getCategorySlug(passage.category);

      const card = document.createElement('article');
      card.className = 'quote-card';
      card.id = `passage-card-${passage.id}`;
      card.innerHTML = `
        <div>
          <div class="card-header">
            <div class="card-meta">
              <span class="category-tag ${catSlug}">${passage.category}</span>
              <span class="word-count-tag">${wordCount} words</span>
            </div>
            <button 
              class="card-favorite-btn ${isFav ? 'favorited' : ''}" 
              data-id="${passage.id}" 
              title="${isFav ? 'Remove from favorites' : 'Save to favorites'}"
              aria-label="Favorite"
            >${isFav ? '♥' : '♡'}</button>
          </div>

          <h3 class="card-title">${passage.title}</h3>
          <p class="card-quote">“${passage.text}”</p>
          <div class="card-attribution">Original Literary Passage • Unattributed</div>
        </div>

        <div class="card-actions">
          <div class="card-action-group">
            <button class="card-action-btn toggle-note-btn ${hasNote ? 'has-note' : ''}" data-id="${passage.id}" title="Add or view personal reflection">
              <span>✎</span> <span>${hasNote ? 'My Note' : 'Add Note'}</span>
            </button>
            <button class="card-action-btn copy-btn" data-id="${passage.id}" title="Copy passage text to clipboard">
              <span>📋</span> <span>Copy</span>
            </button>
            <button class="card-action-btn export-card-btn" data-id="${passage.id}" title="Save as aesthetic card image">
              <span>🖼</span> <span>Save Image</span>
            </button>
          </div>
          <span style="font-size: 0.72rem; color: var(--text-faint);">#${passage.id}</span>
        </div>

        <!-- Personal Note Drawer -->
        <div class="note-drawer" id="note-drawer-${passage.id}">
          <div class="note-header">
            <span>Your Personal Reflection:</span>
            <span class="note-status" id="note-status-${passage.id}">${hasNote ? 'Saved' : 'Not yet saved'}</span>
          </div>
          <textarea 
            class="note-textarea" 
            data-id="${passage.id}" 
            placeholder="Write a private note, memory, or thoughts attached to this passage..."
          >${userNote}</textarea>
          <div class="note-footer">
            <span style="font-size: 0.7rem; color: var(--text-faint);">Saved to your local browser storage</span>
            ${hasNote ? `<button class="note-delete-btn" data-id="${passage.id}">Clear note</button>` : ''}
          </div>
        </div>
      `;

      fragment.appendChild(card);
    });

    passagesGrid.appendChild(fragment);
    attachCardListeners();
  }

  function attachCardListeners() {
    // Favorite toggle
    document.querySelectorAll('.card-favorite-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        toggleFavorite(id);
      });
    });

    // Copy passage
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        copyPassage(id);
      });
    });

    // Toggle note drawer
    document.querySelectorAll('.toggle-note-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        const drawer = document.getElementById(`note-drawer-${id}`);
        if (drawer) {
          drawer.classList.toggle('open');
          if (drawer.classList.contains('open')) {
            const textarea = drawer.querySelector('textarea');
            textarea.focus();
          }
        }
      });
    });

    // Note auto-save on typing (debounced)
    document.querySelectorAll('.note-textarea').forEach(textarea => {
      let timeout = null;
      textarea.addEventListener('input', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'), 10);
        const status = document.getElementById(`note-status-${id}`);
        if (status) status.textContent = 'Saving...';

        clearTimeout(timeout);
        timeout = setTimeout(() => {
          notes[id] = e.target.value;
          saveNotes();
          if (status) status.textContent = 'Saved';
          
          // Update button styling
          const noteBtn = document.querySelector(`.toggle-note-btn[data-id="${id}"]`);
          if (noteBtn) {
            if (e.target.value.trim().length > 0) {
              noteBtn.classList.add('has-note');
              noteBtn.querySelector('span:last-child').textContent = 'My Note';
            } else {
              noteBtn.classList.remove('has-note');
              noteBtn.querySelector('span:last-child').textContent = 'Add Note';
            }
          }
        }, 500);
      });
    });

    // Note clear / delete
    document.querySelectorAll('.note-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'), 10);
        delete notes[id];
        saveNotes();
        const drawer = document.getElementById(`note-drawer-${id}`);
        if (drawer) {
          drawer.querySelector('textarea').value = '';
          drawer.classList.remove('open');
        }
        showToast('Reflection cleared', '🗑');
        renderPassages();
      });
    });

    // Export card as image
    document.querySelectorAll('.export-card-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        generateQuoteImage(id);
      });
    });
  }

  function toggleFavorite(id) {
    if (favorites.has(id)) {
      favorites.delete(id);
      showToast('Removed from favorites', '♡');
    } else {
      favorites.add(id);
      showToast('Saved to your favorites', '♥');
    }
    saveFavorites();

    // If we are currently in favorites-only view, re-render immediately
    if (favoritesOnly) {
      renderPassages();
    } else {
      // Just toggle button state without full re-render for smooth experience
      const btn = document.querySelector(`.card-favorite-btn[data-id="${id}"]`);
      if (btn) {
        btn.classList.toggle('favorited', favorites.has(id));
        btn.textContent = favorites.has(id) ? '♥' : '♡';
        btn.title = favorites.has(id) ? 'Remove from favorites' : 'Save to favorites';
      }
    }

    // Sync modal if active
    if (activeSpotlightId === id) {
      updateSpotlightFavButton(id);
    }
  }

  function copyPassage(id) {
    const p = LOVE_PASSAGES.find(item => item.id === id);
    if (!p) return;

    const formattedText = `"${p.title}"\n\n"${p.text}"\n\n— Original Literary Passage (${p.category})`;

    navigator.clipboard.writeText(formattedText).then(() => {
      showToast('Passage copied to clipboard', '📋');
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = formattedText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Passage copied to clipboard', '📋');
    });
  }

  // --- Offline Canvas Image Generator ---
  function generateQuoteImage(id) {
    const passage = LOVE_PASSAGES.find(p => p.id === id);
    if (!passage) return;

    showToast('Rendering high-res quote card...', '🎨');

    const canvas = document.getElementById('quote-export-canvas');
    const ctx = canvas.getContext('2d');

    const width = 1200;
    const height = 900;
    canvas.width = width;
    canvas.height = height;

    // Background styling
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const bg = isDark ? '#161418' : '#FAF6F0';
    const cardBg = isDark ? '#1E1B22' : '#FFFFFF';
    const textPrimary = isDark ? '#ECE5DC' : '#221E1B';
    const textMuted = isDark ? '#9B9186' : '#736B63';
    const accent = isDark ? '#DF897E' : '#8C3838';

    // Canvas background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Card frame
    const margin = 70;
    ctx.fillStyle = cardBg;
    ctx.strokeStyle = isDark ? '#2D2833' : '#E6DCCF';
    ctx.lineWidth = 2;
    roundRect(ctx, margin, margin, width - margin * 2, height - margin * 2, 24, true, true);

    // Inner delicate double border
    ctx.strokeStyle = isDark ? '#3E3646' : '#EFE5D7';
    ctx.lineWidth = 1;
    roundRect(ctx, margin + 14, margin + 14, width - (margin + 14) * 2, height - (margin + 14) * 2, 16, false, true);

    // Top Category Badge
    ctx.fillStyle = accent;
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`• ${passage.category.toUpperCase()} •`, width / 2, margin + 70);

    // Title
    ctx.fillStyle = textPrimary;
    ctx.font = 'bold italic 36px "Playfair Display", Georgia, serif';
    ctx.fillText(`"${passage.title}"`, width / 2, margin + 130);

    // Large decorative quotation mark
    ctx.fillStyle = isDark ? 'rgba(223, 137, 126, 0.15)' : 'rgba(140, 56, 56, 0.12)';
    ctx.font = 'bold 130px "Playfair Display", Georgia, serif';
    ctx.fillText('“', width / 2, margin + 240);

    // Passage text (word wrapped)
    ctx.fillStyle = textPrimary;
    ctx.font = '400 27px "Cormorant Garamond", Georgia, serif';
    const maxTextWidth = 920;
    const lineHeight = 44;
    wrapText(ctx, passage.text, width / 2, margin + 280, maxTextWidth, lineHeight);

    // Footer Attribution
    ctx.fillStyle = textMuted;
    ctx.font = 'italic 19px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('— The Anthology of Devotion & Longing • Original Literary Prose —', width / 2, height - margin - 50);

    // Trigger download
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `love-passage-${passage.id}-${getCategorySlug(passage.title)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('Quote image downloaded!', '🖼');
    }, 200);
  }

  function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
  }

  // --- Random Spotlight Modal ---
  function openSpotlight(id) {
    const passage = LOVE_PASSAGES.find(p => p.id === id);
    if (!passage) return;

    activeSpotlightId = passage.id;
    spotlightCategory.textContent = passage.category;
    spotlightCategory.className = `category-tag ${getCategorySlug(passage.category)}`;
    spotlightWc.textContent = `${getWordCount(passage.text)} words`;
    spotlightTitle.textContent = passage.title;
    spotlightText.textContent = `“${passage.text}”`;

    updateSpotlightFavButton(passage.id);

    // Spotlight note
    const currentNote = notes[passage.id] || '';
    spotlightNoteInput.value = currentNote;
    spotlightNoteStatus.textContent = currentNote.trim().length > 0 ? 'Saved' : 'Auto-saved on change';

    spotlightModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSpotlight() {
    spotlightModal.classList.remove('active');
    document.body.style.overflow = '';
    activeSpotlightId = null;
  }

  function updateSpotlightFavButton(id) {
    const isFav = favorites.has(id);
    spotlightFavBtn.classList.toggle('has-note', isFav);
    spotlightFavBtn.querySelector('span:first-child').textContent = isFav ? '♥' : '♡';
    spotlightFavLabel.textContent = isFav ? 'Favorited' : 'Favorite';
  }

  function pickRandomPassage() {
    const randomIndex = Math.floor(Math.random() * LOVE_PASSAGES.length);
    openSpotlight(LOVE_PASSAGES[randomIndex].id);
  }

  // Auto-save spotlight note
  let spotlightTimeout = null;
  spotlightNoteInput.addEventListener('input', (e) => {
    if (!activeSpotlightId) return;
    spotlightNoteStatus.textContent = 'Saving...';
    clearTimeout(spotlightTimeout);
    spotlightTimeout = setTimeout(() => {
      notes[activeSpotlightId] = e.target.value;
      saveNotes();
      spotlightNoteStatus.textContent = 'Saved';

      // Update card on the main page if present
      const cardTextarea = document.querySelector(`.note-textarea[data-id="${activeSpotlightId}"]`);
      if (cardTextarea) {
        cardTextarea.value = e.target.value;
        const noteBtn = document.querySelector(`.toggle-note-btn[data-id="${activeSpotlightId}"]`);
        if (noteBtn) {
          if (e.target.value.trim().length > 0) {
            noteBtn.classList.add('has-note');
            noteBtn.querySelector('span:last-child').textContent = 'My Note';
          } else {
            noteBtn.classList.remove('has-note');
            noteBtn.querySelector('span:last-child').textContent = 'Add Note';
          }
        }
      }
    }, 500);
  });

  // Spotlight action listeners
  modalCloseBtn.addEventListener('click', closeSpotlight);
  spotlightModal.addEventListener('click', (e) => {
    if (e.target === spotlightModal) closeSpotlight();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && spotlightModal.classList.contains('active')) {
      closeSpotlight();
    }
  });

  spotlightFavBtn.addEventListener('click', () => {
    if (activeSpotlightId) toggleFavorite(activeSpotlightId);
  });

  spotlightCopyBtn.addEventListener('click', () => {
    if (activeSpotlightId) copyPassage(activeSpotlightId);
  });

  spotlightExportImgBtn.addEventListener('click', () => {
    if (activeSpotlightId) generateQuoteImage(activeSpotlightId);
  });

  spotlightNextBtn.addEventListener('click', () => {
    pickRandomPassage();
  });

  // --- Export Notes & Favorites Journal ---
  function exportJournal() {
    const noteKeys = Object.keys(notes).filter(k => notes[k] && notes[k].trim().length > 0);
    const favArray = Array.from(favorites);

    if (noteKeys.length === 0 && favArray.length === 0) {
      showToast('No notes or favorites to export yet!', 'ℹ');
      return;
    }

    let exportContent = `# The Anthology of Devotion & Longing — Personal Journal\n`;
    exportContent += `Exported on: ${new Date().toLocaleString()}\n`;
    exportContent += `Total Favorites: ${favArray.length} | Passages with Personal Notes: ${noteKeys.length}\n\n`;
    exportContent += `========================================================================\n\n`;

    if (noteKeys.length > 0) {
      exportContent += `## MY PERSONAL REFLECTIONS & NOTES\n\n`;
      noteKeys.forEach(idStr => {
        const p = LOVE_PASSAGES.find(item => item.id === parseInt(idStr, 10));
        if (p) {
          exportContent += `### [${p.category}] ${p.title} (#${p.id})\n`;
          exportContent += `Passage: "${p.text}"\n\n`;
          exportContent += `MY REFLECTION:\n${notes[idStr]}\n\n`;
          exportContent += `------------------------------------------------------------------------\n\n`;
        }
      });
    }

    if (favArray.length > 0) {
      exportContent += `## MY STARRED FAVORITES\n\n`;
      favArray.forEach(id => {
        const p = LOVE_PASSAGES.find(item => item.id === id);
        if (p) {
          exportContent += `* [${p.category}] "${p.title}" — "${p.text}"\n\n`;
        }
      });
    }

    const blob = new Blob([exportContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `love-anthology-reflections-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Journal notes exported as Markdown!', '📥');
  }

  // --- Reset All Filters ---
  function resetAllFilters() {
    searchQuery = '';
    searchInput.value = '';
    clearSearchBtn.classList.remove('visible');
    currentCategory = 'all';
    favoritesOnly = false;
    notesOnly = false;

    categoryTabs.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-category') === 'all');
    });

    filterFavoritesBtn.classList.remove('active');
    filterNotesBtn.classList.remove('active');

    renderPassages();
  }

  // --- Event Listeners ---
  // Search input
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    clearSearchBtn.classList.toggle('visible', searchQuery.length > 0);
    renderPassages();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.remove('visible');
    renderPassages();
  });

  // Category filter tabs
  categoryTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;

    categoryTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    currentCategory = btn.getAttribute('data-category');
    renderPassages();
  });

  // Favorites toggle filter
  filterFavoritesBtn.addEventListener('click', () => {
    favoritesOnly = !favoritesOnly;
    filterFavoritesBtn.classList.toggle('active', favoritesOnly);
    renderPassages();
  });

  // Notes toggle filter
  filterNotesBtn.addEventListener('click', () => {
    notesOnly = !notesOnly;
    filterNotesBtn.classList.toggle('active', notesOnly);
    renderPassages();
  });

  // Random passage button
  randomPassageBtn.addEventListener('click', pickRandomPassage);

  // Export notes button
  exportNotesBtn.addEventListener('click', exportJournal);

  // Theme toggle
  themeToggleBtn.addEventListener('click', () => {
    applyTheme(currentTheme === 'light' ? 'dark' : 'light');
  });

  // Ambient sound toggle
  ambientAudioBtn.addEventListener('click', toggleAmbientSound);

  // --- Initialization ---
  applyTheme(currentTheme);
  updateCounters();
  renderPassages();

  console.log('Anthology initialized with 100 original literary passages.');
})();
