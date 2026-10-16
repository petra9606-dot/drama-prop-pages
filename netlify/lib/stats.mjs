// 방문 통계 저장 위치: 방문 1건 = 작은 기록 1개, 지난 날짜는 하루 요약으로 합쳐 둔다.
export const RAW = "__meta/stats/raw/";
export const SUM = "__meta/stats/sum/";
export const kstDay = (t = Date.now()) => new Date(t + 9 * 3600e3).toISOString().slice(0, 10);
export function summarize(day, events) {
  const s = { day, views: 0, visitors: {}, newV: [], pages: {}, dev: {}, ref: {}, app: {} };
  for (const e of events) {
    s.views++;
    s.visitors[e.v] = (s.visitors[e.v] || 0) + 1;
    if (e.n && !s.newV.includes(e.v)) s.newV.push(e.v);
    const pg = s.pages[e.p] || (s.pages[e.p] = { views: 0, t: e.t || "", v: [] });
    pg.views++; if (e.t) pg.t = e.t; if (!pg.v.includes(e.v)) pg.v.push(e.v);
    s.dev[e.v] = e.d || "pc";
    if (e.r) s.ref[e.r] = (s.ref[e.r] || 0) + 1;
    if (e.a) s.app[e.a] = (s.app[e.a] || 0) + 1;
  }
  return s;
}
