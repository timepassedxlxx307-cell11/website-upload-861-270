(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        var timer = null;

        function activate(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var value = Number(dot.getAttribute("data-hero-dot"));
                activate(value);
                startTimer();
            });
        });

        startTimer();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function filterCards(cards, query, type) {
        var words = normalize(query).split(/\s+/).filter(Boolean);
        var selectedType = normalize(type);
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags")
            ].join(" "));
            var cardType = normalize(card.getAttribute("data-type"));
            var matchedWords = words.every(function (word) {
                return haystack.indexOf(word) !== -1;
            });
            var matchedType = !selectedType || cardType === selectedType;
            var show = matchedWords && matchedType;

            card.style.display = show ? "" : "none";

            if (show) {
                visible += 1;
            }
        });

        return visible;
    }

    var catalogGrid = document.querySelector("[data-catalog-grid]");

    if (catalogGrid) {
        var catalogCards = Array.prototype.slice.call(catalogGrid.querySelectorAll("[data-filter-card]"));
        var catalogSearch = document.querySelector("[data-catalog-search]");
        var catalogType = document.querySelector("[data-catalog-type]");
        var emptyState = document.querySelector("[data-empty-state]");

        function applyCatalogFilter() {
            var visible = filterCards(
                catalogCards,
                catalogSearch ? catalogSearch.value : "",
                catalogType ? catalogType.value : ""
            );

            if (emptyState) {
                emptyState.classList.toggle("show", visible === 0);
            }
        }

        if (catalogSearch) {
            catalogSearch.addEventListener("input", applyCatalogFilter);
        }

        if (catalogType) {
            catalogType.addEventListener("change", applyCatalogFilter);
        }
    }

    var searchGrid = document.querySelector("[data-search-grid]");

    if (searchGrid) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var searchInput = document.querySelector("[data-search-input]");
        var searchSummary = document.querySelector("[data-search-summary]");
        var searchEmpty = document.querySelector("[data-search-empty]");
        var searchCards = Array.prototype.slice.call(searchGrid.querySelectorAll("[data-filter-card]"));

        if (searchInput) {
            searchInput.value = query;
        }

        function applySearch() {
            var currentQuery = searchInput ? searchInput.value : query;
            var visible = filterCards(searchCards, currentQuery, "");

            if (searchSummary) {
                searchSummary.textContent = currentQuery ? "搜索结果" : "片库推荐";
            }

            if (searchEmpty) {
                searchEmpty.classList.toggle("show", visible === 0);
            }
        }

        if (searchInput) {
            searchInput.addEventListener("input", applySearch);
        }

        applySearch();
    }
})();
