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

  // ---------- Hero video toggle ----------
  var videoToggle = document.querySelector('.hero-video-toggle');
  var heroVideo = document.querySelector('.hero-video--main');
  var iconPause = document.querySelector('.icon-pause');
  var iconPlay = document.querySelector('.icon-play');
  
  if (videoToggle && heroVideo) {
    videoToggle.addEventListener('click', function () {
      if (heroVideo.paused) {
        heroVideo.play();
        iconPause.style.display = 'block';
        iconPlay.style.display = 'none';
        videoToggle.setAttribute('aria-label', 'Pause video');
      } else {
        heroVideo.pause();
        iconPause.style.display = 'none';
        iconPlay.style.display = 'block';
        videoToggle.setAttribute('aria-label', 'Play video');
      }
    });
  }
});
