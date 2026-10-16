// 촬영 소품 HTML 에 사이트 공통 코드(검색 차단 · 오프라인 · 방문 통계)를 넣는다
const SITE = `<!-- DW-SITE --><meta name="robots" content="noindex,nofollow,noarchive"><script>if("serviceWorker"in navigator)addEventListener("load",function(){navigator.serviceWorker.register("/sw.js").catch(function(){})});</script>`;
const GA = `<!-- DW-GA --><script>(function(){try{if(localStorage.getItem('dw-noga'))return;}catch(e){}window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','G-ZMQZ7X9F3J');var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=G-ZMQZ7X9F3J';(document.head||document.documentElement).appendChild(s);})();</script>`;
const STAT = `<!-- DW-STAT --><script src="/dw-stat.js" defer></script>`;
export function injectSite(html) {
  const put = (h, s) => { const i = h.search(/<\/head\s*>/i); return i >= 0 ? h.slice(0, i) + s + h.slice(i) : s + h; };
  if (!html.includes("DW-SITE")) html = put(html, SITE);
  if (!html.includes("DW-GA")) html = put(html, GA);
  if (!html.includes("DW-STAT")) html = put(html, STAT);
  return html;
}
export function injectBytes(data) {
  return new TextEncoder().encode(injectSite(new TextDecoder("utf-8").decode(data)));
}
