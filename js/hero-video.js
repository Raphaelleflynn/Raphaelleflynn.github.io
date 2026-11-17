const video = document.querySelector('#portrait-video');
const copyButton = document.querySelector('#copy-email');
const copyStatus = document.querySelector('#copy-status');

const portraitStage = document.querySelector('#portrait-stage');
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
    let drawFrame = () => {};
    let framePending = false;
    const requestFrame = () => {
        if (framePending || document.hidden || !inView || video.paused) return;
        framePending = true;
        const next = () => {
            framePending = false;
            if (document.hidden || !inView || video.paused) return;
            drawFrame();
            requestFrame();
        };
        if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(next);
        else requestAnimationFrame(next);
    };

    // Key only bright, nearly neutral pixels. Pink hair, skin and amber glasses
    // remain opaque; the page's own gradient shows through the video backdrop.
    const canvas = document.createElement('canvas');
    // Transparent WebM plays natively. Only explicitly marked opaque footage
    // uses the gray-backdrop processor, preserving native alpha and colors.
    const gl = video.dataset.backdrop === 'gray'
        ? canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false })
        : null;
    if (gl) {
        try {
            const compile = (type, source) => {
                const shader = gl.createShader(type);
                gl.shaderSource(shader, source);
                gl.compileShader(shader);
                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(shader));
                return shader;
            };
            const program = gl.createProgram();
            gl.attachShader(program, compile(gl.VERTEX_SHADER, `
                attribute vec2 position;
                varying vec2 uv;
                void main() {
                    uv = vec2((position.x + 1.0) * 0.5, (1.0 - position.y) * 0.5);
                    gl_Position = vec4(position, 0.0, 1.0);
                }
            `));
            gl.attachShader(program, compile(gl.FRAGMENT_SHADER, `
                precision mediump float;
                uniform sampler2D frame;
                varying vec2 uv;
                void main() {
                    vec3 color = texture2D(frame, uv).rgb;
                    float low = min(color.r, min(color.g, color.b));
                    float high = max(color.r, max(color.g, color.b));
                    float neutral = 1.0 - smoothstep(0.035, 0.11, high - low);
                    float backdrop = neutral * smoothstep(0.65, 0.82, low);
                    gl_FragColor = vec4(color, 1.0 - backdrop);
                }
            `));
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
            gl.useProgram(program);
            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
            const position = gl.getAttribLocation(program, 'position');
            gl.enableVertexAttribArray(position);
            gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            canvas.className = 'hero-portrait-video-canvas';
            canvas.setAttribute('aria-hidden', 'true');
            stage.append(canvas);
            drawFrame = () => {
                if (video.readyState < 2) return;
                if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    gl.viewport(0, 0, canvas.width, canvas.height);
                }
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
                stage.classList.add('is-video-keyed');
            };
            canvas.addEventListener('webglcontextlost', event => {
                event.preventDefault();
                stage.classList.remove('is-video-keyed');
                drawFrame = () => {};
            });
        } catch (error) {
            canvas.remove();
            console.warn('Video backdrop processing unavailable; showing original video.', error);
        }
    }
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
        else video.play().then(requestFrame).catch(() => {
            // Keep the poster visible and allow a tap if autoplay is blocked.
        });
    };
    video.addEventListener('click', updatePlayback);
    video.addEventListener('canplay', updatePlayback);
    video.addEventListener('playing', requestFrame);
    document.addEventListener('visibilitychange', updatePlayback);
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            updatePlayback();
        }, { rootMargin: '80px 0px' }).observe(hero || video);
    }
    updatePlayback();
}
