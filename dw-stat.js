// DisolveWorks 자체 방문 통계 — 개인정보 없이 "기기별 임의 번호"로만 방문자를 센다.
// 관리자 페이지를 한 번이라도 연 기기(주인 기기)는 세지 않는다.
(function () {
  try {
    if (window.top !== window.self) return;            // 미리보기·촬영 화면 안의 소품은 따로 세지 않음
    if (localStorage.getItem("dw-noga")) return;        // 주인 기기
    if (/bot|crawl|spider|headless|lighthouse/i.test(navigator.userAgent)) return;
    var vid = localStorage.getItem("dw-vid"), isNew = false;
    if (!vid) { vid = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem("dw-vid", vid); isNew = true; }
    var path = location.pathname + (location.pathname.indexOf("shoot.html") >= 0 ? location.search : "");
    // 같은 탭에서 같은 페이지를 30분 안에 다시 열면 한 번만
    var k = "dw-st:" + path, last = +sessionStorage.getItem(k) || 0;
    if (Date.now() - last < 30 * 60 * 1000) return;
    sessionStorage.setItem(k, String(Date.now()));
    var ua = navigator.userAgent, dev = /iPad|Tablet/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? "tablet" : /Mobi|Android|iPhone/i.test(ua) ? "phone" : "pc";
    var ref = ""; try { if (document.referrer) { var r = new URL(document.referrer); if (r.host !== location.host) ref = r.host; } } catch (e) {}
    var app = /KAKAOTALK/i.test(ua) ? "kakao" : /Instagram/i.test(ua) ? "insta" : /NAVER/i.test(ua) ? "naver" : "";
    var body = JSON.stringify({ v: vid, n: isNew ? 1 : 0, p: path.slice(0, 300), t: (document.title || "").slice(0, 120), d: dev, r: ref, a: app });
    var send = function () {
      if (navigator.sendBeacon && navigator.sendBeacon("/.netlify/functions/stat", new Blob([body], { type: "text/plain" }))) return;
      fetch("/.netlify/functions/stat", { method: "POST", body: body, keepalive: true }).catch(function () {});
    };
    if (document.readyState === "complete") setTimeout(send, 300); else addEventListener("load", function () { setTimeout(send, 300); });
  } catch (e) {}
})();
