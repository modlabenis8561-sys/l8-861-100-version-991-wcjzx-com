import { H as Hls } from './hls-vendor-dru42stk.js';

const shell = document.querySelector('[data-player-shell]');
const video = document.querySelector('[data-video-player]');
const playButton = document.querySelector('[data-play-button]');
const statusText = document.querySelector('[data-player-status]');
let initialized = false;
let hlsInstance = null;

function setStatus(message) {
  if (statusText) {
    statusText.textContent = message;
  }
}

function initializePlayer() {
  if (!video || initialized) {
    return;
  }

  const source = video.dataset.src;

  if (!source) {
    setStatus('播放源未绑定。');
    return;
  }

  initialized = true;
  setStatus('正在加载播放源...');

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    setStatus('播放源已加载。');
    return;
  }

  if (Hls && Hls.isSupported()) {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hlsInstance.loadSource(source);
    hlsInstance.attachMedia(video);

    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
      setStatus('播放源已加载。');
    });

    hlsInstance.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        setStatus('播放遇到错误，请刷新页面后重试。');
      }
    });
  } else {
    setStatus('当前浏览器不支持 HLS 播放。');
  }
}

async function playVideo() {
  if (!video) {
    return;
  }

  initializePlayer();

  try {
    await video.play();
    if (shell) {
      shell.classList.add('is-playing');
    }
    setStatus('正在播放。');
  } catch (error) {
    setStatus('请再次点击播放按钮开始播放。');
  }
}

if (playButton) {
  playButton.addEventListener('click', playVideo);
}

if (video) {
  video.addEventListener('play', function () {
    if (shell) {
      shell.classList.add('is-playing');
    }
  });

  video.addEventListener('pause', function () {
    if (shell) {
      shell.classList.remove('is-playing');
    }
  });
}

window.addEventListener('pagehide', function () {
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
});
