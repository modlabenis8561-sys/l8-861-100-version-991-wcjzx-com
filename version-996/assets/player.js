(function () {
    window.initMoviePlayer = function (url) {
        var video = document.getElementById("movie-player");
        var layer = document.querySelector(".player-layer");
        if (!video || !url) {
            return;
        }

        var started = false;
        var attached = false;

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                return;
            }
            video.src = url;
        }

        function play() {
            attach();
            started = true;
            if (layer) {
                layer.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        attach();
        if (layer) {
            layer.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (!started) {
                play();
            }
        });
    };
})();
