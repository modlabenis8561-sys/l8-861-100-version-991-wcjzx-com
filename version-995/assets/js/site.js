(function () {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mainNav = document.querySelector('[data-main-nav]');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      mainNav.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  const localFilter = document.querySelector('[data-local-filter]');

  if (localFilter) {
    const cards = Array.from(document.querySelectorAll('[data-title]'));
    const queryInput = localFilter.querySelector('[data-filter-query]');
    const regionSelect = localFilter.querySelector('[data-filter-region]');
    const typeSelect = localFilter.querySelector('[data-filter-type]');
    const yearSelect = localFilter.querySelector('[data-filter-year]');

    function filterCards() {
      const query = (queryInput && queryInput.value || '').trim().toLowerCase();
      const region = regionSelect && regionSelect.value || '';
      const type = typeSelect && typeSelect.value || '';
      const year = yearSelect && yearSelect.value || '';

      cards.forEach(function (card) {
        const text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags
        ].join(' ').toLowerCase();

        const matchesQuery = !query || text.indexOf(query) !== -1;
        const matchesRegion = !region || card.dataset.region === region;
        const matchesType = !type || card.dataset.type === type;
        const matchesYear = !year || card.dataset.year === year;

        card.style.display = matchesQuery && matchesRegion && matchesType && matchesYear ? '' : 'none';
      });
    }

    [queryInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });
  }

  const searchApp = document.querySelector('[data-search-app]');

  if (searchApp && Array.isArray(window.SEARCH_MOVIES)) {
    const queryInput = searchApp.querySelector('[data-search-query]');
    const categorySelect = searchApp.querySelector('[data-search-category]');
    const regionSelect = searchApp.querySelector('[data-search-region]');
    const typeSelect = searchApp.querySelector('[data-search-type]');
    const results = searchApp.querySelector('[data-search-results]');
    const urlQuery = new URLSearchParams(window.location.search).get('q') || '';

    if (queryInput && urlQuery) {
      queryInput.value = urlQuery;
    }

    function createCard(movie) {
      return [
        '<article class="movie-card">',
        '  <a href="' + movie.url + '" class="movie-card-link" title="' + escapeHtml(movie.title) + ' 在线观看">',
        '    <div class="poster-wrap">',
        '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '      <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
        '      <span class="play-mark">播放</span>',
        '    </div>',
        '    <div class="movie-card-body">',
        '      <h3>' + escapeHtml(movie.title) + '</h3>',
        '      <p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>',
        '      <div class="meta-row">',
        '        <span>' + escapeHtml(movie.region) + '</span>',
        '        <span>' + escapeHtml(movie.type) + '</span>',
        '        <span>' + escapeHtml(movie.category) + '</span>',
        '      </div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join('');
    }

    function renderSearch() {
      const query = (queryInput && queryInput.value || '').trim().toLowerCase();
      const category = categorySelect && categorySelect.value || '';
      const region = regionSelect && regionSelect.value || '';
      const type = typeSelect && typeSelect.value || '';

      const matched = window.SEARCH_MOVIES.filter(function (movie) {
        const text = movie.text.toLowerCase();
        const matchesQuery = !query || text.indexOf(query) !== -1;
        const matchesCategory = !category || movie.categorySlug === category;
        const matchesRegion = !region || movie.region === region;
        const matchesType = !type || movie.type === type;
        return matchesQuery && matchesCategory && matchesRegion && matchesType;
      }).slice(0, 120);

      if (!results) {
        return;
      }

      if (!matched.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配的影片，请尝试其他关键词或筛选条件。</div>';
        return;
      }

      results.innerHTML = '<div class="movie-grid">' + matched.map(createCard).join('') + '</div>';
    }

    [queryInput, categorySelect, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', renderSearch);
        control.addEventListener('change', renderSearch);
      }
    });

    renderSearch();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }
})();
