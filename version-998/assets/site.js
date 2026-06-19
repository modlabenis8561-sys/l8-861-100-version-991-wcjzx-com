import { H as Hls } from './hls-dru42stk.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupMenu() {
    const button = $('[data-menu-toggle]');
    const panel = $('[data-mobile-panel]');
    if (!button || !panel) {
        return;
    }
    button.addEventListener('click', () => {
        panel.classList.toggle('is-open');
    });
}

function setupHero() {
    const slides = $$('[data-hero-slide]');
    const dots = $$('[data-hero-dot]');
    if (slides.length < 2) {
        return;
    }
    let index = 0;
    const show = (next) => {
        index = (next + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === index);
        });
    };
    dots.forEach((dot, dotIndex) => {
        dot.addEventListener('click', () => show(dotIndex));
    });
    window.setInterval(() => show(index + 1), 5200);
}

function setupImages() {
    $$('img').forEach((image) => {
        image.addEventListener('error', () => {
            image.style.opacity = '0';
        }, { once: true });
    });
}

function setupPlayers() {
    $$('[data-player]').forEach((player) => {
        const video = $('video[data-video-src]', player);
        const button = $('[data-play-button]', player);
        const status = $('[data-player-status]', player);
        if (!video) {
            return;
        }
        const source = video.dataset.videoSrc;
        let hlsInstance = null;

        const setStatus = (message) => {
            if (status) {
                status.textContent = message;
            }
        };

        const attachSource = () => {
            if (!source || video.dataset.ready === '1') {
                return;
            }
            video.dataset.ready = '1';
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                setStatus('播放源已就绪，点击播放按钮即可观看。');
                return;
            }
            if (Hls && Hls.isSupported && Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                    setStatus('播放源已加载，点击播放按钮即可观看。');
                });
                hlsInstance.on(Hls.Events.ERROR, (event, data) => {
                    if (data && data.fatal) {
                        setStatus('播放源暂时无法加载，请稍后重试。');
                        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                            hlsInstance.recoverMediaError();
                        }
                    }
                });
                return;
            }
            video.src = source;
            setStatus('当前浏览器将尝试使用原生方式播放。');
        };

        const play = async () => {
            attachSource();
            video.controls = true;
            try {
                await video.play();
                player.classList.add('is-playing');
                setStatus('正在播放。');
            } catch (error) {
                setStatus('播放已准备好，请再次点击播放器或使用浏览器控件播放。');
            }
        };

        attachSource();

        if (button) {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                play();
            });
        }

        video.addEventListener('click', () => {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', () => {
            player.classList.add('is-playing');
        });

        video.addEventListener('pause', () => {
            player.classList.remove('is-playing');
        });

        window.addEventListener('beforeunload', () => {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}

function normalize(value) {
    return String(value || '').trim().toLowerCase();
}

function setupSearchPage() {
    const form = $('[data-search-form]');
    const input = $('[data-search-input]');
    const results = $('[data-search-results]');
    if (!form || !input || !results || !window.MOVIE_SEARCH_DATA) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q') || '';
    input.value = initial;

    const render = (keyword) => {
        const q = normalize(keyword);
        const data = window.MOVIE_SEARCH_DATA;
        const matched = q ? data.filter((item) => {
            return normalize(item.title).includes(q)
                || normalize(item.region).includes(q)
                || normalize(item.type).includes(q)
                || normalize(item.genre).includes(q)
                || normalize(item.tags).includes(q)
                || normalize(item.year).includes(q);
        }).slice(0, 120) : data.slice(0, 80);

        if (matched.length === 0) {
            results.innerHTML = '<div class="search-result"><h2>没有找到匹配影片</h2><p>可以换一个片名、类型、地区或年份继续搜索。</p></div>';
            return;
        }

        results.innerHTML = matched.map((item) => `
            <article class="search-result">
                <h2><a href="${item.url}">${item.title}</a></h2>
                <p>${item.year} · ${item.region} · ${item.type} · ${item.genre}</p>
                <p>${item.oneLine}</p>
            </article>
        `).join('');
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const keyword = input.value.trim();
        const url = new URL(window.location.href);
        if (keyword) {
            url.searchParams.set('q', keyword);
        } else {
            url.searchParams.delete('q');
        }
        window.history.replaceState(null, '', url.toString());
        render(keyword);
    });

    input.addEventListener('input', () => {
        render(input.value);
    });

    render(initial);
}

setupMenu();
setupHero();
setupImages();
setupPlayers();
setupSearchPage();
