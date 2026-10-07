import { CONTACT } from '../data/cv.js';
import { getLang } from '../i18n.js';

const ICONS = {
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  tel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z"/></svg>',
  gh: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.2-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.5.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
};

// The speech-bubble card Alban "hands over" once the visitor is done with the screen.
export function createContactCard(el) {
  const list = el.querySelector('#contactList');

  function render() {
    const lang = getLang();
    list.innerHTML = CONTACT.map((c) => {
      const inner = `<span class="ic">${ICONS[c.icon]}</span><span><span class="lbl">${c.label[lang]}</span><span class="val">${c.value}</span></span>`;
      return c.href
        ? `<li><a href="${c.href}" ${c.href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${inner}</a></li>`
        : `<li><span class="row">${inner}</span></li>`;
    }).join('');
  }

  function show({ focus = true } = {}) {
    render();
    el.classList.add('is-on'); el.setAttribute('aria-hidden', 'false');
    if (focus) setTimeout(() => list.querySelector('a')?.focus({ preventScroll: true }), 350);
  }

  function hide() { el.classList.remove('is-on'); el.setAttribute('aria-hidden', 'true'); }

  return { show, hide, render, isOpen: () => el.classList.contains('is-on') };
}
