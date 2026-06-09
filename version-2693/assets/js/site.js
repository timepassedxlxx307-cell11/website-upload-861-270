(function () {
    function closestFormSearch(form) {
        var input = form.querySelector('input[name="q"]');
        if (!input) {
            return;
        }
        form.addEventListener('submit', function (event) {
            var value = input.value.trim();
            if (!value) {
                event.preventDefault();
                input.focus();
            }
        });
    }

    function setupMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var nav = document.querySelector('.nav-links');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            var opened = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide')) || 0);
                play();
            });
        });

        play();
    }

    function setupFilters() {
        var grid = document.querySelector('.filter-grid');
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var input = document.querySelector('.filter-input');
        var selects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));
        var empty = document.querySelector('.empty-state');

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function matchesSelect(card, select) {
            var value = normalize(select.value);
            if (!value) {
                return true;
            }
            var field = select.getAttribute('data-filter');
            var cardValue = normalize(card.getAttribute('data-' + field));
            return cardValue.indexOf(value) !== -1;
        }

        function update() {
            var keyword = normalize(input ? input.value : '');
            var visibleCount = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.textContent
                ].join(' '));
                var visible = (!keyword || haystack.indexOf(keyword) !== -1) && selects.every(function (select) {
                    return matchesSelect(card, select);
                });
                card.hidden = !visible;
                if (visible) {
                    visibleCount += 1;
                }
            });
            if (empty) {
                empty.hidden = visibleCount !== 0;
            }
        }

        if (input) {
            input.addEventListener('input', update);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', update);
        });
    }

    function movieCardTemplate(movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card">',
            '    <a class="poster-link" href="' + escapeHtml(movie.file) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <h2><a href="' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h2>',
            '        <p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genre) + '</p>',
            '        <p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>',
            '        <div class="tag-row">' + tags + '</div>',
            '    </div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupSearchPage() {
        var results = document.getElementById('searchResults');
        var input = document.getElementById('searchPageInput');
        var title = document.getElementById('searchTitle');
        var empty = document.getElementById('searchEmpty');
        if (!results || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        if (input) {
            input.value = query;
        }
        var normalized = query.toLowerCase();
        var matched = window.SEARCH_MOVIES.filter(function (movie) {
            if (!normalized) {
                return false;
            }
            return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(' '), movie.oneLine].join(' ').toLowerCase().indexOf(normalized) !== -1;
        }).slice(0, 120);

        if (title) {
            title.textContent = query ? '搜索结果：' + query : '输入关键词开始搜索';
        }
        results.innerHTML = matched.map(movieCardTemplate).join('');
        if (empty) {
            empty.hidden = Boolean(matched.length) || !query;
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
        Array.prototype.slice.call(document.querySelectorAll('form.site-search, form.large-search')).forEach(closestFormSearch);
    });
}());
