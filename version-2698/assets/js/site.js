(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 520) {
        backTop.classList.add('is-visible');
      } else {
        backTop.classList.remove('is-visible');
      }
    });

    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
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
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter(input) {
    var query = normalize(input.value);
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-item'));
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.textContent
      ].join(' '));
      var matched = !query || text.indexOf(query) !== -1;
      card.setAttribute('hidden-by-filter', matched ? 'false' : 'true');
      if (matched) {
        visible += 1;
      }
    });

    var label = document.querySelector('[data-result-text]');
    if (label) {
      label.textContent = query ? (visible ? '已显示相关内容' : '未找到相关内容') : '全部内容';
    }
  }

  filterInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      applyFilter(input);
    });
  });

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var searchInput = searchPage.querySelector('[data-filter-input]');

    if (searchInput) {
      searchInput.value = query;
      applyFilter(searchInput);
    }
  }
})();
