(() => {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const desktopLinks = document.querySelector('[data-site-navigation]');
    const menu = document.createElement('dialog');
    if (!toggle || !desktopLinks || typeof menu.showModal !== 'function') return;

    const root = document.documentElement;
    const desktop = window.matchMedia('(min-width: 1024px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const brand = toggle.closest('header').querySelector('a').cloneNode(true);
    brand.className = 'mobile-menu-brand';

    menu.id = 'mobile-menu';
    menu.className = 'mobile-menu';
    menu.setAttribute('aria-label', 'Site navigation');
    menu.innerHTML = `
        <div class="mobile-menu-content">
            <div class="mobile-menu-header">
                <button type="button" class="mobile-menu-close" aria-label="Close navigation" autofocus><span></span><span></span></button>
            </div>
            <nav aria-label="Main navigation"><ul class="mobile-menu-links"></ul></nav>
            <div class="mobile-menu-actions">
                <a href="https://www.linkedin.com/in/raphaelleflynn/" target="_blank" rel="noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
                <a class="mobile-menu-contact" href="#contact">Contact</a>
            </div>
        </div>`;
    menu.querySelector('.mobile-menu-header').prepend(brand);
    const list = menu.querySelector('.mobile-menu-links');

    const links = [...desktopLinks.querySelectorAll('a')].map(source => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = source.getAttribute('href');
        link.textContent = source.textContent.trim();
        item.append(link);
        list.append(item);
        return { source, link };
    });

    let closeTimer;
    let pressedBackdrop = false;

    function closeMenu() {
        clearTimeout(closeTimer);
        root.classList.remove('mobile-menu-open');
        toggle.setAttribute('aria-expanded', 'false');
        if (menu.open) menu.close();
        menu.classList.remove('is-closing');
    }

    function dismissMenu() {
        if (menu.classList.contains('is-closing')) return;
        if (reducedMotion.matches) {
            closeMenu();
            return;
        }
        menu.classList.add('is-closing');
        closeTimer = setTimeout(closeMenu, 240);
    }

    toggle.addEventListener('click', () => {
        if (desktop.matches || menu.open) return;
        for (const { source, link } of links) {
            const current = source.getAttribute('aria-current');
            if (current) link.setAttribute('aria-current', current);
            else link.removeAttribute('aria-current');
        }
        menu.showModal();
        pressedBackdrop = false;
        root.classList.add('mobile-menu-open');
        toggle.setAttribute('aria-expanded', 'true');
    });

    menu.addEventListener('pointerdown', event => { pressedBackdrop = event.target === menu; });
    menu.addEventListener('click', event => {
        // Unlock scrolling before the browser follows an in-page link.
        if (event.target.closest('a')) closeMenu();
        else if ((event.target === menu && pressedBackdrop) || event.target.closest('.mobile-menu-close')) dismissMenu();
    });
    menu.addEventListener('cancel', event => {
        event.preventDefault();
        dismissMenu();
    });
    menu.addEventListener('animationend', event => {
        if (event.animationName === 'mobile-menu-collapse') closeMenu();
    });
    desktop.addEventListener('change', event => { if (event.matches) closeMenu(); });
    window.addEventListener('pagehide', closeMenu);

    document.body.append(menu);
    root.classList.add('mobile-menu-ready');
    toggle.setAttribute('aria-controls', menu.id);
    toggle.hidden = false;
})();
