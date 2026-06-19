function createMoviePlayer(containerId, sourceUrl) {
    var shell = document.getElementById(containerId);
    if (!shell) {
        return;
    }
    var video = shell.querySelector("video");
    var cover = shell.querySelector(".player-cover");
    var message = shell.querySelector(".player-message");
    var hlsInstance = null;
    var attached = false;

    function setMessage(text) {
        if (message) {
            message.textContent = text || "";
        }
    }

    function attachSource() {
        if (attached || !video) {
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 60
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    setMessage("视频加载中，请稍候");
                    hlsInstance.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    setMessage("视频加载中，请稍候");
                    hlsInstance.recoverMediaError();
                } else {
                    setMessage("播放暂时受阻，请稍后重试");
                    hlsInstance.destroy();
                }
            });
        } else {
            video.src = sourceUrl;
        }
    }

    function play() {
        if (!video) {
            return;
        }
        attachSource();
        shell.classList.add("is-playing");
        video.controls = true;
        setMessage("");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                setMessage("请再次点击播放");
            });
        }
    }

    if (cover) {
        cover.addEventListener("click", play);
    }
    if (video) {
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("playing", function () {
            shell.classList.add("is-playing");
            setMessage("");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                shell.classList.add("is-playing");
            }
        });
    }
    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
