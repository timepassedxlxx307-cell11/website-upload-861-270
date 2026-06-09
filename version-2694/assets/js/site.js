(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuToggle = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", mobilePanel.classList.contains("is-open"));
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = all(".hero-slide", hero);
    var dots = all(".hero-dot", hero);
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 6200);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applyFilter(root) {
    var input = root.querySelector("[data-search-input]");
    var activeChip = root.querySelector(".filter-chip.is-active");
    var query = normalize(input ? input.value : "");
    var chip = activeChip ? normalize(activeChip.getAttribute("data-filter-value")) : "";
    all("[data-title]", root).forEach(function (card) {
      var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-meta"));
      var matchText = !query || haystack.indexOf(query) !== -1;
      var matchChip = !chip || haystack.indexOf(chip) !== -1;
      card.classList.toggle("hidden-card", !(matchText && matchChip));
    });
  }

  all("[data-filter-root]").forEach(function (root) {
    var input = root.querySelector("[data-search-input]");
    var chips = all(".filter-chip", root);

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && !input.value) {
        input.value = q;
      }
      input.addEventListener("input", function () {
        applyFilter(root);
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        applyFilter(root);
      });
    });

    applyFilter(root);
  });

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
    script.onload = callback;
    document.head.appendChild(script);
  }

  function startPlayer(shell) {
    var video = shell.querySelector("video");
    var stream = shell.getAttribute("data-stream");

    if (!video || !stream) {
      return;
    }

    shell.classList.add("is-ready");

    function play() {
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (video.getAttribute("data-loaded") === "1") {
      play();
      return;
    }

    video.setAttribute("data-loaded", "1");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      play();
      return;
    }

    loadHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          maxBufferLength: 30
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          play();
        });
      } else {
        video.src = stream;
        play();
      }
    });
  }

  all(".player-shell").forEach(function (shell) {
    var cover = shell.querySelector("[data-play-button]");
    var video = shell.querySelector("video");

    if (cover) {
      cover.addEventListener("click", function () {
        startPlayer(shell);
      });
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayer(shell);
        }
      });
    }
  });
})();
