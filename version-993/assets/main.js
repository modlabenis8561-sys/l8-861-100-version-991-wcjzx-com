(function () {
  var navToggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-main-nav]');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;
  function showSlide(index) {
    if (!slides.length) return;
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === activeIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === activeIndex);
    });
  }
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });
  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-global-search]');
  var searchResults = document.querySelector('[data-search-results]');
  function renderSearch(query) {
    if (!searchResults) return;
    var keyword = query.trim().toLowerCase();
    if (!keyword) {
      searchResults.innerHTML = '';
      return;
    }
    var list = (window.SITE_MOVIES || []).filter(function (item) {
      return item.text.toLowerCase().indexOf(keyword) !== -1;
    }).slice(0, 18);
    searchResults.innerHTML = list.length ? list.map(function (item) {
      return '<a class="search-result-item" href="' + item.url + '"><img src="' + item.image + '" alt="' + item.title.replace(/"/g, '&quot;') + '"><span><strong>' + item.title + '</strong><span>' + item.meta + '</span><span>' + item.line + '</span></span></a>';
    }).join('') : '<div class="search-result-item"><span></span><span><strong>暂无匹配影片</strong><span>请尝试其他关键词</span></span></div>';
  }
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      renderSearch(searchInput.value);
    });
  }

  var localSearch = document.querySelector('[data-local-search]');
  var filterGroup = document.querySelector('[data-filter-group]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var activeFilter = 'all';
  function applyLocalFilter() {
    var keyword = localSearch ? localSearch.value.trim().toLowerCase() : '';
    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search-text') || '').toLowerCase();
      var type = card.getAttribute('data-type') || '';
      var typeMatched = activeFilter === 'all' || type.indexOf(activeFilter) !== -1;
      var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
      card.classList.toggle('is-hidden', !(typeMatched && keywordMatched));
    });
  }
  if (localSearch) {
    localSearch.addEventListener('input', applyLocalFilter);
  }
  if (filterGroup) {
    filterGroup.addEventListener('click', function (event) {
      var button = event.target.closest('[data-filter]');
      if (!button) return;
      activeFilter = button.getAttribute('data-filter') || 'all';
      Array.prototype.slice.call(filterGroup.querySelectorAll('[data-filter]')).forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      applyLocalFilter();
    });
  }
})();
