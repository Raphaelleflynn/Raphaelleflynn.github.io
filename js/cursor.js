// Inverting dot and a frosted VIEW cursor, with damped spring movement.
(() => {
    const mouse = window.matchMedia('(hover: hover) and (pointer: fine)');
    const root = document.documentElement;
    const cursor = document.createElement('div');
    cursor.className = 'site-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    const dot = document.createElement('span');
    dot.className = 'site-cursor-dot';
    const label = document.createElement('span');
    label.textContent = 'VIEW';
    dot.append(label);
    cursor.append(dot);
    document.body.append(cursor);
    let x = 0;
    let y = 0;
    let frame = 0;
    let visible = false;
    let px = 0, py = 0, size = 12;
    let vx = 0, vy = 0, vs = 0;
    let lastTime = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const hide = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        visible = false;
        lastTime = 0;
        root.classList.remove('has-dot-cursor');
        cursor.classList.remove('is-pressed');
    };
    const updateTarget = target => {
        const element = target instanceof Element ? target : null;
        cursor.classList.toggle('is-work', !!element?.closest('a.work .cover'));
        cursor.classList.toggle('is-link', !!element?.closest('a, button, [role="button"], summary'));
        cursor.classList.toggle('is-text', !!element?.closest('input, textarea, [contenteditable="true"]'));
    };
    const draw = time => {
        frame = 0;
        if (!visible) return;
        updateTarget(document.elementFromPoint(x, y));
        const targetSize = cursor.classList.contains('is-work') ? 80 : 12;
        const dt = Math.min((time - (lastTime || time - 16.67)) / 1000, .032);
        lastTime = time;
        if (reducedMotion.matches) {
            px = x; py = y; size = targetSize;
            vx = vy = vs = 0;
        } else {
            // Match the reference's spring: stiffness 500, damping 60, mass 1.
            // Small integration steps keep it stable on slower displays.
            const steps = Math.ceil(dt / .004);
            const step = dt / steps;
            for (let i = 0; i < steps; i++) {
                vx += ((x - px) * 500 - vx * 60) * step;
                vy += ((y - py) * 500 - vy * 60) * step;
                vs += ((targetSize - size) * 500 - vs * 60) * step;
                px += vx * step; py += vy * step; size += vs * step;
            }
        }
        cursor.style.transform = `translate3d(${px}px, ${py}px, 0)`;
        dot.style.width = dot.style.height = `${size}px`;
        if (Math.abs(x - px) + Math.abs(y - py) + Math.abs(size - targetSize) > .05 ||
            Math.abs(vx) + Math.abs(vy) + Math.abs(vs) > .05) schedule();
        else lastTime = 0;
    };
    const schedule = () => {
        if (!frame) frame = requestAnimationFrame(draw);
    };
    document.addEventListener('pointermove', event => {
        if (!mouse.matches || event.pointerType !== 'mouse') {
            hide();
            return;
        }
        x = event.clientX;
        y = event.clientY;
        if (!visible) {
            px = x; py = y;
            vx = vy = vs = 0;
            cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }
        visible = true;
        root.classList.add('has-dot-cursor');
        updateTarget(event.target);
        schedule();
    }, { passive: true });
    document.addEventListener('pointerdown', event => {
        if (event.pointerType === 'mouse') cursor.classList.add('is-pressed');
    }, { passive: true });
    document.addEventListener('pointerup', () => cursor.classList.remove('is-pressed'), { passive: true });
    document.addEventListener('scroll', () => {
        if (root.classList.contains('has-dot-cursor')) schedule();
    }, { passive: true, capture: true });
    root.addEventListener('pointerleave', hide);
    window.addEventListener('blur', hide);
    window.addEventListener('resize', hide);
    document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
    mouse.addEventListener('change', hide);
})();
