// A damped spring gives the About card inertia and a visible return bounce.
(() => {
    const card = document.querySelector('.about-photo-card');
    if (!card) return;
    const stage = card.parentElement;
    // Deliberate pointer/touch feedback is requested even with reduced motion.
    // This card never animates automatically.
    const axes = {
        lift: { value: 0, velocity: 0, target: 0 },
        tiltX: { value: 0, velocity: 0, target: 0 },
        tiltY: { value: 0, velocity: 0, target: 0 },
    };
    let frame = 0;
    let lastTime = 0;
    let contact = null;
    let bounds;

    function draw(time) {
        const elapsed = Math.min((time - (lastTime || time - 16.67)) / 1000, .032);
        lastTime = time;
        // Small integration steps keep the return stable on slower displays.
        const steps = Math.max(1, Math.ceil(elapsed / (1 / 120)));
        const dt = elapsed / steps;
        let settled = true;
        for (const axis of Object.values(axes)) {
            for (let i = 0; i < steps; i++) {
                axis.velocity += (380 * (axis.target - axis.value) - 22 * axis.velocity) * dt;
                axis.value += axis.velocity * dt;
            }
            if (Math.abs(axis.target - axis.value) > .001 || Math.abs(axis.velocity) > .01) settled = false;
        }
        const p = axes.lift.value;
        card.style.transform = `perspective(850px) translate3d(0, ${-7 * p}px, 0) rotate(${-6 + 5 * p}deg) rotateX(${axes.tiltX.value}deg) rotateY(${axes.tiltY.value}deg) scale(${1 + .045 * p})`;
        if (!settled) frame = requestAnimationFrame(draw);
        else {
            frame = 0;
            lastTime = 0;
            if (axes.lift.target === 0) card.style.removeProperty('transform');
        }
    }
    function animate() {
        if (!frame) frame = requestAnimationFrame(draw);
    }
    function engage(event) {
        if (!event.isPrimary) return;
        if (event.pointerType !== 'mouse' && contact !== event.pointerId) return;
        bounds ||= stage.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
        const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
        axes.lift.target = 1;
        axes.tiltX.target = -y * 4;
        axes.tiltY.target = x * 5;
        card.classList.add('is-interacting');
        animate();
    }
    function release() {
        contact = null;
        bounds = null;
        for (const axis of Object.values(axes)) axis.target = 0;
        card.classList.remove('is-interacting');
        animate();
    }
    function stop() {
        cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
        contact = null;
        bounds = null;
        for (const axis of Object.values(axes)) axis.value = axis.velocity = axis.target = 0;
        card.classList.remove('is-interacting');
        card.style.removeProperty('transform');
    }
    stage.addEventListener('pointerenter', event => {
        if (event.pointerType === 'mouse') engage(event);
    });
    stage.addEventListener('pointerdown', event => {
        if (!event.isPrimary || event.target.closest('a, button')) return;
        contact = event.pointerId;
        // A small impulse makes even a quick tap visibly react before returning.
        axes.lift.velocity += 8;
        engage(event);
    });
    stage.addEventListener('pointermove', engage);
    stage.addEventListener('pointerleave', release);
    stage.addEventListener('pointercancel', release);
    window.addEventListener('pointerup', release);
    window.addEventListener('blur', stop);
    window.addEventListener('resize', stop);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
})();
