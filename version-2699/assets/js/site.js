(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    var startTimer = function () {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(index);
        startTimer();
      });
    });

    startTimer();
  }

  var listPage = document.querySelector('[data-list-page]');

  if (listPage) {
    var searchInput = listPage.querySelector('[data-page-search]');
    var cards = Array.prototype.slice.call(listPage.querySelectorAll('[data-card]'));
    var empty = listPage.querySelector('[data-empty-state]');
    var buttons = Array.prototype.slice.call(listPage.querySelectorAll('[data-filter]'));
    var activeFilter = 'all';
    var activeField = 'type';
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    var normalize = function (value) {
      return String(value || '').toLowerCase().trim();
    };

    var applyFilters = function () {
      var query = normalize(searchInput ? searchInput.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre')
        ].join(' '));
        var filterValue = normalize(card.getAttribute('data-' + activeField));
        var matchesText = !query || text.indexOf(query) !== -1;
        var matchesFilter = activeFilter === 'all' || filterValue.indexOf(normalize(activeFilter)) !== -1;
        var isVisible = matchesText && matchesFilter;

        card.style.display = isVisible ? '' : 'none';

        if (isVisible) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    if (searchInput) {
      searchInput.value = initialQuery;
      searchInput.addEventListener('input', applyFilters);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('is-active');
        });

        button.classList.add('is-active');
        activeFilter = button.getAttribute('data-filter') || 'all';
        activeField = button.getAttribute('data-filter-field') || 'type';
        applyFilters();
      });
    });

    applyFilters();
  }

  var hlsLoaderPromise = null;
  var hlsLibraryUrl = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';

  var loadHlsLibrary = function () {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoaderPromise) {
      return hlsLoaderPromise;
    }

    hlsLoaderPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = hlsLibraryUrl;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return hlsLoaderPromise;
  };

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var playButton = player.querySelector('[data-play-button]');
    var started = false;
    var hlsInstance = null;

    if (!video || !playButton) {
      return;
    }

    var source = video.getAttribute('data-stream');

    var showButton = function () {
      playButton.classList.remove('is-hidden');
    };

    var hideButton = function () {
      playButton.classList.add('is-hidden');
    };

    var attemptPlay = function () {
      hideButton();
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          showButton();
        });
      }
    };

    var attachHls = function () {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);

      if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, attemptPlay);
      }

      window.setTimeout(attemptPlay, 600);
    };

    var start = function () {
      if (!source) {
        return;
      }

      if (!started) {
        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          attemptPlay();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          attachHls();
          return;
        }

        loadHlsLibrary().then(function () {
          if (window.Hls && window.Hls.isSupported()) {
            attachHls();
          } else {
            video.src = source;
            attemptPlay();
          }
        }).catch(function () {
          video.src = source;
          attemptPlay();
        });

        return;
      }

      attemptPlay();
    };

    playButton.addEventListener('click', start);

    player.addEventListener('click', function (event) {
      if (event.target === video || event.target === player) {
        start();
      }
    });

    video.addEventListener('play', hideButton);

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        showButton();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  });
})();
