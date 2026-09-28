/* 공용 프리뷰 프레임워크 · DisolveWorks
   각 앱 페이지는 PV.boot({ scenes, render }) 만 넘기면 된다.
   ?shot=<sceneId> 으로 열면 화면만 남아 자동 캡처에 쓰인다. */
(function () {
  const PV = {};
  const state = { scene: null, scenes: [], render: null };

  PV.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
  PV.money = n => String(Math.max(0, Math.round(Number(n) || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  PV.clock = s => { const n = Math.max(0, Math.ceil(s)); return String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0'); };
  PV.$ = sel => document.querySelector(sel);

  /* 한 방향 드래그 슬라이더(앱의 SlideAction 재현) : 마우스·터치 모두 지원 */
  PV.slider = function (node, opts) {
    const dir = opts.direction === 'left' ? -1 : 1;
    const knob = node.querySelector('.sl-knob');
    const fill = node.querySelector('.sl-fill');
    const label = node.querySelector('.sl-label');
    const doneLabel = node.querySelector('.sl-done');
    let value = 0, startValue = 0, startX = 0, dragging = false, fired = false, pointer = null;
    const range = () => Math.max(1, node.clientWidth - knob.offsetWidth - 10);
    function paint(v, animate) {
      value = Math.max(0, Math.min(1, v));
      const r = range();
      const ease = animate ? 'transform .22s cubic-bezier(.2,.8,.3,1)' : 'none';
      knob.style.transition = ease;
      fill.style.transition = ease;
      knob.style.transform = 'translateX(' + (dir * value * r) + 'px)';
      fill.style.transform = 'translateX(' + (-dir * (1 - value) * node.clientWidth) + 'px)';
      label.style.opacity = String(Math.max(0, 1 - value / 0.45));
      doneLabel.style.opacity = String(Math.max(0, (value - 0.55) / 0.45));
    }
    paint(0, false);
    function finish() {
      if (fired) return; fired = true;
      paint(1, true);
      node.classList.add('sl-fired');
      setTimeout(() => opts.onComplete && opts.onComplete(), 230);
    }
    function down(e) {
      if (fired || node.dataset.locked === '1') return;
      dragging = true; pointer = e.pointerId; startValue = value; startX = e.clientX;
      try { node.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    }
    function move(e) {
      if (!dragging || e.pointerId !== pointer) return;
      paint(startValue + dir * (e.clientX - startX) / range(), false);
      e.preventDefault();
    }
    function up() {
      if (!dragging) return;
      dragging = false;
      if (value >= 0.72) finish(); else paint(0, true);
    }
    node.addEventListener('pointerdown', down);
    node.addEventListener('pointermove', move);
    node.addEventListener('pointerup', up);
    node.addEventListener('pointercancel', up);
    node.addEventListener('lostpointercapture', up);
    return { set: v => paint(v, false), reset: () => { fired = false; paint(0, false); } };
  };

  PV.go = function (id, silent) {
    const found = state.scenes.find(s => s.id === id) || state.scenes[0];
    if (!found) return;
    state.scene = found.id;
    document.querySelectorAll('.pv-scenes button').forEach(b => b.classList.toggle('on', b.dataset.id === found.id));
    const cap = PV.$('.pv-cap');
    if (cap) cap.textContent = found.cap || '';
    if (state.render) state.render(found);
    if (!silent && !document.body.classList.contains('shot')) {
      try { history.replaceState(null, '', '#' + found.id); } catch (e) {}
    }
  };

  PV.boot = function (config) {
    state.scenes = config.scenes || [];
    state.render = config.render;
    const bar = PV.$('#scenes');
    if (bar) {
      bar.innerHTML = state.scenes.map((s, i) =>
        '<button data-id="' + s.id + '"><i>' + String(i + 1).padStart(2, '0') + '</i><span>' + PV.esc(s.label) + '</span></button>').join('');
      bar.querySelectorAll('button').forEach(b => b.addEventListener('click', () => PV.go(b.dataset.id)));
    }
    const params = new URLSearchParams(location.search);
    const shot = params.get('shot');
    if (shot) {
      document.body.classList.add('shot');
      PV.go(shot, true);
      requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(() => { window.__pvReady = true; }, 260)));
      return;
    }
    PV.go((location.hash || '').replace('#', '') || state.scenes[0].id);
    document.addEventListener('keydown', e => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const i = state.scenes.findIndex(s => s.id === state.scene);
      const next = e.key === 'ArrowRight' ? Math.min(state.scenes.length - 1, i + 1) : Math.max(0, i - 1);
      PV.go(state.scenes[next].id);
    });
  };

  window.PV = PV;
})();
