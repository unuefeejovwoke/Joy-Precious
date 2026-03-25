
(() => {
  const navBtn = document.querySelector('.navbtn');
  const nav = document.querySelector('.nav');

  if (navBtn && nav) {
    navBtn.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      navBtn.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        navBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.16 });

  revealEls.forEach((el) => io.observe(el));

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

  // Custom gallery slider
  const gallerySlider = document.getElementById('gallerySlider');
  const galleryTrack = document.getElementById('galleryTrack');
  const galleryDots = document.getElementById('galleryDots');
  const galleryCounter = document.getElementById('galleryCounter');

  if (gallerySlider && galleryTrack) {
    const prevBtn = gallerySlider.querySelector('.gallerySlider__btn--prev');
    const nextBtn = gallerySlider.querySelector('.gallerySlider__btn--next');

    const galleryImages = [];
    const extensions = ['jpg', 'jpeg', 'png', 'webp'];

    // Auto-pick numbered files from assets/gallery like 1.jpg, 2.jpg ... 50.jpg
    for (let i = 1; i <= 50; i += 1) {
      extensions.forEach((ext) => {
        galleryImages.push(`assets/gallery/${i}.${ext}`);
      });
    }

    let validImages = [];
    let currentIndex = 0;
    let autoTimer = null;
    let startX = 0;
    let endX = 0;
    let isAnimating = false;

    const preloadImage = (src) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => resolve(null);
      img.src = src;
    });

    const buildSlides = () => {
      galleryTrack.innerHTML = '';
      galleryDots.innerHTML = '';

      validImages.forEach((src, index) => {
        const slide = document.createElement('article');
        slide.className = 'gallerySlide';
        slide.innerHTML = `
          <div class="gallerySlide__inner">
            <img src="${src}" alt="Joy and Precious gallery image ${index + 1}" loading="lazy" />
          </div>
        `;
        galleryTrack.appendChild(slide);

        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Go to gallery image ${index + 1}`);
        dot.addEventListener('click', () => {
          goToSlide(index);
          restartAuto();
        });
        galleryDots.appendChild(dot);
      });

      updateSlider(true);
    };

    const updateSlider = (instant = false) => {
      const slides = Array.from(galleryTrack.children);
      const dots = Array.from(galleryDots.children);

      if (!slides.length) return;

      galleryTrack.style.transition = instant ? 'none' : 'transform 700ms cubic-bezier(.22,.61,.36,1)';
      galleryTrack.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;

      slides.forEach((slide, index) => {
        slide.classList.toggle('is-active', index === currentIndex);
        slide.classList.toggle('is-prev', index === (currentIndex - 1 + slides.length) % slides.length);
        slide.classList.toggle('is-next', index === (currentIndex + 1) % slides.length);
      });

      dots.forEach((dot, index) => dot.classList.toggle('is-active', index === currentIndex));

      if (galleryCounter) {
        galleryCounter.textContent = `${currentIndex + 1} / ${slides.length}`;
      }

      if (instant) {
        requestAnimationFrame(() => {
          galleryTrack.style.transition = 'transform 700ms cubic-bezier(.22,.61,.36,1)';
        });
      }
    };

    const goToSlide = (index, instant = false) => {
      if (!validImages.length || isAnimating) return;
      currentIndex = (index + validImages.length) % validImages.length;
      isAnimating = !instant;
      updateSlider(instant);
      if (!instant) {
        window.setTimeout(() => { isAnimating = false; }, 720);
      }
    };

    const nextSlide = () => goToSlide(currentIndex + 1);
    const prevSlide = () => goToSlide(currentIndex - 1);

    const startAuto = () => {
      if (autoTimer || validImages.length < 2) return;
      autoTimer = window.setInterval(nextSlide, 4200);
    };

    const stopAuto = () => {
      if (!autoTimer) return;
      window.clearInterval(autoTimer);
      autoTimer = null;
    };

    const restartAuto = () => {
      stopAuto();
      startAuto();
    };

    prevBtn?.addEventListener('click', () => {
      prevSlide();
      restartAuto();
    });

    nextBtn?.addEventListener('click', () => {
      nextSlide();
      restartAuto();
    });

    gallerySlider.addEventListener('mouseenter', stopAuto);
    gallerySlider.addEventListener('mouseleave', startAuto);
    gallerySlider.addEventListener('focusin', stopAuto);
    gallerySlider.addEventListener('focusout', startAuto);

    gallerySlider.addEventListener('touchstart', (event) => {
      startX = event.changedTouches[0].clientX;
      endX = startX;
      stopAuto();
    }, { passive: true });

    gallerySlider.addEventListener('touchmove', (event) => {
      endX = event.changedTouches[0].clientX;
    }, { passive: true });

    gallerySlider.addEventListener('touchend', () => {
      const delta = startX - endX;
      if (Math.abs(delta) > 50) {
        if (delta > 0) nextSlide();
        else prevSlide();
      }
      startAuto();
    });

    Promise.all(galleryImages.map(preloadImage)).then((results) => {
      validImages = results.filter(Boolean);
      if (!validImages.length) {
        galleryTrack.innerHTML = '<article class="gallerySlide gallerySlide--empty"><div class="gallerySlide__inner"><p>Add images to assets/gallery to show them here.</p></div></article>';
        if (galleryCounter) galleryCounter.textContent = '0 / 0';
        return;
      }
      buildSlides();
      startAuto();
    });
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
    form.submit();
  });
})();
