
import { uploadsStore, readFlags, merge } from "../lib/flags.mjs";

export default async (req) => {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") || "";
  if (!key) return new Response("Missing key", { status:400 });

  const store = uploadsStore();
  const metaEntry = await store.getMetadata(key);
  if (!metaEntry) return new Response("Not found", { status:404 });
  const flags = await readFlags(store);
  const m = merge(metaEntry.metadata, flags[key]);
  if (m.deleted) return new Response("This file is in trash.", { status:410 });

  let data = await store.get(key, { type:"arrayBuffer" });
  if (data === null) return new Response("Not found", { status:404 });

  const type = m.contentType || "application/octet-stream";
  const inline = type.startsWith("text/html") || type.startsWith("image/") || type === "application/pdf";
  const filename = String(m.filename || "file").replace(/[\r\n"]/g,"_");

  // 검색 차단 · 오프라인 지원 · 방문 통계(Google Analytics) 코드 삽입 — 촬영 소품 HTML에도 적용
  if (type.startsWith("text/html")) {
    let html = new TextDecoder("utf-8").decode(data);
    if (!html.includes("DW-SITE")) {
      const site = `<!-- DW-SITE --><meta name="robots" content="noindex,nofollow,noarchive"><script>if("serviceWorker"in navigator)addEventListener("load",function(){navigator.serviceWorker.register("/sw.js").catch(function(){})});</script>`;
      const j = html.search(/<\/head\s*>/i);
      html = j >= 0 ? html.slice(0, j) + site + html.slice(j) : site + html;
    }
    if (!html.includes("DW-GA")) {
      const ga = `<!-- DW-GA --><script>(function(){try{if(localStorage.getItem('dw-noga'))return;}catch(e){}window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','G-ZMQZ7X9F3J');var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=G-ZMQZ7X9F3J';(document.head||document.documentElement).appendChild(s);})();</script>`;
      const i = html.search(/<\/head\s*>/i);
      html = i >= 0 ? html.slice(0, i) + ga + html.slice(i) : ga + html;
    }
    data = new TextEncoder().encode(html);
  }

  return new Response(data, {
    headers: {
      "Content-Type": type,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control":"no-store",
      "X-Content-Type-Options":"nosniff",
      "X-Robots-Tag":"noindex, nofollow, noarchive"
    }
  });
};
