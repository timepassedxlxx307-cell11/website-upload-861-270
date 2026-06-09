(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function text(value) {
    return (value || "").toString().toLowerCase();
  }

  function escapeHtml(value) {
    return (value || "").toString().replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function initMobileNav() {
    var button = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(parseInt(dot.getAttribute("data-hero-dot"), 10));
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initFilters() {
    Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var region = scope.querySelector("[data-filter-region]");
      var year = scope.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card-filter]"));
      var empty = scope.querySelector("[data-filter-empty]");
      function apply() {
        var q = text(input && input.value);
        var regionValue = text(region && region.value);
        var yearValue = text(year && year.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre")
          ].join(" ").toLowerCase();
          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (regionValue && text(card.getAttribute("data-region")) !== regionValue) {
            ok = false;
          }
          if (yearValue && text(card.getAttribute("data-year")) !== yearValue) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }
      [input, region, year].forEach(function (node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function initPlayer() {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (root) {
      var video = root.querySelector("video[data-src]");
      var button = root.querySelector("[data-play-button]");
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute("data-src");
      var hls = null;
      var started = false;
      function load() {
        if (!source) {
          return;
        }
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        root.classList.add("is-playing");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.play().catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          return;
        }
        video.src = source;
        video.play().catch(function () {});
      }
      button.addEventListener("click", load);
      video.addEventListener("click", function () {
        if (!started) {
          load();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function makeSearchCard(movie) {
    return '<a class="movie-card" href="' + escapeHtml(movie.url) + '">' +
      '<span class="poster-wrap">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-shade"></span>' +
      '<span class="play-badge">▶</span>' +
      '<span class="duration-badge">' + escapeHtml(movie.duration) + '</span>' +
      '<span class="genre-badge">' + escapeHtml(movie.genre) + '</span>' +
      '</span>' +
      '<span class="card-copy">' +
      '<strong>' + escapeHtml(movie.title) + '</strong>' +
      '<em>' + escapeHtml(movie.oneLine) + '</em>' +
      '<span class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>★ ' + escapeHtml(movie.rating) + '</span></span>' +
      '<span class="card-tags">' + escapeHtml(movie.tags) + '</span>' +
      '</span>' +
      '</a>';
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var input = document.querySelector("[data-search-page-input]");
    var empty = document.querySelector("[data-search-empty]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }
    function render() {
      var q = text(input && input.value);
      var items = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
        return q ? haystack.indexOf(q) !== -1 : true;
      }).slice(0, 80);
      results.innerHTML = items.map(makeSearchCard).join("");
      if (empty) {
        empty.classList.toggle("is-visible", items.length === 0);
      }
    }
    if (input) {
      input.addEventListener("input", render);
    }
    render();
  }

  ready(function () {
    initMobileNav();
    initHero();
    initFilters();
    initPlayer();
    initSearchPage();
  });
})();
