// 피라밋 페이지 '서류 소품' 탭에 서류 개수 표시
(() => {
  const el = document.getElementById("docCount"); if (!el) return;
  fetch("/.netlify/functions/docs").then((r) => r.json()).then(({ folders = [], files = [] }) => {
    const scenes = folders.filter((f) => !f.parent).length;
    if (files.length) el.textContent = `씬 ${scenes}개 · 서류 ${files.length}개`;
  }).catch(() => {});
})();
