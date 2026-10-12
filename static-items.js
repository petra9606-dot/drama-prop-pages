// 깃허브 자료 목록(static-items.json) + 관리자 숨김 목록을 합쳐서 보이는 것만 돌려준다.
window.DW_STATIC = (async () => {
  const [data, hidden] = await Promise.all([
    fetch('/static-items.json', { cache: 'no-cache' }).then(r => r.json()).catch(() => ({ scenes: [], apps: [] })),
    fetch('/.netlify/functions/static-hidden', { cache: 'no-store' }).then(r => r.json()).then(j => j.hidden || []).catch(() => [])
  ]);
  const h = new Set(hidden);
  return {
    scenes: (data.scenes || []).filter(x => !h.has(x.id)),
    apps: (data.apps || []).filter(x => !h.has(x.id)),
    hidden: h
  };
})();
