(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initSearchForms() {
        document.querySelectorAll(".site-search-form, .search-page-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q'], input[type='search']");
                if (!input) {
                    return;
                }
                var query = input.value.trim();
                if (!query) {
                    event.preventDefault();
                    input.focus();
                    return;
                }
                event.preventDefault();
                window.location.href = "./search.html?q=" + encodeURIComponent(query);
            });
        });
    }

    function initHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
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
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        start();
    }

    function initRails() {
        document.querySelectorAll(".rail-wrap").forEach(function (wrap) {
            var rail = wrap.querySelector("[data-rail]");
            if (!rail) {
                return;
            }
            var prev = wrap.querySelector("[data-rail-prev]");
            var next = wrap.querySelector("[data-rail-next]");
            var amount = 420;
            if (prev) {
                prev.addEventListener("click", function () {
                    rail.scrollBy({ left: -amount, behavior: "smooth" });
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    rail.scrollBy({ left: amount, behavior: "smooth" });
                });
            }
        });
    }

    function initFilters() {
        var list = document.querySelector("[data-filter-list]");
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
        var keyword = document.querySelector("[data-filter-keyword]");
        var region = document.querySelector("[data-filter-region]");
        var type = document.querySelector("[data-filter-type]");
        var year = document.querySelector("[data-filter-year]");
        var empty = document.querySelector("[data-filter-empty]");

        function value(node) {
            return node ? node.value.trim().toLowerCase() : "";
        }

        function apply() {
            var q = value(keyword);
            var r = value(region);
            var t = value(type);
            var y = value(year);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-tags"),
                    card.textContent
                ].join(" ").toLowerCase();
                var matched = true;
                if (q && haystack.indexOf(q) === -1) {
                    matched = false;
                }
                if (r && String(card.getAttribute("data-region") || "").toLowerCase() !== r) {
                    matched = false;
                }
                if (t && String(card.getAttribute("data-type") || "").toLowerCase() !== t) {
                    matched = false;
                }
                if (y && String(card.getAttribute("data-year") || "").toLowerCase() !== y) {
                    matched = false;
                }
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [keyword, region, type, year].forEach(function (node) {
            if (!node) {
                return;
            }
            node.addEventListener("input", apply);
            node.addEventListener("change", apply);
        });
    }

    function movieCard(movie) {
        var tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 3) : [];
        return [
            '<article class="movie-card" data-movie-card>',
            '<a class="movie-card-link" href="' + escapeHtml(movie.url) + '">',
            '<span class="poster-wrap">',
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="year-chip">' + escapeHtml(movie.year) + '</span>',
            '</span>',
            '<span class="card-body">',
            '<strong>' + escapeHtml(movie.title) + '</strong>',
            '<span class="card-line">' + escapeHtml(movie.oneLine) + '</span>',
            '<span class="card-meta"><em>' + escapeHtml(movie.region) + '</em><em>' + escapeHtml(movie.type) + '</em></span>',
            '<span class="tag-row">' + tags.map(function (tag) { return '<span class="tag">' + escapeHtml(tag) + '</span>'; }).join('') + '</span>',
            '</span>',
            '</a>',
            '</article>'
        ].join('');
    }

    function initSearchPage() {
        var results = document.getElementById("searchResults");
        if (!results || typeof SITE_MOVIES === "undefined") {
            return;
        }
        var input = document.querySelector("[data-search-page-input]");
        var empty = document.getElementById("searchEmpty");
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        if (input) {
            input.value = query;
        }
        var source = SITE_MOVIES;
        var list = query ? source.filter(function (movie) {
            var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, movie.category, (movie.tags || []).join(" ")].join(" ").toLowerCase();
            return haystack.indexOf(query.toLowerCase()) !== -1;
        }) : source.slice(0, 24);
        results.innerHTML = list.map(movieCard).join("");
        if (empty) {
            empty.hidden = list.length !== 0;
        }
    }

    ready(function () {
        initMenu();
        initSearchForms();
        initHero();
        initRails();
        initFilters();
        initSearchPage();
    });
})();
