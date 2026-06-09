(function () {
  var input = document.querySelector('[data-search-input]');
  var form = document.querySelector('[data-search-form]');
  var results = document.querySelector('[data-search-results]');
  var empty = document.querySelector('[data-search-empty]');

  if (!input || !results) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  input.value = query;

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function renderCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-glow"></span>',
      '<span class="play-chip">▶</span>',
      '<span class="score-badge">' + escapeHtml(movie.rating) + '</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p class="movie-line">' + escapeHtml(movie.line) + '</p>',
      '<div class="movie-tags">' + tags + '</div>',
      '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function render() {
    var keyword = normalize(input.value);
    var movies = window.SITE_MOVIES || [];
    var found = movies.filter(function (movie) {
      if (!keyword) {
        return true;
      }

      return normalize(movie.title).indexOf(keyword) !== -1 ||
        normalize(movie.region).indexOf(keyword) !== -1 ||
        normalize(movie.type).indexOf(keyword) !== -1 ||
        normalize(movie.genre).indexOf(keyword) !== -1 ||
        normalize((movie.tags || []).join(' ')).indexOf(keyword) !== -1 ||
        normalize(movie.category).indexOf(keyword) !== -1;
    }).slice(0, 120);

    results.innerHTML = found.map(renderCard).join('');

    if (empty) {
      empty.classList.toggle('is-visible', found.length === 0);
    }
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
      var nextUrl = input.value ? './search.html?q=' + encodeURIComponent(input.value) : './search.html';
      window.history.replaceState(null, '', nextUrl);
    });
  }

  input.addEventListener('input', render);
  render();
}());
