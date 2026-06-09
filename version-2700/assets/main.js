(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var opened = nav.classList.toggle("is-open");
            button.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
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

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function textOf(card) {
        return [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-tags") || "",
            card.textContent || ""
        ].join(" ").toLowerCase();
    }

    function initSearch() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-live-search-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-live-search]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            var empty = scope.querySelector("[data-empty-message]");
            var activeField = "all";
            var activeValue = "";
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-buttons] button"));

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var matchesText = !query || textOf(card).indexOf(query) !== -1;
                    var matchesButton = true;
                    if (activeValue) {
                        var haystack = activeField === "all" ? textOf(card) : (card.getAttribute("data-" + activeField) || "").toLowerCase();
                        matchesButton = haystack.indexOf(activeValue.toLowerCase()) !== -1;
                    }
                    var matched = matchesText && matchesButton;
                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    buttons.forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    button.classList.add("is-active");
                    activeField = button.getAttribute("data-filter-field") || "all";
                    activeValue = button.getAttribute("data-filter-value") || "";
                    apply();
                });
            });
            apply();
        });
    }

    function initPlayer() {
        var shell = document.querySelector("[data-player]");
        if (!shell) {
            return;
        }
        var video = shell.querySelector("video");
        var overlay = shell.querySelector(".player-overlay");
        if (!video) {
            return;
        }
        var url = video.getAttribute("data-stream") || "";
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached || !url) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
                attached = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
                attached = true;
                return;
            }
            video.src = url;
            attached = true;
        }

        function playVideo() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", playVideo);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("ended", function () {
            if (overlay) {
                overlay.classList.remove("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initSearch();
        initPlayer();
    });
})();
