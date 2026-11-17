// Let each letter glow and settle at its own pace, even after the pointer leaves.
(() => {
    const word = document.querySelector('.delightful-word');
    if (!word) return;

    const letters = [...word.querySelectorAll('.delightful-letter')]
        .filter(letter => /[a-z]/i.test(letter.textContent));
    const palette = ['#FFD6FF', '#E7C6FF', '#C8B6FF', '#B8C0FF', '#BBD0FF'];
    const colors = [0, 2, 1, 4, 3, 0, 2, 1, 4, 3];
    const delays = [100, 600, 200, 1000, 400, 1200, 150, 800, 300, 650];
    let animations = [];

    function shimmer() {
        // Avoid restarting midway through a fade when the pointer brushes the word.
        if (animations.some(animation => animation.playState === 'running' || animation.playState === 'pending')) return;
        animations = letters.map((letter, index) => {
            const base = getComputedStyle(letter).color;
            const accent = palette[colors[index % colors.length]];
            return letter.animate([
                { color: base, offset: 0 },
                { color: accent, offset: 3 / 13 },
                { color: base, offset: 6 / 13 },
                { color: base, offset: 7 / 13 },
                { color: accent, offset: 10 / 13 },
                { color: base, offset: 1 },
            ], {
                duration: 1300,
                delay: delays[index % delays.length],
                easing: 'ease-in-out',
                fill: 'none',
            });
        });
    }

    word.addEventListener('pointerenter', event => {
        if (event.pointerType !== 'touch') shimmer();
    });
    word.addEventListener('pointerdown', event => {
        if (event.pointerType === 'touch') shimmer();
    });

    // Play once on entry after the heading font is ready; reuse the hover effect.
    const playIntro = () => requestAnimationFrame(() => shimmer());
    if (document.fonts) {
        document.fonts.ready.then(playIntro);
    } else {
        playIntro();
    }
})();

// Close the existing mobile navigation after choosing a section.
document.querySelectorAll('.navlist .nav-link').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.navlist')?.classList.remove('active');
        document.querySelector('.menu-mask')?.classList.remove('active');
        const menuButton = document.getElementById('custom-menu-icon');
        menuButton?.classList.remove('active');
        menuButton?.setAttribute('aria-expanded', 'false');
        document.documentElement.style.overflow = '';
        document.body.style.overflow = 'auto';
    });
});
