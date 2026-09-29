// Force browser to always start at the top on reload / refresh
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

function forceScrollTop() {
  if (!window.location.hash) {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }
}

forceScrollTop();
window.addEventListener('beforeunload', forceScrollTop);
window.addEventListener('load', forceScrollTop);

document.addEventListener('DOMContentLoaded', function () {
  forceScrollTop();
  var toggle = document.querySelector('.nav-toggle');
  var closeBtn = document.querySelector('.nav-close');
  var backdrop = document.querySelector('.nav-backdrop');
  var nav = document.querySelector('.main-nav');
  var header = document.querySelector('header.site');
  
  function openNav() {
    if (nav) nav.classList.add('open');
    if (header) header.classList.add('menu-open');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    if (nav) nav.classList.remove('open');
    if (header) header.classList.remove('menu-open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (toggle) toggle.addEventListener('click', openNav);
  if (closeBtn) closeBtn.addEventListener('click', closeNav);
  if (backdrop) backdrop.addEventListener('click', closeNav);

  if (nav) {
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav && nav.classList.contains('open')) {
      closeNav();
    }
  });
  
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

  // ---------- Event Type Dropdown & "Other" Field Toggle ----------
  var eventTypeSelect = document.getElementById('event-type');
  var otherEventWrap = document.getElementById('other-event-wrap');
  var otherEventInput = document.getElementById('other-event');

  if (eventTypeSelect) {
    function toggleOtherField() {
      if (eventTypeSelect.value === 'Other') {
        if (otherEventWrap) otherEventWrap.style.display = 'block';
        if (otherEventInput) otherEventInput.focus();
      } else {
        if (otherEventWrap) otherEventWrap.style.display = 'none';
        if (otherEventInput) otherEventInput.value = '';
      }
    }

    eventTypeSelect.addEventListener('change', toggleOtherField);

    // Pre-select celebration type from URL parameter (e.g. ?event=birthday)
    var params = new URLSearchParams(window.location.search);
    var requestedEvent = params.get('event') || params.get('package') || params.get('type');
    if (requestedEvent) {
      var reqLower = requestedEvent.trim().toLowerCase();
      for (var i = 0; i < eventTypeSelect.options.length; i++) {
        var opt = eventTypeSelect.options[i];
        if (opt.value && opt.value.toLowerCase().indexOf(reqLower) !== -1) {
          eventTypeSelect.selectedIndex = i;
          toggleOtherField();
          break;
        }
      }
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
    text.textContent = isOpen ? 'Open for Inquiries' : 'By Appointment';
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

  // ---------- FAQ Smooth Slide Accordion ----------
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var summary = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');
    if (!summary || !answer) return;

    if (item.hasAttribute('open')) {
      item.classList.add('is-open');
    }

    var anim = null;
    var isClosing = false;
    var isOpening = false;

    summary.addEventListener('click', function (e) {
      e.preventDefault();

      if (!answer.animate) {
        if (item.hasAttribute('open')) {
          item.removeAttribute('open');
          item.classList.remove('is-open');
        } else {
          item.setAttribute('open', '');
          item.classList.add('is-open');
        }
        return;
      }

      if (isClosing || !item.hasAttribute('open')) {
        openItem();
      } else if (isOpening || item.hasAttribute('open')) {
        closeItem();
      }
    });

    function closeItem() {
      isClosing = true;
      isOpening = false;
      item.classList.remove('is-open');

      var startHeight = answer.offsetHeight;
      if (anim) anim.cancel();

      anim = answer.animate({
        height: [startHeight + 'px', '0px'],
        opacity: [1, 0]
      }, {
        duration: 260,
        easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)'
      });

      anim.onfinish = function () {
        item.removeAttribute('open');
        anim = null;
        isClosing = false;
        answer.style.height = '';
        answer.style.opacity = '';
      };
      anim.oncancel = function () {
        isClosing = false;
      };
    }

    function openItem() {
      item.setAttribute('open', '');
      item.classList.add('is-open');
      isOpening = true;
      isClosing = false;

      var startHeight = answer.offsetHeight;
      var endHeight = answer.scrollHeight;

      if (anim) anim.cancel();

      anim = answer.animate({
        height: [(startHeight > 0 && startHeight < endHeight ? startHeight : 0) + 'px', endHeight + 'px'],
        opacity: [0, 1]
      }, {
        duration: 280,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
      });

      anim.onfinish = function () {
        anim = null;
        isOpening = false;
        answer.style.height = '';
        answer.style.opacity = '';
      };
      anim.oncancel = function () {
        isOpening = false;
      };
    }
  });

  // ---------- Scroll-triggered Fade In Animations ----------
  if ('IntersectionObserver' in window) {
    var revealSelector = [
      '.section .center',
      '.venue-showcase .showcase-card',
      '.feature-card',
      '.event-grid .event-card',
      '.testimonials .tcard',
      '.faq-wrap .faq-item',
      '.inclusions-grid .inclusion-card',
      '.tiers-grid .tier-card',
      '.cta-band .wrap',
      '.gallery-grid > *',
      '.contact-grid > div',
      '.venue-story-grid > div'
    ].join(', ');

    var revealElements = document.querySelectorAll(revealSelector);

    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.04
    });

    revealElements.forEach(function (el) {
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
  }

  // ---------- Bilingual English / Spanish Switcher ----------
  var currentLang = 'en';
  try {
    currentLang = localStorage.getItem('jvl_language') || 'en';
  } catch (e) {}

  var eventCardMap = {
    'Birthdays': 'Cumpleaños',
    'Quinceañeras': 'Quinceañeras',
    'Baptisms': 'Bautizos',
    'First Communions': 'Primeras Comuniones',
    'Showers & Receptions': 'Showers y Recepciones',
    'Family Gatherings': 'Reuniones Familiares',
    'Graduations': 'Graduaciones',
    'Corporate Events': 'Eventos Corporativos',
    'Sweet 16s': 'Fiestas Sweet 16'
  };

  var navMap = {
    'Home': 'Inicio',
    'The Venue': 'El Salón',
    'Gallery': 'Galería',
    'Contact': 'Contacto'
  };

  function applyLanguage(lang) {
    var isEs = lang === 'es';
    document.documentElement.lang = isEs ? 'es' : 'en';

    // 1. Update button labels & appearance
    var toggleBtns = document.querySelectorAll('.lang-toggle-btn');
    toggleBtns.forEach(function (btn) {
      var flag = btn.querySelector('.lang-flag-icon');
      var label = btn.querySelector('.lang-text-label');
      if (isEs) {
        btn.classList.add('is-spanish');
        if (flag) flag.textContent = '🇺🇸';
        if (label) label.textContent = 'English';
        btn.setAttribute('aria-label', 'Switch language to English');
      } else {
        btn.classList.remove('is-spanish');
        if (flag) flag.textContent = '🇲🇽';
        if (label) label.textContent = 'Español';
        btn.setAttribute('aria-label', 'Cambiar idioma a Español');
      }
    });

    // 2. Navigation links
    document.querySelectorAll('nav.main-nav .nav-links-wrap a').forEach(function (a) {
      if (!a.getAttribute('data-en')) a.setAttribute('data-en', a.textContent.trim());
      var en = a.getAttribute('data-en');
      a.textContent = isEs ? (navMap[en] || en) : en;
    });

    // 3. CTA Buttons
    document.querySelectorAll('.btn--nav-cta, .header-cta .btn--white').forEach(function (b) {
      if (!b.getAttribute('data-en')) b.setAttribute('data-en', b.textContent.trim());
      var en = b.getAttribute('data-en');
      b.textContent = isEs ? 'Reservar Ahora' : en;
    });

    // 4. Hero section (Home)
    var heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
      if (!heroTitle.getAttribute('data-en')) heroTitle.setAttribute('data-en', heroTitle.textContent.trim());
      heroTitle.textContent = isEs ? 'Celebre con Elegancia' : heroTitle.getAttribute('data-en');
    }
    var heroTagline = document.querySelector('.hero-tagline');
    if (heroTagline) {
      if (!heroTagline.getAttribute('data-en')) heroTagline.setAttribute('data-en', heroTagline.textContent.trim());
      heroTagline.textContent = isEs ? 'Su Salón de Eventos Premier en Plano, IL' : heroTagline.getAttribute('data-en');
    }
    var heroSub = document.querySelector('.hero-subtitle');
    if (heroSub) {
      if (!heroSub.getAttribute('data-en')) heroSub.setAttribute('data-en', heroSub.textContent.trim());
      heroSub.textContent = isEs ? 'Un salón de recepción íntimo y espacio para eventos privados de hasta 75 invitados' : heroSub.getAttribute('data-en');
    }
    var heroTour = document.querySelector('.hero-actions .btn--gold');
    if (heroTour) {
      if (!heroTour.getAttribute('data-en')) heroTour.setAttribute('data-en', heroTour.textContent.trim());
      heroTour.textContent = isEs ? 'Agendar una Visita' : heroTour.getAttribute('data-en');
    }
    var heroAvail = document.querySelector('.hero-actions .btn--white');
    if (heroAvail) {
      if (!heroAvail.getAttribute('data-en')) heroAvail.setAttribute('data-en', heroAvail.textContent.trim());
      heroAvail.textContent = isEs ? 'Verificar Disponibilidad' : heroAvail.getAttribute('data-en');
    }

    // 5. Why Choose section
    var chooseText = document.querySelector('.feature-lead-text');
    if (chooseText) {
      var h2 = chooseText.previousElementSibling;
      var eyebrow = h2 ? h2.previousElementSibling : null;
      if (eyebrow && eyebrow.classList.contains('eyebrow')) {
        if (!eyebrow.getAttribute('data-en')) eyebrow.setAttribute('data-en', eyebrow.textContent.trim());
        eyebrow.textContent = isEs ? 'Por Qué Elegir JVL Venue' : eyebrow.getAttribute('data-en');
      }
      if (h2) {
        if (!h2.getAttribute('data-en')) h2.setAttribute('data-en', h2.textContent.trim());
        h2.textContent = isEs ? 'Un Espacio Íntimo Para Eventos Inolvidables' : h2.getAttribute('data-en');
      }
      if (!chooseText.getAttribute('data-en')) chooseText.setAttribute('data-en', chooseText.textContent.trim());
      chooseText.textContent = isEs ? '¿Busca un salón cómodo y privado para su próxima reunión? JVL Venue ofrece un espacio versátil y limpio, diseñado para adaptarse a su fiesta con opciones flexibles de montaje.' : chooseText.getAttribute('data-en');
    }

    // 6. Feature stats row
    var featCards = document.querySelectorAll('.feature-card');
    if (featCards.length >= 4) {
      var fStats = isEs ? ['Hasta 75 Invitados', '5:00 PM – 11:30 PM', 'Mesas, Sillas y Manteles', 'Área de Plano, IL'] : ['Max 75 Guests', '5:00 PM – 11:30 PM', 'Tables, Chairs & Linens', 'Plano, IL Area'];
      var fLabels = isEs ? ['Capacidad íntima del salón', 'Horario de renta', 'Incluidos con la renta', 'Ubicación conveniente'] : ['Intimate salon capacity', 'Rental hours', 'Included', 'Convenient location'];
      featCards.forEach(function (fc, idx) {
        var stat = fc.querySelector('.feature-stat');
        var label = fc.querySelector('.feature-label');
        if (stat && fStats[idx]) stat.textContent = fStats[idx];
        if (label && fLabels[idx]) label.textContent = fLabels[idx];
      });
    }

    // 6.5. Event grid header
    var egHeader = document.querySelector('.event-grid-header');
    if (egHeader) {
      var egEyebrow = egHeader.querySelector('.eyebrow');
      var egTitle = egHeader.querySelector('.event-grid-title');
      var egSub = egHeader.querySelector('.event-grid-sub');
      if (egEyebrow) {
        if (!egEyebrow.getAttribute('data-en')) egEyebrow.setAttribute('data-en', egEyebrow.textContent.trim());
        egEyebrow.textContent = isEs ? 'Celebraciones Que Organizamos' : egEyebrow.getAttribute('data-en');
      }
      if (egTitle) {
        if (!egTitle.getAttribute('data-en')) egTitle.setAttribute('data-en', egTitle.textContent.trim());
        egTitle.textContent = isEs ? 'Salón Versátil Para Cada Momento Especial' : egTitle.getAttribute('data-en');
      }
      if (egSub) {
        if (!egSub.getAttribute('data-en')) egSub.setAttribute('data-en', egSub.textContent.trim());
        egSub.textContent = isEs ? 'Desde reuniones familiares tradicionales hasta fiestas privadas modernas, nuestro salón se adapta perfectamente a su evento.' : egSub.getAttribute('data-en');
      }
    }

    // 7. Event cards (9 tiles)
    document.querySelectorAll('.event-grid .event-card').forEach(function (card) {
      var label = card.querySelector('.label');
      if (label) {
        var cleanEn = label.getAttribute('data-en');
        if (!cleanEn) {
          cleanEn = label.textContent.replace(/\s+/g, ' ').trim();
          label.setAttribute('data-en', cleanEn);
        }
        if (isEs) {
          label.textContent = eventCardMap[cleanEn] || cleanEn;
        } else {
          label.textContent = cleanEn;
        }
      }
    });

    // 8. Gallery Showcase cards
    var scCards = document.querySelectorAll('.showcase-card');
    if (scCards.length >= 3) {
      var scTitles = isEs ? [
        'Distribución de Mesas y Sillas Incluida',
        'Ambiente Nocturno e Ideas de Decoración',
        'Escenarios y Decoraciones Especiales'
      ] : [
        'Included Hall & Seating Layout',
        'Evening Atmosphere & Styling Ideas',
        'Celebration Backdrops & Feature Setups'
      ];
      var scDescs = isEs ? [
        'Cada reservación incluye mesas redondas estándar, sillas cómodas y manteles limpios para hasta 75 invitados.',
        'Muestra de cena nocturna. Los manteles básicos están incluidos; caminos de mesa y detalles especiales se pueden agregar por costo adicional o traerlos usted mismo.',
        'Espacio flexible listo para mesas de postres y entretenimiento. Arcos de globos y escenarios fotográficos están disponibles como servicio adicional.'
      ] : [
        'Every booking includes standard round banquet tables, comfortable chairs, and crisp tablecloths arranged for up to 75 guests.',
        'Sample evening dinner setting. While basic linens are included, specialty runners, chargers, and custom accent decor can be added for an extra fee or brought in by you.',
        'Flexible open floor ready for dessert stations and entertainment. Custom balloon styling, themed backdrops, and specialty decor are available as an optional add-on.'
      ];
      scCards.forEach(function (sc, idx) {
        var h3 = sc.querySelector('h3');
        var p = sc.querySelector('p');
        var tag = sc.querySelector('.showcase-tag');
        if (h3 && scTitles[idx]) h3.textContent = scTitles[idx];
        if (p && scDescs[idx]) p.textContent = scDescs[idx];
        if (tag) tag.innerHTML = isEs ? 'Ver Galería Completa &rarr;' : 'View Full Gallery &rarr;';
      });
      var showcaseBtn = document.querySelector('.venue-showcase-section .btn--gold');
      if (showcaseBtn) {
        if (!showcaseBtn.getAttribute('data-en')) showcaseBtn.setAttribute('data-en', showcaseBtn.textContent.trim());
        showcaseBtn.textContent = isEs ? 'Explorar Galería Completa' : showcaseBtn.getAttribute('data-en');
      }
    }

    // 9. Testimonials & Feedback
    var feedbackSec = document.querySelector('.testimonials');
    if (feedbackSec && feedbackSec.previousElementSibling) {
      var fbHeader = feedbackSec.previousElementSibling;
      var fbEyebrow = fbHeader.querySelector('.eyebrow');
      var fbH2 = fbHeader.querySelector('h2');
      var fbP = fbHeader.querySelector('p');
      if (fbEyebrow) {
        if (!fbEyebrow.getAttribute('data-en')) fbEyebrow.setAttribute('data-en', fbEyebrow.textContent.trim());
        fbEyebrow.textContent = isEs ? 'Opiniones de Clientes' : fbEyebrow.getAttribute('data-en');
      }
      if (fbH2) {
        if (!fbH2.getAttribute('data-en')) fbH2.setAttribute('data-en', fbH2.textContent.trim());
        fbH2.textContent = isEs ? 'Lo Que Dicen Anfitriones e Invitados' : fbH2.getAttribute('data-en');
      }
      if (fbP) {
        if (!fbP.getAttribute('data-en')) fbP.setAttribute('data-en', fbP.textContent.trim());
        fbP.textContent = isEs ? 'Opiniones reales de familias y anfitriones de eventos.' : fbP.getAttribute('data-en');
      }
    }

    // 9.5 FAQ Section
    var faqSec = document.querySelector('.faq-wrap');
    if (faqSec) {
      var faqHeader = faqSec.previousElementSibling;
      if (faqHeader) {
        var faqEye = faqHeader.querySelector('.eyebrow');
        var faqH2 = faqHeader.querySelector('h2');
        var faqP = faqHeader.querySelector('p');
        if (faqEye) {
          if (!faqEye.getAttribute('data-en')) faqEye.setAttribute('data-en', faqEye.textContent.trim());
          faqEye.textContent = isEs ? 'Preguntas Comunes' : faqEye.getAttribute('data-en');
        }
        if (faqH2) {
          if (!faqH2.getAttribute('data-en')) faqH2.setAttribute('data-en', faqH2.textContent.trim());
          faqH2.textContent = isEs ? 'Preguntas Frecuentes' : faqH2.getAttribute('data-en');
        }
        if (faqP) {
          if (!faqP.getAttribute('data-en')) faqP.setAttribute('data-en', faqP.textContent.trim());
          faqP.textContent = isEs ? 'Todo lo que necesita saber sobre cómo reservar JVL Venue para su celebración.' : faqP.getAttribute('data-en');
        }
      }

      var faqQuestions = isEs ? [
        '¿Qué incluye la renta de nuestro salón?',
        '¿Cómo funciona el precio y las cotizaciones?',
        '¿Cuál es el horario habitual y política de cierre?',
        '¿Se requiere un depósito de seguridad y cuáles son las normas de entrega?',
        '¿Puedo traer comida y banquetes externos?',
        '¿Cuál es la capacidad máxima de invitados?',
        '¿Puedo agendar una visita en persona antes de reservar?'
      ] : [
        'What is included with our hall rental?',
        'How does pricing work?',
        'What are your rental hours and closing policy?',
        'Is a security deposit required, and what are the checkout guidelines?',
        'Can I bring outside food and catering?',
        'What is the maximum guest capacity?',
        'Can I schedule an in-person tour before reserving?'
      ];

      var faqAnswersEsHtml = [
        '<p>Cada reservación del salón incluye el montaje de mesas, sillas cómodas y manteles limpios para hasta 75 invitados. También disfruta de acceso privado al salón interior climatizado y baños privados. Los servicios adicionales disponibles por costo extra incluyen calentadores de comida comerciales, sistema de sonido para fiestas, decoración personalizada de mesas, arcos de globos y fondos fotográficos temáticos.</p>',
        '<p>Cada evento se cotiza de forma individual según el tipo de celebración, la fecha (días de semana vs. fines de semana) y sus necesidades de montaje. En lugar de paquetes rígidos, ofrecemos cotizaciones personalizadas para que solo pague por lo que su fiesta realmente necesita.</p>',
        '<p>Nuestro horario regular de celebración es de 5:00 PM a una hora estricta de cierre a las 11:30 PM. Conforme a las normas del contrato, toda la música, festejo y salida de invitados debe concluir puntualmente a las 11:30 PM. Contáctenos para coordinar el acceso para montaje y la disponibilidad de fechas.</p>',
        '<p>Sí, se requiere un depósito de seguridad al reservar para asegurar su fecha. Para recibir el reembolso total del depósito, el salón debe entregarse en las mismas condiciones en que fue proporcionado y cumplir con todas las normas del contrato:</p><ul style="margin:10px 0 6px 18px;padding:0;display:flex;flex-direction:column;gap:6px;line-height:1.55"><li><strong>Hora Estricta de Cierre:</strong> Hora de cierre obligatoria a las 11:30 PM con todos los invitados fuera de las instalaciones.</li><li><strong>Retiro de Basura:</strong> Toda la basura debe retirarse de las instalaciones y todos los botes vaciarse, incluidos los botes de los baños.</li><li><strong>Mesas y Sillas:</strong> Las mesas y sillas deben dejarse organizadas.</li><li><strong>Decoraciones:</strong> Todas las decoraciones DEBEN ser retiradas de techos y paredes. Está estrictamente prohibido usar clavos, grapas, chinches o tachuelas ya que dañan las superficies o desprenden la pintura.</li><li><strong>Sin Pirotecnia:</strong> Los fuegos artificiales no están permitidos en ningún lugar de la propiedad.</li><li><strong>Devolución del Depósito:</strong> Cualquier daño a mobiliario, mantelería, paredes o equipo puede resultar en la pérdida parcial o total del depósito. El depósito será reembolsado tras la inspección de la propiedad, siempre que se hayan cumplido las condiciones.</li></ul>',
        '<p>¡Sí! Los anfitriones tienen total libertad de traer comida de afuera, especialidades familiares hechas en casa, pastel de celebración y bebidas sin costo adicional.</p>',
        '<p>Nuestro salón tiene capacidad cómoda para hasta 75 invitados como máximo, manteniendo un ambiente íntimo y seguro en cumplimiento con las normas de seguridad contra incendios.</p>',
        '<p>Sí, con gusto coordinamos recorridos y consultas en Plano, IL con previa cita. Simplemente envíe una solicitud de información o envíenos un mensaje de texto para fijar un horario conveniente para su visita.</p>'
      ];

      var faqItems = faqSec.querySelectorAll('.faq-item');
      faqItems.forEach(function (item, idx) {
        var qSpan = item.querySelector('.faq-question > span:first-child');
        var aInner = item.querySelector('.faq-answer-inner');
        if (qSpan && faqQuestions[idx]) qSpan.textContent = faqQuestions[idx];
        if (aInner && faqAnswersEsHtml[idx]) {
          if (!aInner.getAttribute('data-en-html')) aInner.setAttribute('data-en-html', aInner.innerHTML);
          aInner.innerHTML = isEs ? faqAnswersEsHtml[idx] : aInner.getAttribute('data-en-html');
        }
      });
    }

    // 10. Venue.html Tiers & Inclusions
    var tierCards = document.querySelectorAll('.tier-card');
    if (tierCards.length >= 2) {
      var tier1Badge = tierCards[0].querySelector('.tier-badge span');
      var tier1Title = tierCards[0].querySelector('.tier-title');
      var tier1Sub = tierCards[0].querySelector('.tier-subtitle');
      if (tier1Badge) tier1Badge.textContent = isEs ? 'Incluido Estándar' : 'Included Standard';
      if (tier1Title) tier1Title.textContent = isEs ? 'Todo Listo para su Evento' : 'Everything Ready for Your Event';
      if (tier1Sub) tier1Sub.textContent = isEs ? 'Elementos esenciales incluidos de manera estándar con cada renta para hasta 75 invitados.' : 'Setup essentials provided standard with every hall rental for up to 75 guests.';

      var tier2Badge = tierCards[1].querySelector('.tier-badge span');
      var tier2Title = tierCards[1].querySelector('.tier-title');
      var tier2Sub = tierCards[1].querySelector('.tier-subtitle');
      if (tier2Badge) tier2Badge.textContent = isEs ? 'Opciones Adicionales' : 'Optional Add-Ons';
      if (tier2Title) tier2Title.textContent = isEs ? 'Mejore su Celebración' : 'Enhance Your Celebration';
      if (tier2Sub) tier2Sub.textContent = isEs ? 'Mejoras personalizadas y servicios especiales disponibles a solicitud por un costo adicional.' : 'Tailored upgrades and specialty additions available upon request for an extra fee.';

      var tierItems = document.querySelectorAll('.tier-item');
      if (tierItems.length >= 7) {
        var tItemTitles = isEs ? [
          'Mesas',
          'Sillas',
          'Manteles de Calidad',
          'Calentadores de Comida',
          'Sistema de Sonido',
          'Decoración de Mesas',
          'Fondos y Arcos de Globos'
        ] : [
          'Tables',
          'Chairs',
          'Quality Table Linens',
          'Commercial Food Warmers',
          'Party Sound System',
          'Custom Table Decor',
          'Backdrops & Balloon Arches'
        ];
        var tItemDescs = isEs ? [
          'Mesas redondas para banquete y mesas auxiliares para pastel/comida, acomodadas cómodamente según el plano de su fiesta.',
          'Sillas cómodas y limpias provistas para todos los asistentes hasta la capacidad máxima de 75 invitados.',
          'Mantelería limpia y de calidad incluida de manera estándar para todas las mesas montadas.',
          'Chafers y estaciones térmicas comerciales para mantener sus platillos de banquete o comida casera calientes durante todo el evento.',
          'Equipo de audio de alta fidelidad listo para conectar su teléfono, tableta o lista de reproducción para música y brindis.',
          'Centros de mesa personalizados, caminos de mesa elegantes y detalles decorativos diseñados para realzar cada mesa.',
          'Arcos de globos personalizados, guirnaldas y escenarios fotográficos temáticos adaptados a los colores de su evento.'
        ] : [
          'Round banquet dining tables and auxiliary buffet/cake tables arranged to fit your event plan.',
          'Comfortable seating provided for all attendees up to our maximum salon capacity of 75 guests.',
          'Fresh, clean tablecloths included standard for all setup tables to give your celebration a polished look.',
          'Chafing dishes and hot warming stations to keep your catering at optimal temperature throughout your party.',
          'High-clarity audio system with Bluetooth / AUX plug-and-play connectivity for music and toasts.',
          'Custom centerpiece arrangements, specialty runners, and tailored table accents crafted for your theme.',
          'Custom balloon garlands, themed photo backdrops, and balloon arches created to match your color palette.'
        ];
        tierItems.forEach(function (ti, idx) {
          var t = ti.querySelector('.tier-item-title');
          var d = ti.querySelector('.tier-item-desc');
          if (t && tItemTitles[idx]) t.textContent = tItemTitles[idx];
          if (d && tItemDescs[idx]) d.textContent = tItemDescs[idx];
        });
      }
    }

    // Fallback for standalone inclusion-cards if any
    var incCards = document.querySelectorAll('.inclusion-card');
    if (incCards.length >= 4) {
      var incTitles = isEs ? [
        'Mesas',
        'Sillas',
        'Manteles',
        'Calentadores de Comida',
        'Sistema de Sonido',
        'Decoración de Mesas',
        'Fondos y Globos'
      ] : [
        'Tables',
        'Chairs',
        'Tablecloths',
        'Food Warmers',
        'Sound System',
        'Table Decorations',
        'Backdrops & Balloons'
      ];
      var incBadges = isEs ? [
        'Incluido',
        'Incluido',
        'Incluido',
        'Disponible Costo Extra',
        'Disponible Costo Extra',
        'Disponible Costo Extra',
        'Disponible Costo Extra'
      ] : [
        'Included',
        'Included',
        'Included',
        'Available Extra Fee',
        'Available Extra Fee',
        'Available Extra Fee',
        'Available Extra Fee'
      ];
      var incDescs = isEs ? [
        'Mesas redondas para banquete y mesas auxiliares para pastel/comida, acomodadas cómodamente según el plano de su fiesta.',
        'Sillas cómodas y limpias provistas para todos los asistentes hasta la capacidad máxima de 75 invitados.',
        'Mantelería limpia y de calidad incluida de manera estándar para todas las mesas montadas.',
        'Chafers y estaciones térmicas comerciales para mantener sus platillos de banquete o comida casera calientes durante todo el evento.',
        'Equipo de audio de alta fidelidad listo para conectar su teléfono, tableta o lista de reproducción para música y brindis.',
        'Centros de mesa personalizados, caminos de mesa elegantes y detalles decorativos diseñados para realzar cada mesa.',
        'Arcos de globos personalizados, guirnaldas y escenarios fotográficos temáticos adaptados a los colores de su evento.'
      ] : [
        'Round banquet dining tables and auxiliary food/cake tables arranged comfortably to fit your celebration\'s floor plan.',
        'Comfortable, clean event chairs provided for all attendees up to our maximum salon capacity of 75 guests.',
        'Fresh, quality table linens included standard for all setup tables to give your reception a polished look.',
        'Commercial chafing dishes and warming stations to keep your catering and hot specialties at optimal temperature throughout your party.',
        'High-clarity party sound system ready to connect to your phone, tablet, or DJ playlist for seamless celebration music and toasts.',
        'Custom centerpiece arrangements, specialty table runners, and tailored table accents crafted to elevate your guest dining experience.',
        'Custom balloon garlands, themed photo backdrops, and balloon arches created to match your party\'s color palette.'
      ];
      incCards.forEach(function (inc, idx) {
        var t = inc.querySelector('.inclusion-title');
        var b = inc.querySelector('.inclusion-badge');
        var d = inc.querySelector('.inclusion-desc');
        if (t && incTitles[idx]) t.textContent = incTitles[idx];
        if (b && incBadges[idx]) b.textContent = incBadges[idx];
        if (d && incDescs[idx]) d.textContent = incDescs[idx];
      });
    }

    // Venue.html Group Headers
    document.querySelectorAll('.wrap > div > h3').forEach(function (h3) {
      var span = h3.querySelector('span');
      if (span) {
        if (!span.getAttribute('data-en')) span.setAttribute('data-en', span.textContent.trim());
        var en = span.getAttribute('data-en');
        if (en === 'Included Standard With Every Rental') {
          span.textContent = isEs ? 'Incluido de Manera Estándar con Cada Renta' : en;
        } else if (en === 'Additional Services (Available Extra Fee)') {
          span.textContent = isEs ? 'Servicios Adicionales (Disponibles con Costo Extra)' : en;
        }
      }
    });

    // Venue.html Specs Bar
    var specItems = document.querySelectorAll('.spec-item');
    if (specItems.length >= 4) {
      var specLabels = isEs ? ['Capacidad de Invitados', 'Renta y Cierre', 'Comida y Bebidas', 'Ubicación'] : ['Guest Capacity', 'Rental & Closing', 'Food & Drinks', 'Location'];
      var specSubs = isEs ? ['Ambiente íntimo de salón', 'Hora estricta de cierre 11:30 PM', 'Traiga sus platillos y pastel', 'Condado de Kendall y alrededores'] : ['Intimate salon setting', 'Strict 11:30 PM closing time', 'Bring your own dishes & cake', 'Kendall County & surrounds'];
      specItems.forEach(function (si, idx) {
        var lbl = si.querySelector('.spec-label');
        var sub = si.querySelector('.spec-sub');
        if (lbl && specLabels[idx]) lbl.textContent = specLabels[idx];
        if (sub && specSubs[idx]) sub.textContent = specSubs[idx];
      });
    }

    // Venue.html Guidelines Box
    var vgCard = document.querySelector('.card[style*="border-left"]');
    if (vgCard) {
      var vgEye = vgCard.querySelector('.eyebrow');
      var vgH3 = vgCard.querySelector('h3');
      var vgPs = vgCard.querySelectorAll('p');
      if (vgEye) {
        if (!vgEye.getAttribute('data-en')) vgEye.setAttribute('data-en', vgEye.textContent.trim());
        vgEye.textContent = isEs ? 'Información de Renta' : vgEye.getAttribute('data-en');
      }
      if (vgH3) {
        if (!vgH3.getAttribute('data-en')) vgH3.setAttribute('data-en', vgH3.textContent.trim());
        vgH3.textContent = isEs ? 'Pautas del Salón y Notas Importantes' : vgH3.getAttribute('data-en');
      }
      if (vgPs.length >= 6) {
        var vgEsHtml = [
          '<strong style="color:var(--white)">Horario de Renta y Cierre Estricto:</strong> Las celebraciones se realizan a partir de las 5:00 PM con una hora estricta de cierre a las 11:30 PM. Toda la música, festejos y salida de invitados debe concluir puntualmente a las 11:30 PM.',
          '<strong style="color:var(--white)">Depósito de Seguridad:</strong> Se requiere un depósito de seguridad al reservar para confirmar y apartar la fecha de su celebración. Los detalles de precios y depósito se brindan al solicitar su cotización.',
          '<strong style="color:var(--white)">Requisitos de Entrega y Devolución del Depósito:</strong> Para recibir la totalidad de su depósito de regreso, el salón debe entregarse exactamente en las mismas condiciones en que fue recibido. Toda la basura debe ser retirada de las instalaciones y todos los botes de basura deben vaciarse, incluidos los de los baños. Las mesas y sillas deben dejarse organizadas.',
          '<strong style="color:var(--white)">Decoraciones y Cuidado de Superficies:</strong> Todas las decoraciones DEBEN retirarse de techos y paredes. Está estrictamente prohibido usar clavos, grapas, chinches o tachuelas ya que dañan las superficies o arrancan la pintura.',
          '<strong style="color:var(--white)">Artículos Prohibidos y Daños:</strong> La pirotecnia y fuegos artificiales de cualquier tipo están estrictamente prohibidos en la propiedad. Cualquier daño al mobiliario, manteles, paredes o equipo del salón puede resultar en la retención parcial o total del depósito.',
          '<strong style="color:var(--white)">Inspección y Reembolso:</strong> El depósito de seguridad será devuelto oportunamente después de la inspección posterior al evento, siempre que se hayan cumplido todas las condiciones de renta.',
          '<strong style="color:var(--white)">Comodidades Incluidas y Servicios Adicionales:</strong> Cada renta incluye mesas, sillas y manteles limpios. Los servicios adicionales —incluyendo calentadores de comida comerciales, sistema de sonido para fiestas, decoración personalizada de mesas y fondos temáticos con globos— están disponibles con costo extra bajo solicitud.',
          '<strong style="color:var(--white)">Capacidad de Invitados y Banquete:</strong> Nuestro salón alberga cómodamente hasta un máximo de 75 invitados para seguridad y cumplimiento de normativas. Los anfitriones pueden traer comida externa, platillos familiares, pastel y bebidas.'
        ];
        vgPs.forEach(function (p, idx) {
          if (vgEsHtml[idx]) {
            if (!p.getAttribute('data-en-html')) p.setAttribute('data-en-html', p.innerHTML);
            p.innerHTML = isEs ? vgEsHtml[idx] : p.getAttribute('data-en-html');
          }
        });
      }
    }

    // Contact.html Additional Services Checkboxes Translation
    document.querySelectorAll('.field--full > label').forEach(function (lbl) {
      if (lbl.textContent.indexOf('Additional Services') !== -1 || lbl.textContent.indexOf('Servicios Adicionales') !== -1) {
        lbl.textContent = isEs ? 'Servicios Adicionales Solicitados (Opcionales)' : 'Additional Services Requested (Optional Add-Ons)';
      }
    });
    var addonChecks = document.querySelectorAll('input[name^="addon_"]');
    if (addonChecks.length >= 4) {
      var addonLabels = isEs ? ['Calentadores de Comida', 'Sistema de Sonido', 'Decoración de Mesas', 'Globos y Fondos'] : ['Food Warmers', 'Sound System', 'Table Decorations', 'Balloons & Backdrops'];
      addonChecks.forEach(function (chk, idx) {
        var span = chk.nextElementSibling;
        if (span && addonLabels[idx]) span.textContent = addonLabels[idx];
      });
    }

    // 10.5 Phone Sub-labels (Text Only / Solo texto)
    document.querySelectorAll('.phone-sub-label').forEach(function (el) {
      el.textContent = isEs ? '(Solo texto)' : '(Text Only)';
    });

    // 11. CTA Band
    var ctaBandH2 = document.querySelector('.cta-band h2');
    var ctaBandP = document.querySelector('.cta-band p');
    var ctaBandBtn = document.querySelector('.cta-band .btn');
    if (ctaBandH2) {
      if (!ctaBandH2.getAttribute('data-en')) ctaBandH2.setAttribute('data-en', ctaBandH2.textContent.trim());
      ctaBandH2.textContent = isEs ? (document.querySelector('.faq-wrap') ? 'Precios según su Tipo de Evento y Fecha' : '¿Preguntas o Desea Consultar una Fecha?') : ctaBandH2.getAttribute('data-en');
    }
    if (ctaBandP) {
      if (!ctaBandP.getAttribute('data-en')) ctaBandP.setAttribute('data-en', ctaBandP.textContent.trim());
      ctaBandP.textContent = isEs ? 'Comuníquese con nosotros con su fecha estimada y número de invitados (hasta 75 personas). Le proporcionaremos una cotización personalizada.' : ctaBandP.getAttribute('data-en');
    }
    if (ctaBandBtn) {
      if (!ctaBandBtn.getAttribute('data-en')) ctaBandBtn.setAttribute('data-en', ctaBandBtn.textContent.trim());
      ctaBandBtn.textContent = isEs ? 'Solicitar Información' : ctaBandBtn.getAttribute('data-en');
    }

    // 12. Footer
    var footerBrandP = document.querySelector('.footer-brand + p');
    if (footerBrandP) {
      if (!footerBrandP.getAttribute('data-en')) footerBrandP.setAttribute('data-en', footerBrandP.textContent.trim());
      footerBrandP.textContent = isEs ? 'Un salón íntimo de fiestas y recepciones en Plano, IL. Espacio versátil para celebraciones de hasta 75 invitados.' : footerBrandP.getAttribute('data-en');
    }
    var footerH4s = document.querySelectorAll('.footer-grid h4');
    if (footerH4s.length >= 3) {
      var f4Titles = isEs ? ['Enlaces Rápidos', 'Contacto', 'Horario de Renta y Consultas'] : ['Quick Links', 'Contact', 'Rental Hours & Inquiries'];
      footerH4s.forEach(function (h4, idx) {
        if (f4Titles[idx]) h4.textContent = f4Titles[idx];
      });
    }

    // 13. Floating SMS Prompt Card
    var smsPromptCard = document.getElementById('sms-prompt-card');
    if (smsPromptCard) {
      var smsTitle = smsPromptCard.querySelector('.sms-prompt-title');
      var smsSub = smsPromptCard.querySelector('.sms-prompt-sub');
      var smsBody = smsPromptCard.querySelector('.sms-prompt-body');
      var smsBtnSend = smsPromptCard.querySelector('.sms-btn-send span');

      if (smsTitle) smsTitle.textContent = 'JVL Venue';
      if (smsSub) smsSub.textContent = isEs ? '(Solo Texto) · (331) 330-1259' : '(Text Only) · (331) 330-1259';
      if (smsBody) {
        smsBody.innerHTML = isEs
          ? '¿Desea enviar un mensaje de texto directo a nuestra coordinadora al <strong>(331) 330-1259</strong> para consultar fechas o hacer preguntas?'
          : 'Would you like to send a direct text message to our venue coordinator at <strong>(331) 330-1259</strong> to check dates or ask questions?';
      }
      if (smsBtnSend) smsBtnSend.textContent = isEs ? 'Enviar Mensaje de Texto' : 'Send Text Message';
    }

    try {
      localStorage.setItem('jvl_language', lang);
    } catch (e) {}

    // Keep theme button labels in sync with language
    if (typeof updateThemeButtonLabels === 'function') {
      updateThemeButtonLabels();
    }
  }

  // Toggle button event listeners
  document.querySelectorAll('.lang-toggle-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      currentLang = currentLang === 'es' ? 'en' : 'es';
      applyLanguage(currentLang);
    });
  });

  // Apply on initial load if saved language is Spanish
  if (currentLang === 'es') {
    applyLanguage('es');
  }

  // ---------- Floating SMS Prompt Card Interactions ----------
  var smsBtn = document.getElementById('floating-sms-btn');
  var smsCard = document.getElementById('sms-prompt-card');
  var smsClose = document.getElementById('sms-prompt-close');

  if (smsBtn && smsCard) {
    function openSmsPrompt() {
      smsCard.classList.add('open');
    }

    function closeSmsPrompt() {
      smsCard.classList.remove('open');
      try {
        sessionStorage.setItem('jvl_sms_dismissed', 'true');
      } catch (e) {}
    }

    if (smsClose) {
      smsClose.addEventListener('click', function (e) {
        e.stopPropagation();
        closeSmsPrompt();
      });
    }

    // Close when clicking outside the widget
    document.addEventListener('click', function (e) {
      if (!smsCard.contains(e.target) && !smsBtn.contains(e.target)) {
        if (smsCard.classList.contains('open')) {
          closeSmsPrompt();
        }
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && smsCard.classList.contains('open')) {
        closeSmsPrompt();
      }
    });

    // Automatically prompt visitor after 2.5 seconds on first visit
    var isDismissed = false;
    try {
      isDismissed = sessionStorage.getItem('jvl_sms_dismissed') === 'true';
    } catch (e) {}

    if (!isDismissed) {
      setTimeout(function () {
        openSmsPrompt();
      }, 2500);
    }
  }

  // Ensure Light Theme is active by default
  document.documentElement.classList.add('theme-light');
  document.body.classList.add('theme-light');
});



