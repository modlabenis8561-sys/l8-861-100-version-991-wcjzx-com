(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === index);
            });
            dots.forEach(function (dot, current) {
                if (current === index) {
                    dot.setAttribute("aria-current", "true");
                } else {
                    dot.removeAttribute("aria-current");
                }
            });
        }

        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, current) {
            dot.addEventListener("click", function () {
                show(current);
                schedule();
            });
        });

        schedule();
    }

    function initFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
        forms.forEach(function (form) {
            var searchInput = form.querySelector("[data-search-input]");
            var categoryFilter = form.querySelector("[data-category-filter]");
            var yearFilter = form.querySelector("[data-year-filter]");
            var scope = form.parentElement || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var emptyState = scope.querySelector("[data-empty-state]");

            function apply() {
                var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
                var category = categoryFilter ? categoryFilter.value : "";
                var year = yearFilter ? yearFilter.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = card.getAttribute("data-search") || "";
                    var cardCategory = card.getAttribute("data-category") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var matched = true;

                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (category && cardCategory !== category) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }

                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (emptyState) {
                    emptyState.hidden = visible !== 0;
                }
            }

            [searchInput, categoryFilter, yearFilter].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            var params = new URLSearchParams(window.location.search);
            if (searchInput && params.get("q")) {
                searchInput.value = params.get("q");
            }
            apply();
        });
    }

    function playVideo(video) {
        if (!video) {
            return;
        }
        var source = video.querySelector("source");
        var stream = source ? source.getAttribute("src") : video.getAttribute("src");
        if (!stream) {
            return;
        }
        if (video.dataset.ready === "true") {
            video.play().catch(function () {});
            return;
        }
        video.dataset.ready = "true";

        if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
            video.src = stream;
            video.play().catch(function () {});
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            video._hls = hls;
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            return;
        }

        video.src = stream;
        video.play().catch(function () {});
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector("[data-player-overlay]");

            function activate() {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                playVideo(video);
            }

            if (overlay) {
                overlay.addEventListener("click", activate);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.dataset.ready !== "true") {
                        activate();
                    }
                });
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
