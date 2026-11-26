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
    const touchPhone = window.matchMedia('(max-width: 1023px) and (hover: none) and (pointer: coarse)').matches;
    let playbackRequested = !touchPhone;
    if (touchPhone) {
        video.poster = video.dataset.touchPoster;
        if (playButton) playButton.hidden = false;
    }
    // The desktop MP4 contains a vertical gradient; the mobile MP4 is #fafafa.
    // Align the page gradient with the displayed video rather than the section.
    let backdropStops = [
        [243, 245, 246], [243, 245, 246], [244, 246, 247],
        [245, 247, 249], [247, 247, 250], [249, 249, 251],
        [250, 250, 252], [251, 251, 251], [251, 251, 251],
        [252, 252, 252], [253, 253, 253],
    ];
    let backdropFrame = 0;
    const syncBackdrop = () => {
        backdropFrame = 0;
        if (!hero) return;
        if (!playbackRequested) {
            hero.style.setProperty('--hero-video-backdrop', '#fcfbfc');
            return;
        }
        if (video.currentSrc.includes('raphaelle-avatar-ios.mp4')) {
            hero.style.setProperty('--hero-video-backdrop', `rgb(${backdropStops[0].join(', ')})`);
            return;
        }
        const bounds = video.getBoundingClientRect();
        if (!bounds.height) return;
        const top = bounds.top - hero.getBoundingClientRect().top;
        const stops = backdropStops.map((color, index) =>
            `rgb(${color.join(', ')}) ${(top + bounds.height * index / 10).toFixed(2)}px`);
        hero.style.setProperty('--hero-video-backdrop', `linear-gradient(180deg, ${stops.join(', ')})`);
    };
    const scheduleBackdrop = () => {
        if (!backdropFrame) backdropFrame = requestAnimationFrame(syncBackdrop);
    };
    if ('ResizeObserver' in window) {
        const backdropObserver = new ResizeObserver(scheduleBackdrop);
        backdropObserver.observe(video);
        if (hero) backdropObserver.observe(hero);
    }
    window.addEventListener('resize', scheduleBackdrop);
    window.addEventListener('pageshow', scheduleBackdrop);
    const sampleBackdrop = () => {
        if (video.readyState < 2 || !video.videoHeight) return;
        try {
            // Sample the browser's decoded pixels so its color conversion matches.
            // Only the empty left edge is read; no per-frame canvas rendering.
            const strip = document.createElement('canvas');
            strip.width = 1;
            strip.height = 11;
            const context = strip.getContext('2d', { willReadFrequently: true });
            if (!context) return;
            for (let i = 0; i <= 10; i++) {
                const y = Math.round((video.videoHeight - 1) * i / 10);
                context.drawImage(video, 0, y, 1, 1, 0, i, 1, 1);
            }
            const pixels = context.getImageData(0, 0, 1, 11).data;
            backdropStops = Array.from({ length: 11 }, (_, i) =>
                [pixels[i * 4], pixels[i * 4 + 1], pixels[i * 4 + 2]]);
        } catch {
            // Keep the measured fallback if canvas access is restricted.
        }
        scheduleBackdrop();
    };
    video.addEventListener('loadeddata', sampleBackdrop);
    if (video.readyState >= 2) sampleBackdrop();
    scheduleBackdrop();
    let inView = true;
    video.muted = true;
    video.addEventListener('loadedmetadata', () => {
        if (video.videoWidth && video.videoHeight) {
            stage.style.setProperty('--portrait-video-aspect', `${video.videoWidth} / ${video.videoHeight}`);
        }
        scheduleBackdrop();
    });
    const updatePlayback = () => {
        const paused = document.hidden || !inView;
        hero?.classList.toggle('is-animation-paused', paused);
        if (paused || !playbackRequested) {
            video.pause();
            return;
        }
        video.play().then(() => {
            if (playButton) playButton.hidden = true;
        }).catch(() => {
            if (playButton) playButton.hidden = false;
        });
    };
    const requestPlayback = () => {
        playbackRequested = true;
        scheduleBackdrop();
        updatePlayback();
    };
    playButton?.addEventListener('click', requestPlayback);
    video.addEventListener('click', requestPlayback);
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
