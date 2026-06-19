(function () {
    var base = document.body ? document.body.getAttribute('data-base') || '' : '';
    var movies = Array.isArray(window.SG_MOVIES) ? window.SG_MOVIES : [];

    function $(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function text(value) {
        return String(value || '').replace(/[&<>"]/g, function (item) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[item];
        });
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function resultItem(movie) {
        return '<a class="search-result" href="' + base + text(movie.url) + '">' +
            '<img src="' + base + text(movie.image) + '" alt="' + text(movie.title) + '">' +
            '<span><strong>' + text(movie.title) + '</strong>' +
            '<span>' + text(movie.region) + ' · ' + text(movie.year) + ' · ' + text(movie.type) + '</span>' +
            '<span>' + text(movie.line) + '</span></span></a>';
    }

    function renderSearch(input, box) {
        var query = normalize(input.value);
        if (!query) {
            box.innerHTML = '';
            return;
        }
        var hits = movies.filter(function (movie) {
            var content = [movie.title, movie.region, movie.year, movie.type, movie.genre, movie.line, (movie.tags || []).join(' ')].join(' ');
            return normalize(content).indexOf(query) !== -1;
        }).slice(0, 18);
        box.innerHTML = hits.length ? hits.map(resultItem).join('') : '<div class="search-result"><span><strong>未找到相关影片</strong><span>换一个关键词试试</span></span></div>';
    }

    function bindSearch(input) {
        var scope = input.closest('.search-panel-card') || input.parentElement;
        var box = scope ? scope.querySelector('[data-search-results]') : null;
        if (!box && input.nextElementSibling && input.nextElementSibling.matches('[data-search-results]')) {
            box = input.nextElementSibling;
        }
        if (!box) {
            return;
        }
        input.addEventListener('input', function () {
            renderSearch(input, box);
        });
    }

    $('[data-global-search]').forEach(bindSearch);

    var panel = document.querySelector('[data-search-panel]');
    var openButtons = $('[data-search-open]');
    var closeButtons = $('[data-search-close]');
    openButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            if (panel) {
                panel.hidden = false;
                var input = panel.querySelector('[data-global-search]');
                if (input) {
                    input.focus();
                }
            }
        });
    });
    closeButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            if (panel) {
                panel.hidden = true;
            }
        });
    });
    if (panel) {
        panel.addEventListener('click', function (event) {
            if (event.target === panel) {
                panel.hidden = true;
            }
        });
    }

    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.hidden = !mobileNav.hidden;
        });
    }

    var slides = $('[data-hero-slide]');
    var dots = $('[data-hero-dot]');
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
    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var filterInput = document.querySelector('[data-local-filter]');
    var cardGrid = document.querySelector('[data-card-grid]');
    var cards = cardGrid ? $('[data-card]', cardGrid) : [];
    var activeChip = '';

    function applyLocalFilter() {
        var query = normalize(filterInput ? filterInput.value : '');
        cards.forEach(function (card) {
            var content = [card.getAttribute('data-title'), card.getAttribute('data-region'), card.getAttribute('data-year'), card.getAttribute('data-genre'), card.getAttribute('data-type')].join(' ');
            var matchQuery = !query || normalize(content).indexOf(query) !== -1;
            var matchChip = !activeChip || normalize(content).indexOf(normalize(activeChip)) !== -1;
            card.hidden = !(matchQuery && matchChip);
        });
    }

    if (filterInput) {
        filterInput.addEventListener('input', applyLocalFilter);
    }
    $('[data-local-chip]').forEach(function (chip) {
        chip.addEventListener('click', function () {
            if (activeChip === chip.getAttribute('data-local-chip')) {
                activeChip = '';
                chip.classList.remove('is-active');
            } else {
                $('[data-local-chip]').forEach(function (item) {
                    item.classList.remove('is-active');
                });
                activeChip = chip.getAttribute('data-local-chip') || '';
                chip.classList.add('is-active');
            }
            applyLocalFilter();
        });
    });
})();
