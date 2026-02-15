const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

const subscribeForm = document.querySelector('.subscribe-form');
if (subscribeForm) {
  subscribeForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = subscribeForm.querySelector('button');
    if (button) {
      button.textContent = '신청 완료';
      button.disabled = true;
    }
  });
}

const useCursorOrb =
  window.matchMedia('(pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (useCursorOrb) {
  const orb = document.createElement('div');
  orb.className = 'cursor-orb';
  document.body.appendChild(orb);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let orbX = mouseX;
  let orbY = mouseY;

  window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    orb.classList.add('is-visible');
  });

  window.addEventListener('mouseleave', () => {
    orb.classList.remove('is-visible');
  });

  const animate = () => {
    orbX += (mouseX - orbX) * 0.18;
    orbY += (mouseY - orbY) * 0.18;
    orb.style.transform = `translate(${orbX}px, ${orbY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}
