(function () {
    var video = document.querySelector('[data-video]');
    var button = document.querySelector('[data-play]');
    var box = video ? video.closest('.player-box') : null;
    var mounted = false;
    var instance = null;

    function mount() {
        if (!video || mounted) {
            return;
        }
        mounted = true;
        var source = video.getAttribute('data-media') || '';
        if (!source) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            instance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            instance.loadSource(source);
            instance.attachMedia(video);
            return;
        }
        video.src = source;
    }

    function start() {
        mount();
        if (box) {
            box.classList.add('is-playing');
        }
        if (video) {
            var playCall = video.play();
            if (playCall && typeof playCall.catch === 'function') {
                playCall.catch(function () {});
            }
        }
    }

    if (button) {
        button.addEventListener('click', start);
    }
    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            if (box) {
                box.classList.add('is-playing');
            }
        });
        video.addEventListener('pause', function () {
            if (box && video.currentTime === 0) {
                box.classList.remove('is-playing');
            }
        });
    }
    window.addEventListener('pagehide', function () {
        if (instance && typeof instance.destroy === 'function') {
            instance.destroy();
        }
    });
})();
