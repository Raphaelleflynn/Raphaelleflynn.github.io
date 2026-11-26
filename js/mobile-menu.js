(() => {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const desktopLinks = document.querySelector('[data-site-navigation]');
    const menu = document.createElement('dialog');
    if (!toggle || !desktopLinks || typeof menu.showModal !== 'function') return;

    const root = document.documentElement;
    const desktop = window.matchMedia('(min-width: 1024px)');
    const toggleSlot = document.createElement('span');
    toggleSlot.className = 'mobile-menu-placeholder';
    toggleSlot.setAttribute('aria-hidden', 'true');
    const brand = toggle.closest('header').querySelector('a').cloneNode(true);
    brand.className = 'mobile-menu-brand';

    menu.id = 'mobile-menu';
    menu.className = 'mobile-menu';
    menu.setAttribute('aria-label', 'Site navigation');
    menu.innerHTML = `
        <div class="mobile-menu-content">
            <div class="mobile-menu-inner">
                <div class="mobile-menu-header"></div>
                <nav aria-label="Main navigation"><ul class="mobile-menu-links"></ul></nav>
                <div class="mobile-menu-actions">
                    <a class="mobile-menu-email" href="mailto:raphaelleflynn@gmail.com">Email Me</a>
                </div>
            </div>
        </div>`;
    menu.querySelector('.mobile-menu-header').prepend(brand);
    const list = menu.querySelector('.mobile-menu-links');
    const content = menu.querySelector('.mobile-menu-content');

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
        if (!menu.open) return;
        menu.close();
        toggleSlot.replaceWith(toggle);
        root.classList.remove('mobile-menu-open');
        menu.classList.remove('is-closing');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation');
        toggle.focus({ preventScroll: true });
    }

    function dismissMenu() {
        if (menu.classList.contains('is-closing')) return;
        const { clipPath, transform, opacity } = getComputedStyle(menu);
        const backdropOpacity = getComputedStyle(menu, '::backdrop').opacity;
        const destination = toggleSlot.getBoundingClientRect();
        const panel = content.getBoundingClientRect();
        const icon = toggle.getBoundingClientRect();
        const menuBeforeClose = menu.getBoundingClientRect();
        menu.style.setProperty('--menu-close-start-width', `${panel.width}px`);
        menu.style.setProperty('--menu-close-start-height', `${panel.height}px`);
        menu.style.setProperty('--menu-close-start-clip', clipPath);
        menu.style.setProperty('--menu-close-end-clip', clipPath === 'none' ? 'none' : 'inset(0 round 14px)');
        menu.style.setProperty('--menu-close-start-transform', transform);
        menu.style.setProperty('--menu-close-start-opacity', opacity);
        menu.style.setProperty('--menu-close-start-backdrop', backdropOpacity || '1');
        menu.classList.add('is-closing');
        const anchor = menu.getBoundingClientRect();
        menu.style.setProperty('--menu-close-width', `${destination.width}px`);
        menu.style.setProperty('--menu-close-height', `${destination.height}px`);
        menu.style.setProperty('--menu-close-x', `${destination.right - anchor.right}px`);
        menu.style.setProperty('--menu-close-y', `${destination.top - anchor.top}px`);
        menu.style.setProperty('--menu-icon-x', `${destination.left - anchor.left - (icon.left - menuBeforeClose.left)}px`);
        menu.style.setProperty('--menu-icon-y', `${destination.top - anchor.top - (icon.top - menuBeforeClose.top)}px`);
        closeTimer = setTimeout(closeMenu, 360);
    }

    toggle.addEventListener('click', () => {
        if (desktop.matches) return;
        if (menu.open) {
            dismissMenu();
            return;
        }
        for (const { source, link } of links) {
            const current = source.getAttribute('aria-current');
            if (current) link.setAttribute('aria-current', current);
            else link.removeAttribute('aria-current');
        }
        // Keep the header position while the same control is in the modal's top layer.
        toggle.replaceWith(toggleSlot);
        menu.prepend(toggle);
        menu.showModal();
        pressedBackdrop = false;
        root.classList.add('mobile-menu-open');
        // Resolve the horizontal bars before applying the expanded state.
        toggle.getBoundingClientRect();
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Close navigation');
        toggle.focus({ preventScroll: true });
    });

    menu.addEventListener('pointerdown', event => { pressedBackdrop = event.target === menu; });
    menu.addEventListener('click', event => {
        // Unlock scrolling before the browser follows an in-page link.
        if (event.target.closest('a')) closeMenu();
        else if (event.target === menu && pressedBackdrop) dismissMenu();
    });
    menu.addEventListener('cancel', event => {
        event.preventDefault();
        dismissMenu();
    });
    menu.addEventListener('animationend', event => {
        if (event.target === content && menu.classList.contains('is-closing')) closeMenu();
    });
    desktop.addEventListener('change', event => { if (event.matches) closeMenu(); });
    window.addEventListener('pagehide', closeMenu);

    document.body.append(menu);
    root.classList.add('mobile-menu-ready');
    toggle.setAttribute('aria-controls', menu.id);
    toggle.hidden = false;
})();
