(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function activate(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("active", current === index);
      });
    }

    function start() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        activate(Number(dot.getAttribute("data-slide") || 0));
        start();
      });
    });

    activate(0);
    start();
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector(".filter-input");
      var year = scope.querySelector(".filter-year");
      var category = scope.querySelector(".filter-category");
      var grid = scope.parentElement.querySelector(".filter-grid");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (input && query) {
        input.value = query;
      }

      function run() {
        var term = normalize(input ? input.value : "");
        var selectedYear = normalize(year ? year.value : "");
        var selectedCategory = normalize(category ? category.value : "");
        var visible = 0;
        cards.forEach(function (card) {
          var searchText = normalize(card.getAttribute("data-search"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardCategory = normalize(card.getAttribute("data-category"));
          var matched = true;
          if (term && searchText.indexOf(term) === -1) {
            matched = false;
          }
          if (selectedYear && cardYear !== selectedYear) {
            matched = false;
          }
          if (selectedCategory && cardCategory !== selectedCategory) {
            matched = false;
          }
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        grid.classList.toggle("is-empty", visible === 0);
      }

      [input, year, category].forEach(function (node) {
        if (node) {
          node.addEventListener("input", run);
          node.addEventListener("change", run);
        }
      });
      run();
    });
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
  });
})();
