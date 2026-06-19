(function () {
  var video = document.querySelector('[data-player]');
  var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-play-trigger]'));
  var cover = document.querySelector('[data-player-cover]');
  var source = typeof currentVideo === 'string' ? currentVideo : '';
  var hls = null;
  function prepare() {
    if (!video || !source || video.getAttribute('data-ready') === '1') return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
    video.setAttribute('data-ready', '1');
  }
  function start(event) {
    if (event) event.preventDefault();
    prepare();
    if (cover) cover.classList.add('is-hidden');
    if (video) {
      var playTask = video.play();
      if (playTask && playTask.catch) playTask.catch(function () {});
    }
  }
  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', start);
  });
  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  }
  window.addEventListener('pagehide', function () {
    if (hls && hls.destroy) hls.destroy();
  });
})();
