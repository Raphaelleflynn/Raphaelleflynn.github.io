(() => {
    const video = document.querySelector('.ishop-cover-video');
    if (!video) return;

    const mobile = window.matchMedia('(max-width: 767px)');
    let inView = !('IntersectionObserver' in window);

    function syncPlayback() {
        if (!inView || document.hidden) {
            video.pause();
            return;
        }
        video.muted = true;
        video.play().catch(() => {
            // Autoplay may be blocked. Leave the video and its poster in place.
        });
    }

    function reloadVideo() {
        video.load();
        syncPlayback();
    }

    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        syncPlayback();
    }) : null;

    observer?.observe(video);
    mobile.addEventListener('change', reloadVideo);
    document.addEventListener('visibilitychange', syncPlayback);
    window.addEventListener('pageshow', syncPlayback);
    if (!observer) syncPlayback();
})();
