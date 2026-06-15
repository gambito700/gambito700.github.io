export function createElement(tag, options = {}) {
  const el = document.createElement(tag);
  Object.keys(options).forEach(key => {
    if (key === 'className') el.className = options[key];
    else if (key === 'innerHTML') el.innerHTML = options[key];
    else el.setAttribute(key, options[key]);
  });
  return el;
}

export function debounce(fn, delay = 250) {
  let timeout;
  return function (...args) { clearTimeout(timeout); timeout = setTimeout(() => fn(...args), delay); };
}

export function throttle(fn, limit = 16) {
  let inThrottle;
  return function (...args) { if (!inThrottle) { fn(...args); inThrottle = true; setTimeout(() => inThrottle = false, limit); } };
}

export default { createElement, debounce, throttle };
