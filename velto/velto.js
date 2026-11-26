// Match the Admin page's one-time 18px / 0.55s scroll reveal.
if ('IntersectionObserver' in window) {
  const revealElements = document.querySelectorAll(
    '.hero > *, .hero-image, .module-header, .workflow-grid, ' +
    '.product-screen, ' +
    '.payment-states, .employee > .eyebrow, .reflections-header, ' +
    '.see-more > h2, .see-more-intro, .see-more-link'
  );
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('on');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06 });
  revealElements.forEach(element => {
    element.classList.add('fade');
    revealObserver.observe(element);
  });
}

// Keep only one video source attached, so hidden demos cannot keep downloading.
const demoVideos = [...document.querySelectorAll('.product-screen video')];
const visibility = new Map();
const resumeTimes = new WeakMap();
let activeDemo = null;
const manuallyPaused = new WeakSet();

function playDemo(video) {
  if (video !== activeDemo || document.hidden || manuallyPaused.has(video)) return;
  video.defaultMuted = true;
  video.muted = true;
  video.playsInline = true;
  video.play().then(() => {
    video.dataset.playback = 'playing';
  }).catch(error => {
    if (video !== activeDemo || error.name === 'AbortError') return;
    video.dataset.playback = error.name;
    console.warn('Velto video playback:', error.name, error.message);
  });
}

function releaseDemo(video) {
  resumeTimes.set(video, video.currentTime || 0);
  video.pause();
  video.querySelector('source').removeAttribute('src');
  video.load(); // Abort buffering and return to the poster.
}

function selectDemo() {
  const next = document.hidden ? null :
    (activeDemo && visibility.get(activeDemo) > 0 ? activeDemo :
      demoVideos.find(video => visibility.get(video) > 0) || null);
  if (next === activeDemo) return;
  const previous = activeDemo;
  activeDemo = next;
  if (previous) releaseDemo(previous);
  if (!next) return;
  manuallyPaused.delete(next);
  const source = next.querySelector('source');
  source.src = source.dataset.src;
  next.muted = true;
  next.load();
  playDemo(next);
}

const demoObserver = new IntersectionObserver(entries => {
  entries.forEach(({ target, intersectionRatio }) => visibility.set(target, intersectionRatio));
  selectDemo();
}, { threshold: [0, 0.01], rootMargin: '-80px 0px 0px 0px' });

demoVideos.forEach(video => {
  video.addEventListener('loadedmetadata', () => {
    const time = resumeTimes.get(video) || 0;
    if (video === activeDemo && time > 0) video.currentTime = time;
  });
  video.addEventListener('canplay', () => playDemo(video));
  video.addEventListener('pause', () => {
    if (video === activeDemo && video.readyState >= 3 && !video.ended) manuallyPaused.add(video);
  });
  video.addEventListener('play', () => {
    manuallyPaused.delete(video);
    if (video !== activeDemo || document.hidden) video.pause();
  });
  demoObserver.observe(video);
});
document.addEventListener('visibilitychange', selectDemo);
// Retry blocked autoplay on normal page interaction; no play-button click required.
['pointerdown', 'keydown'].forEach(eventName => {
  document.addEventListener(eventName, event => {
    if (event.target.closest?.('video')) return;
    if (activeDemo && activeDemo.paused) playDemo(activeDemo);
  });
});
