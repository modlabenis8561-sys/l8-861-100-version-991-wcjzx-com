(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle("is-active", idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle("is-active", idx === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, idx) {
            dot.addEventListener("click", function () {
                show(idx);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilterPage() {
        var page = document.querySelector("[data-filter-page]");
        if (!page) {
            return;
        }
        var keyword = page.querySelector("[data-filter-keyword]");
        var region = page.querySelector("[data-filter-region]");
        var type = page.querySelector("[data-filter-type]");
        var year = page.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(page.querySelectorAll("[data-movie-card]"));
        var empty = page.querySelector("[data-empty-state]");

        function value(el) {
            return el ? el.value.trim().toLowerCase() : "";
        }

        function update() {
            var q = value(keyword);
            var r = value(region);
            var t = value(type);
            var y = value(year);
            var shown = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(" ").toLowerCase();
                var matched = true;
                if (q && haystack.indexOf(q) === -1) {
                    matched = false;
                }
                if (r && (card.dataset.region || "").toLowerCase() !== r) {
                    matched = false;
                }
                if (t && (card.dataset.type || "").toLowerCase().indexOf(t) === -1) {
                    matched = false;
                }
                if (y && (card.dataset.year || "").toLowerCase() !== y) {
                    matched = false;
                }
                card.hidden = !matched;
                if (matched) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.hidden = shown !== 0;
            }
        }

        [keyword, region, type, year].forEach(function (item) {
            if (item) {
                item.addEventListener("input", update);
                item.addEventListener("change", update);
            }
        });
        update();
    }

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
            "<a class=\"movie-card\" href=\"" + escapeHtml(movie.url) + "\">",
            "<span class=\"poster-wrap\">",
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"poster-gradient\"></span>",
            "<span class=\"year-chip\">" + escapeHtml(movie.year) + "</span>",
            "</span>",
            "<span class=\"movie-card-body\">",
            "<span class=\"card-meta\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</span>",
            "<strong>" + escapeHtml(movie.title) + "</strong>",
            "<em>" + escapeHtml(movie.oneLine) + "</em>",
            "<span class=\"card-tags\">" + tags + "</span>",
            "</span>",
            "</a>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupSearchPage() {
        var form = document.querySelector("[data-search-page-form]");
        var input = document.querySelector("[data-search-input]");
        var results = document.querySelector("[data-search-results]");
        var empty = document.querySelector("[data-search-empty]");
        if (!form || !input || !results || !window.SEARCH_MOVIES) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;

        function render(query) {
            var q = query.trim().toLowerCase();
            var matches = window.SEARCH_MOVIES.filter(function (movie) {
                var haystack = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    (movie.tags || []).join(" "),
                    movie.oneLine
                ].join(" ").toLowerCase();
                return q ? haystack.indexOf(q) !== -1 : true;
            }).slice(0, q ? 120 : 60);
            results.innerHTML = matches.map(movieCard).join("");
            if (empty) {
                empty.hidden = matches.length !== 0;
            }
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var q = input.value.trim();
            var url = q ? "./search.html?q=" + encodeURIComponent(q) : "./search.html";
            window.history.replaceState(null, "", url);
            render(q);
        });
        input.addEventListener("input", function () {
            render(input.value);
        });
        render(initial);
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilterPage();
        setupSearchPage();
    });
})();
