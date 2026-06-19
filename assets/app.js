(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.getElementById("mobileMenu");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var opened = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function initHero() {
        var sliders = document.querySelectorAll("[data-hero-slider]");
        sliders.forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            if (slides.length <= 1) {
                return;
            }
            var current = 0;
            var timer = null;

            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    var active = slideIndex === current;
                    slide.classList.toggle("is-active", active);
                    slide.setAttribute("aria-hidden", active ? "false" : "true");
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function start() {
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    window.clearInterval(timer);
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });

            slider.addEventListener("mouseenter", function () {
                window.clearInterval(timer);
            });

            slider.addEventListener("mouseleave", start);
            show(0);
            start();
        });
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initFilters() {
        var scopes = document.querySelectorAll("[data-filter-scope]");
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var region = scope.querySelector("[data-filter-region]");
            var year = scope.querySelector("[data-filter-year]");
            var type = scope.querySelector("[data-filter-type]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-card"));
            var empty = scope.querySelector("[data-empty-state]");

            if (scope.hasAttribute("data-query-sync") && input) {
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q");
                if (q) {
                    input.value = q;
                }
            }

            function apply() {
                var qValue = normalize(input && input.value);
                var regionValue = normalize(region && region.value);
                var yearValue = normalize(year && year.value);
                var typeValue = normalize(type && type.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var matchText = !qValue || haystack.indexOf(qValue) !== -1;
                    var matchRegion = !regionValue || normalize(card.getAttribute("data-region")) === regionValue;
                    var matchYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
                    var matchType = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
                    var show = matchText && matchRegion && matchYear && matchType;
                    card.hidden = !show;
                    if (show) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, region, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            apply();
        });
    }

    function attachStream(video, stream) {
        if (!video || !stream) {
            return;
        }
        if (video.dataset.streamReady === stream) {
            return;
        }
        if (video.hlsObject && typeof video.hlsObject.destroy === "function") {
            video.hlsObject.destroy();
            video.hlsObject = null;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            video.hlsObject = hls;
        } else {
            video.src = stream;
        }
        video.dataset.streamReady = stream;
    }

    function initPlayer() {
        var triggers = document.querySelectorAll("[data-stream]");
        triggers.forEach(function (trigger) {
            trigger.addEventListener("click", function () {
                var frame = trigger.closest(".player-shell");
                if (!frame) {
                    return;
                }
                var video = frame.querySelector("video");
                var stream = trigger.getAttribute("data-stream");
                attachStream(video, stream);
                frame.classList.add("is-playing");
                if (video) {
                    video.play().catch(function () {});
                }
            });
        });

        document.querySelectorAll(".player-video").forEach(function (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    video.play().catch(function () {});
                } else {
                    video.pause();
                }
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initFilters();
        initPlayer();
    });
})();
