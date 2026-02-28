

(() => {
  const navBtn = document.querySelector('.navbtn');
  const nav = document.querySelector('.nav');

  if (navBtn && nav) {
    navBtn.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      navBtn.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        navBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('is-visible');
    });
  }, { threshold: 0.16 });

  revealEls.forEach(el => io.observe(el));

  const toast = document.getElementById('toast');
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => toast.classList.remove('show'), 3200);
  };

  const audio = document.getElementById('bgAudio');
  const musicFab = document.getElementById('musicFab');
  const icon = musicFab?.querySelector('.musicfab__icon');

  const setMusicUI = (isPlaying) => {
    if (!musicFab || !icon) return;
    musicFab.setAttribute('aria-pressed', String(isPlaying));
    musicFab.setAttribute('aria-label', isPlaying ? 'Pause music' : 'Play music');
    icon.setAttribute('data-icon', isPlaying ? 'pause' : 'play');
  };

  if (musicFab && audio) {
    setMusicUI(false);

    musicFab.addEventListener('click', async () => {
      try {
        if (audio.paused) {
          await audio.play();
          setMusicUI(true);
        } else {
          audio.pause();
          setMusicUI(false);
        }
      } catch {
        showToast('Tap again to enable audio.');
      }
    });

    audio.addEventListener('pause', () => setMusicUI(false));
    audio.addEventListener('play', () => setMusicUI(true));
  }

  // RSVP
  const form = document.getElementById('rsvpForm');
  if (!form) return;

  const setError = (name, msg) => {
    const el = form.querySelector(`[data-error-for="${name}"]`);
    if (el) el.textContent = msg || '';
  };

  const submittedAtEl = document.getElementById('submitted_at');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const attendance = String(data.get('attendance') || '').trim();
    const guests = Number(data.get('guests') || 0);
    const notes = String(data.get('notes') || '').trim();

    let ok = true;

    setError('name', '');
    setError('attendance', '');
    setError('guests', '');

    if (!name) { setError('name', 'Please enter your name.'); ok = false; }
    if (!attendance) { setError('attendance', 'Please choose an option.'); ok = false; }
    if (!Number.isFinite(guests) || guests < 1 || guests > 6) {
      setError('guests', 'Guests must be between 1 and 6.');
      ok = false;
    }

    if (!ok) {
      showToast('Please fix the highlighted fields.');
      return;
    }

    const payload = { name, phone, attendance, guests, notes, savedAt: new Date().toISOString() };
    localStorage.setItem('rsvp', JSON.stringify(payload, null, 2));

    if (submittedAtEl) submittedAtEl.value = payload.savedAt;

    showToast('Sending RSVP...');
    const nextEl = document.getElementById('nextUrl');
    if (nextEl) {
      const base = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
      nextEl.value = base + 'thank-you.html';
    }
    form.submit(); // This will POST because your form has method="POST"
  });
})();