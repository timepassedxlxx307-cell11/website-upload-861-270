(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.getElementById('siteNav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
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

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-field]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var search = document.querySelector('[data-card-search]');
    var emptyState = document.querySelector('[data-empty-state]');
    var active = {
      field: 'all',
      value: 'all'
    };

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var keyword = normalize(search ? search.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var fieldMatched = active.field === 'all' || normalize(card.getAttribute('data-' + active.field)).indexOf(normalize(active.value)) !== -1;
        var title = normalize(card.getAttribute('data-title'));
        var genre = normalize(card.getAttribute('data-genre'));
        var region = normalize(card.getAttribute('data-region'));
        var textMatched = !keyword || title.indexOf(keyword) !== -1 || genre.indexOf(keyword) !== -1 || region.indexOf(keyword) !== -1;
        var show = fieldMatched && textMatched;

        card.style.display = show ? '' : 'none';

        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('is-active');
        });

        button.classList.add('is-active');
        active.field = button.getAttribute('data-filter-field');
        active.value = button.getAttribute('data-filter-value');
        applyFilter();
      });
    });

    if (search) {
      search.addEventListener('input', applyFilter);
    }
  }
}());
