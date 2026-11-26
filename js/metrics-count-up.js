// Count the impact figures once, when the group comes into view.
(() => {
    const group = document.querySelector('.portfolio-metrics');
    if (!group || !('IntersectionObserver' in window)) return;

    const counters = [...group.querySelectorAll('[data-count-target]')];
    const duration = 1400;
    const render = (counter, value) => {
        counter.textContent = `${counter.dataset.countPrefix || ''}${value}${counter.dataset.countSuffix || ''}`;
    };

    const observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        observer.disconnect();
        counters.forEach(counter => render(counter, 0));
        let startedAt;
        const tick = now => {
            startedAt ??= now;
            const progress = Math.min((now - startedAt) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            counters.forEach(counter => {
                render(counter, Math.round(Number(counter.dataset.countTarget) * eased));
            });
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, { threshold: 0.35 });

    observer.observe(group);
})();
