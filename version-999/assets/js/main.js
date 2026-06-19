(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
            toggle.textContent = panel.classList.contains('is-open') ? '×' : '☰';
        });
    }

    function initBackTop() {
        var button = document.querySelector('[data-back-top]');
        if (!button) {
            return;
        }
        function sync() {
            if (window.scrollY > 320) {
                button.classList.add('is-visible');
            } else {
                button.classList.remove('is-visible');
            }
        }
        window.addEventListener('scroll', sync, { passive: true });
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        sync();
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('is-active', position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('is-active', position === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, position) {
            dot.addEventListener('click', function () {
                show(position);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initCardFilters() {
        selectAll('[data-filter-scope]').forEach(function (scope) {
            var list = scope.parentElement.querySelector('[data-filter-list]');
            if (!list) {
                return;
            }
            var input = scope.querySelector('[data-card-filter-input]');
            var year = scope.querySelector('[data-card-filter-year]');
            var type = scope.querySelector('[data-card-filter-type]');
            var cards = selectAll('[data-card]', list);
            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var yearValue = year ? year.value : '';
                var typeValue = type ? type.value : '';
                cards.forEach(function (card) {
                    var haystack = [card.dataset.title, card.dataset.year, card.dataset.type, card.dataset.region].join(' ').toLowerCase();
                    var passKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var passYear = !yearValue || card.dataset.year === yearValue;
                    var passType = !typeValue || (card.dataset.type || '').indexOf(typeValue) !== -1;
                    card.classList.toggle('is-hidden', !(passKeyword && passYear && passType));
                });
            }
            [input, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function buildSearchCard(movie) {
        return [
            '<a href="./' + movie.file + '" class="movie-card group">',
            '    <span class="movie-poster-wrap">',
            '        <img src="' + movie.cover + '" alt="' + movie.title + '" class="movie-poster">',
            '        <span class="movie-hover-play">▶</span>',
            '        <span class="movie-year-badge">' + movie.year + '</span>',
            '    </span>',
            '    <span class="movie-card-body">',
            '        <span class="movie-card-title">' + movie.title + '</span>',
            '        <span class="movie-card-desc">' + movie.oneLine + '</span>',
            '        <span class="movie-card-meta">',
            '            <span class="movie-category-pill">' + movie.category + '</span>',
            '            <span>' + movie.type + '</span>',
            '        </span>',
            '    </span>',
            '</a>'
        ].join('');
    }

    function initSearchPage() {
        var results = document.getElementById('searchResults');
        if (!results || !window.SITE_MOVIES) {
            return;
        }
        var input = document.querySelector('[data-search-input]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (input) {
            input.value = query;
        }
        var normalized = query.trim().toLowerCase();
        var pool = window.SITE_MOVIES;
        var matches = normalized ? pool.filter(function (movie) {
            return movie.searchText.indexOf(normalized) !== -1;
        }) : pool.slice(0, 80);
        results.innerHTML = matches.slice(0, 200).map(buildSearchCard).join('');
    }

    window.initMoviePlayer = function (sourceUrl) {
        var video = document.querySelector('[data-player-video]');
        var overlay = document.querySelector('[data-player-overlay]');
        if (!video || !sourceUrl) {
            return;
        }
        var ready = false;
        var hls = null;
        function attachSource() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }
        function play() {
            attachSource();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var action = video.play();
            if (action && typeof action.catch === 'function') {
                action.catch(function () {});
            }
        }
        if (overlay) {
            overlay.addEventListener('click', play);
        }
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove('is-hidden');
            }
        });
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initBackTop();
        initHero();
        initCardFilters();
        initSearchPage();
    });
})();
