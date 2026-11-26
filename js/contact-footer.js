(() => {
    const footer = document.querySelector('.contact-footer');
    if (!footer) return;
    const clock = footer.querySelector('[data-berlin-clock]');
    const zone = footer.querySelector('[data-berlin-zone]');
    const zoneFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Berlin', timeZoneName: 'short',
    });
    const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
    const updateClock = () => {
        const now = new Date();
        clock.textContent = formatter.format(now);
        clock.dateTime = now.toISOString();
        zone.textContent = zoneFormatter.formatToParts(now).find(part => part.type === 'timeZoneName').value;
    };
    updateClock();
    setInterval(() => { if (!document.hidden) updateClock(); }, 1000);

    const button = footer.querySelector('#footer-contact-toggle');
    const label = button.querySelector('.contact-footer-copy-label');
    const status = footer.querySelector('.contact-footer-status');
    let resetCopy;
    button.addEventListener('click', async () => {
        clearTimeout(resetCopy);
        const email = button.dataset.email;
        try {
            await navigator.clipboard.writeText(email);
            label.textContent = 'Copied';
        } catch {
            label.textContent = 'Get in touch';
        }
        status.textContent = email;
        resetCopy = setTimeout(() => {
            label.textContent = 'Get in touch';
            status.textContent = '';
        }, 2200);
    });

    const word = footer.querySelector('.contact-footer-word');
    const words = ['project', 'idea', 'product'];
    const symbols = '!<>_+*/[]{}';
    let index = 0, frame, timer, inView = false;
    const schedule = () => { timer = setTimeout(changeWord, 2800); };
    const changeWord = () => {
        const from = word.textContent;
        const to = words[index = (index + 1) % words.length];
        let started;
        const tick = now => {
            started ??= now;
            const progress = Math.min((now - started) / 600, 1);
            word.textContent = Array.from({ length: Math.max(from.length, to.length) }, (_, i) => {
                if (progress > (i + 1) / (to.length + 1)) return to[i] || '';
                return symbols[Math.floor(Math.random() * symbols.length)];
            }).join('');
            if (progress < 1) frame = requestAnimationFrame(tick);
            else { word.textContent = to; schedule(); }
        };
        frame = requestAnimationFrame(tick);
    };
    const updatePlayback = () => {
        clearTimeout(timer);
        cancelAnimationFrame(frame);
        word.textContent = words[index];
        if (inView && !document.hidden) schedule();
    };
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
            inView = entries[0].isIntersecting;
            updatePlayback();
        }).observe(footer);
    }
    document.addEventListener('visibilitychange', updatePlayback);
})();
