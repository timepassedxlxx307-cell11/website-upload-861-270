(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var input = document.querySelector('[data-filter-input]');
    var select = document.querySelector('[data-filter-category]');
    var grid = document.querySelector('[data-filter-grid]');
    var result = document.querySelector('[data-filter-result]');
    if (!grid || (!input && !select)) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input && query) {
      input.value = query;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var category = select ? select.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var categories = (card.getAttribute('data-category') || '').split(/\s+/);
        var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
        var categoryMatch = !category || categories.indexOf(category) !== -1;
        var show = keywordMatch && categoryMatch;
        card.classList.toggle('is-hidden', !show);
        if (show) {
          visible += 1;
        }
      });
      if (result) {
        result.textContent = keyword || category ? '当前筛选结果：' + visible + ' 部' : '';
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (select) {
      select.addEventListener('change', apply);
    }
    apply();
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
  });
})();
