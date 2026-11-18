const video = document.querySelector('#portrait-video');
const copyButton = document.querySelector('#copy-email');
const copyStatus = document.querySelector('#copy-status');

const portraitStage = document.querySelector('#portrait-stage');
const playButton = document.querySelector('#portrait-play');
const wink = document.querySelector('#portrait-wink');
const winkTrigger = document.querySelector('.hero-portrait-wink-trigger');
let winkTimer;
let winkRequest = 0;

winkTrigger?.addEventListener('click', async () => {
    const request = ++winkRequest;
    // Keep the animated portrait visible until the expression is ready.
    try {
        if (!wink.src) wink.src = wink.dataset.src;
        await wink.decode();
    } catch {
        return;
    }
    if (request !== winkRequest) return;
    window.clearTimeout(winkTimer);
    portraitStage.classList.add('is-winking');
    winkTimer = window.setTimeout(() => {
        portraitStage.classList.remove('is-winking');
    }, 1200);
});

copyButton?.addEventListener('click', async () => {
    const email = copyButton.dataset.email;
    const label = copyButton.querySelector('.hero-button-label');
    try {
        await navigator.clipboard.writeText(email);
        label.textContent = 'Copied';
        copyStatus.textContent = email;
        window.setTimeout(() => {
            label.textContent = 'Copy email';
            copyStatus.textContent = '';
        }, 2200);
    } catch {
        window.location.href = `mailto:${email}`;
    }
});

if (video) {
    const hero = video.closest('.hero-home');
    const stage = video.parentElement;
    let inView = true;
    video.muted = true;
    video.addEventListener('loadedmetadata', () => {
        if (video.videoWidth && video.videoHeight) {
            stage.style.setProperty('--portrait-video-aspect', `${video.videoWidth} / ${video.videoHeight}`);
        }
    });
    const updatePlayback = () => {
        const paused = document.hidden || !inView;
        hero?.classList.toggle('is-animation-paused', paused);
        if (paused) video.pause();
        else video.play().then(() => {
            if (playButton) playButton.hidden = true;
        }).catch(() => {
            if (playButton) playButton.hidden = false;
        });
    };
    playButton?.addEventListener('click', updatePlayback);
    video.addEventListener('click', updatePlayback);
    video.addEventListener('canplay', updatePlayback);
    video.addEventListener('playing', () => {
        if (playButton) playButton.hidden = true;
    });
    document.addEventListener('visibilitychange', updatePlayback);
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            updatePlayback();
        }, { rootMargin: '80px 0px' }).observe(hero || video);
    }
    updatePlayback();
}
