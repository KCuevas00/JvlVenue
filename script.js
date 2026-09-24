document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  var header = document.querySelector('header.site');
  
  if (toggle && nav && header) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      header.classList.toggle('menu-open');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { 
        nav.classList.remove('open'); 
        header.classList.remove('menu-open');
      });
    });
  }
  
  if (header) {
    function onScroll() {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---------- Gallery lightbox ----------
  var galleryButtons = Array.prototype.slice.call(document.querySelectorAll('.gallery-grid button')).filter(function (btn) {
    var full = btn.getAttribute('data-full');
    return full && full.trim().length > 0;
  });
  if (galleryButtons.length) {
    var lightbox = document.querySelector('.lightbox');
    var lightboxImg = lightbox.querySelector('img');
    var lightboxCount = lightbox.querySelector('.lightbox-count');
    var closeBtn = lightbox.querySelector('.lightbox-close');
    var prevBtn = lightbox.querySelector('.lightbox-prev');
    var nextBtn = lightbox.querySelector('.lightbox-next');
    var current = 0;

    function show(index) {
      current = (index + galleryButtons.length) % galleryButtons.length;
      var btn = galleryButtons[current];
      var full = btn.getAttribute('data-full');
      if (full) {
        lightboxImg.src = full;
        lightboxImg.alt = btn.getAttribute('data-alt') || '';
        lightboxCount.textContent = (current + 1) + ' / ' + galleryButtons.length;
      }
    }

    function open(index) {
      var btn = galleryButtons[index];
      if (!btn || !btn.getAttribute('data-full')) return;
      show(index);
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    galleryButtons.forEach(function (btn, i) {
      btn.addEventListener('click', function () { open(i); });
    });
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { show(current - 1); });
    nextBtn.addEventListener('click', function () { show(current + 1); });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) close();
    });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  // ---------- Pre-check requested package(s) from URL ----------
  var packageChecks = document.getElementById('package-checks');
  if (packageChecks) {
    var params = new URLSearchParams(window.location.search);
    var requested = params.getAll('package').flatMap(function (v) {
      return v.split(',');
    }).map(function (v) { return v.trim().toLowerCase(); });

    if (requested.length) {
      packageChecks.querySelectorAll('input[type="checkbox"]').forEach(function (box) {
        if (requested.indexOf(box.value.trim().toLowerCase()) !== -1) {
          box.checked = true;
        }
      });
    }
  }

  

  // ---------- Open Now indicator ----------
  var hoursStatus = document.getElementById('hours-status');
  if (hoursStatus) {
    var dot = hoursStatus.querySelector('.status-dot');
    var text = document.getElementById('hours-status-text');
    var now = new Date();
    var hour = now.getHours() + now.getMinutes() / 60;
    var isOpen = hour >= 10 && hour < 18;
    dot.classList.add(isOpen ? 'is-open' : 'is-closed');
    text.textContent = isOpen ? '[Open for Inquiries]' : '[By Appointment]';
  }

  // ---------- Multi-Video Hero Crossfade & Loop ----------
  var layerA = document.getElementById('video-layer-a');
  var layerB = document.getElementById('video-layer-b');
  var heroVideoToggle = document.querySelector('.hero-video-toggle');

  if (layerA && layerB) {
    var playlist = [
      { src: 'videos/venue-hero.mp4', poster: 'photos/venue-gold-black-setup.jpg' },
      { src: 'videos/venue-tour.mp4', poster: 'photos/venue-round-tables-setup.jpg' }
    ];

    var layers = [
      {
        wrap: layerA,
        backdrop: layerA.querySelector('.hero-video--backdrop'),
        main: layerA.querySelector('.hero-video--main')
      },
      {
        wrap: layerB,
        backdrop: layerB.querySelector('.hero-video--backdrop'),
        main: layerB.querySelector('.hero-video--main')
      }
    ];

    var currentPlaylistIdx = 0;
    var activeLayerIdx = 0;
    var isTransitioning = false;
    var isUserPaused = false;
    var FADE_LEAD_TIME = 1.2;

    // Start playing layer A
    layers[0].wrap.classList.add('is-active');
    layers[0].backdrop.play().catch(function () {});
    layers[0].main.play().catch(function () {});

    // Preload layer B with next clip
    prepareLayer(layers[1], playlist[1]);

    function prepareLayer(layer, clip) {
      if (layer.main.getAttribute('data-src') !== clip.src) {
        layer.backdrop.src = clip.src;
        layer.main.src = clip.src;
        layer.main.poster = clip.poster;
        layer.main.setAttribute('data-src', clip.src);
        layer.backdrop.load();
        layer.main.load();
      }
      layer.backdrop.currentTime = 0;
      layer.main.currentTime = 0;
    }

    function checkVideoProgress() {
      if (isUserPaused || isTransitioning) return;

      var currentLayer = layers[activeLayerIdx];
      var vid = currentLayer.main;

      if (vid.duration && (vid.duration - vid.currentTime <= FADE_LEAD_TIME)) {
        transitionToNext();
      }
    }

    function transitionToNext() {
      if (isTransitioning) return;
      isTransitioning = true;
      var nextPlaylistIdx = (currentPlaylistIdx + 1) % playlist.length;
      var nextLayerIdx = 1 - activeLayerIdx;

      var currentLayer = layers[activeLayerIdx];
      var nextLayer = layers[nextLayerIdx];
      var nextClip = playlist[nextPlaylistIdx];

      prepareLayer(nextLayer, nextClip);

      // Start next layer videos playing seamlessly underneath
      nextLayer.backdrop.play().catch(function () {});
      nextLayer.main.play().catch(function () {});

      // Crossfade: nextLayer fades in to 1, currentLayer fades out to 0
      nextLayer.wrap.classList.add('is-active');
      currentLayer.wrap.classList.remove('is-active');

      currentPlaylistIdx = nextPlaylistIdx;
      activeLayerIdx = nextLayerIdx;

      // After CSS fade completes (1200ms), pause the old layer
      setTimeout(function () {
        if (!isUserPaused) {
          currentLayer.backdrop.pause();
          currentLayer.main.pause();
        }
        isTransitioning = false;
      }, 1250);
    }

    // Monitor playback on timeupdate of both main videos
    layers[0].main.addEventListener('timeupdate', checkVideoProgress);
    layers[1].main.addEventListener('timeupdate', checkVideoProgress);

    // Fallback: in case timeupdate misses the exact window
    layers[0].main.addEventListener('ended', function () {
      if (!isTransitioning && activeLayerIdx === 0) transitionToNext();
    });
    layers[1].main.addEventListener('ended', function () {
      if (!isTransitioning && activeLayerIdx === 1) transitionToNext();
    });

    // Pause/Play toggle support for both layers
    if (heroVideoToggle) {
      var iconPause = heroVideoToggle.querySelector('.icon-pause');
      var iconPlay = heroVideoToggle.querySelector('.icon-play');

      heroVideoToggle.addEventListener('click', function () {
        var active = layers[activeLayerIdx];
        if (active.main.paused) {
          isUserPaused = false;
          active.backdrop.play().catch(function () {});
          active.main.play().catch(function () {});
          if (iconPause) iconPause.style.display = 'block';
          if (iconPlay) iconPlay.style.display = 'none';
          heroVideoToggle.setAttribute('aria-label', 'Pause video');
        } else {
          isUserPaused = true;
          layers[0].backdrop.pause();
          layers[0].main.pause();
          layers[1].backdrop.pause();
          layers[1].main.pause();
          if (iconPause) iconPause.style.display = 'none';
          if (iconPlay) iconPlay.style.display = 'block';
          heroVideoToggle.setAttribute('aria-label', 'Play video');
        }
      });
    }
  }
});
