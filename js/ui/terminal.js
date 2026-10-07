import { CV, T } from '../i18n.js';

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const line = (cls, text) => ({ cls, text: text + '\n' });

// BBC Micro / teletext-style terminal: boot sequence, file menu, typed-out resume sections.
export function createTerminal(term, { reduceMotion, onExit, onType = () => {} }) {
  const seen = new Set();
  let typingTimer = null, typingQueue = null;
  let current = 'menu', pendingNext = null;

  function stopTyping() {
    clearTimeout(typingTimer); typingTimer = null;
    if (typingQueue) { typingQueue.finish(); typingQueue = null; }
  }

  // blocks: [{ cls, text } | { cls, html }]; text is typed char by char, html appears whole
  function typeInto(el, blocks, cps = 260) {
    stopTyping();
    return new Promise((resolve) => {
      let bi = 0, ci = 0, node = null;
      const mk = (b) => { const n = document.createElement('span'); if (b.cls) n.className = b.cls; el.appendChild(n); return n; };
      const finish = () => {
        for (; bi < blocks.length; bi++) {
          const b = blocks[bi];
          if (!node) node = mk(b);
          if (b.html) node.innerHTML = b.html; else node.textContent = b.text;
          node = null;
        }
        clearTimeout(typingTimer); typingQueue = null; resolve();
      };
      typingQueue = { finish };
      if (reduceMotion) return finish();
      const tick = () => {
        let budget = Math.max(1, Math.round(cps / 60));
        while (budget-- > 0) {
          if (bi >= blocks.length) return finish();
          const b = blocks[bi];
          if (!node) node = mk(b);
          if (b.html) { node.innerHTML = b.html; bi++; node = null; continue; }
          ci++; node.textContent = b.text.slice(0, ci);
          if (ci >= b.text.length) { bi++; ci = 0; node = null; }
        }
        term.scrollTop = term.scrollHeight;
        onType();
        typingTimer = setTimeout(tick, 16);
      };
      tick();
    });
  }

  function freshOutput() {
    term.innerHTML = '<pre id="out"></pre>';
    term.scrollTop = 0;
    return term.querySelector('#out');
  }

  async function boot() {
    const out = freshOutput();
    current = 'boot';
    await typeInto(out, [
      line('w', 'BBC Computer 32K'), line('w', ''), line('w', 'Acorn DFS'), line('w', ''), line('w', 'BASIC'), line('w', ''),
      line('g', '>CHAIN "ALBAN"'), line('w', ''),
    ], 200);
    if (current === 'boot') showMenu();
  }

  function menuHTML() {
    const cv = CV(), t = T();
    const all = cv.sections.every((s) => seen.has(s.id));
    return `<span class="band"><span class="dbl">${cv.name}</span></span>` +
      `<span class="c">${cv.title}\n</span><span class="w">${cv.subtitle} · ${cv.location}\n\n</span>` +
      `<span class="y">${t.pick}</span>` +
      `<ul class="menu">${cv.sections.map((s) => `<li><button type="button" data-k="${s.key}" class="${seen.has(s.id) ? 'seen' : ''}"><span class="k">${s.key}</span>${s.label}</button></li>`).join('')}` +
      `<li><button type="button" data-k="0"><span class="k">0</span>${t.talk}</button></li></ul>` +
      (all ? `<span class="g">${t.allRead}\n</span>` : `<span class="w">${t.count(seen.size, cv.sections.length)}\n</span>`) +
      `<span class="w">${t.keys}\n</span>` +
      `<span class="g">&gt;</span><span class="cursor"></span>`;
  }

  function showMenu() {
    stopTyping();
    const out = freshOutput();
    out.innerHTML = menuHTML();
    term.querySelectorAll('.menu button').forEach((b) => b.addEventListener('click', () => press(b.dataset.k)));
    current = 'menu';
    const first = term.querySelector('.menu button:not(.seen)') || term.querySelector('.menu button[data-k="0"]');
    first?.focus({ preventScroll: true });
  }

  async function openSection(sec, instant = false) {
    current = sec.id;
    const out = freshOutput();
    const blocks = [{ cls: 'g', text: `>LOAD "${sec.label}"\n\n` }];
    for (const [cls, text, href] of sec.body) {
      if (cls === 'band') blocks.push({ cls: 'band', html: `<span class="dbl">${esc(text)}</span>` });
      else if (cls === 'link') blocks.push({ cls: '', html: `<a href="${href}" target="_blank" rel="noopener">${esc(text)}</a>\n` });
      else blocks.push({ cls, text: text + '\n' });
    }
    const typed = typeInto(out, blocks, 420);
    if (instant) typingQueue?.finish();
    await typed;
    if (current !== sec.id || !out.isConnected) return;
    seen.add(sec.id);
    const secs = CV().sections, idx = secs.findIndex((s) => s.id === sec.id);
    const next = secs.find((s, i) => i > idx && !seen.has(s.id)) || secs.find((s) => !seen.has(s.id));
    const foot = document.createElement('span');
    foot.innerHTML = `\n<span class="y">${next ? T().next(next.label) : T().back}</span>\n<span class="w">${T().keys}</span>\n<span class="g">&gt;</span><span class="cursor"></span>`;
    out.appendChild(foot);
    pendingNext = next ? next.key : '0';
  }

  // k: '0'-'5', 'm' (menu), 'enter' (next file)
  function press(k) {
    if (typingQueue) { typingQueue.finish(); return; }
    if (k === '0') return onExit();
    if (k === 'm') return showMenu();
    if (k === 'enter') { if (current !== 'menu' && pendingNext) press(pendingNext); return; }
    const sec = CV().sections.find((s) => s.key === k);
    if (sec) openSection(sec);
  }

  function back() { if (current === 'menu') onExit(); else showMenu(); }

  // re-render the current view after a language switch, without re-typing it
  function rerender() {
    if (current === 'menu') return showMenu();
    const sec = CV().sections.find((s) => s.id === current);
    if (sec) openSection(sec, true);
  }

  term.addEventListener('click', (e) => { if (typingQueue && !e.target.closest('a,button')) typingQueue.finish(); });

  return {
    boot, press, back, rerender, stop: stopTyping,
    isTyping: () => typingQueue !== null,
    skip: () => typingQueue?.finish(),
  };
}
