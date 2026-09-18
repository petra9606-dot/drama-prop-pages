// 청소내기 배틀 — 방 상태 서버 (Netlify Blobs)
// 방 하나 = blob 문서 하나. 모든 변경은 etag 조건부 쓰기(CAS)로 처리한다.
import { getStore } from '@netlify/blobs';

const STORE_NAME = 'cleaning-party';
const MAX_PLAYERS = 14;
const NAME_MAX = 10;
const IDLE_MS = 30000;          // 이 시간 동안 응답 없으면 '자리 비움'
const ROOM_TTL = 12 * 3600e3;   // 12시간 지난 방은 없는 방 취급

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const POINTS = [12, 9, 7, 6, 5, 4, 3, 2, 2, 1, 1, 1, 1, 1];

export const GAMES = {
  reaction:  { name: '반응 속도',    rule: '화면이 초록으로 바뀌면 바로 탭! 4번 평균이 기록',   dur: 38000, low: true,  unit: 'ms' },
  tap:       { name: '10초 연타',    rule: '10초 동안 최대한 많이 탭하세요',                    dur: 16000, low: false, unit: '회' },
  sequence:  { name: '1→16 순서',    rule: '숫자를 1부터 16까지 순서대로 터치',                 dur: 42000, low: true,  unit: '초' },
  memory:    { name: '기억력',       rule: '불이 들어온 순서를 그대로 따라 누르세요',           dur: 58000, low: false, unit: '단계' },
  precision: { name: '정밀 정지',    rule: '움직이는 막대를 한가운데에 멈추기 5회',             dur: 40000, low: true,  unit: '오차' },
  odd:       { name: '다른 색 찾기', rule: '색이 다른 칸 하나를 찾아 터치, 계속 어려워집니다',  dur: 44000, low: false, unit: '단계' },
  timer:     { name: '5초 맞추기',   rule: '숫자를 가린 채 정확히 5.00초에 멈추기 3회',         dur: 38000, low: true,  unit: 'ms' },
  math:      { name: '암산 배틀',    rule: '40초 동안 계산 문제를 많이 맞히세요',               dur: 42000, low: false, unit: '문제' },
  race:      { name: '카트 레이스',  rule: '좌우 탭으로 차선 변경, 길게 눌러 드리프트 부스트',  dur: 82000, low: true,  unit: '초' },
};

export const EVENTS = {
  card:   { name: '행운의 카드', rule: '카드를 한 장 고르세요. 점수가 오르거나 내립니다', dur: 14000, pick: true },
  bomb:   { name: '폭탄 상자',   rule: '상자 하나를 고르세요. 폭탄은 딱 하나!',           dur: 14000, pick: true },
  mercy:  { name: '자비의 여신', rule: '하위 두 명에게 동정 점수가 내려옵니다',           dur: 7000,  pick: false },
  swap:   { name: '운명 교환',   rule: '무작위 두 사람의 점수가 통째로 바뀝니다',         dur: 8000,  pick: false },
  shield: { name: '면제권 추첨', rule: '한 명이 청소 면제권을 가져갑니다',                dur: 9000,  pick: false },
};

const INTRO_GAME = 6500, INTRO_EVENT = 5000, RESULT_GAME = 9000, RESULT_EVENT = 8000;

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});
const fail = (error, status = 400) => json({ error }, status);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BAD_CHARS = new RegExp('[\\u0000-\\u001f<>]', 'g');
const clean = (s, max) => String(s ?? '').replace(BAD_CHARS, '').trim().slice(0, max);
const rnd = n => Math.floor(Math.random() * n);
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function newCode() { let s = ''; for (let i = 0; i < 4; i++) s += CODE_CHARS[rnd(CODE_CHARS.length)]; return s; }
function newId() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-3); }

let _store = null;
function store() {
  if (_store) return _store;
  try { _store = getStore({ name: STORE_NAME, consistency: 'strong' }); }
  catch (e) { _store = getStore(STORE_NAME); }
  return _store;
}
const key = code => `room/${code}`;

/* ---------- 방 만들기 / 라운드 계획 ---------- */
export function buildPlan(minutes) {
  const cost = st => st.k === 'game'
    ? INTRO_GAME + GAMES[st.id].dur + RESULT_GAME
    : INTRO_EVENT + EVENTS[st.id].dur + RESULT_EVENT;
  const target = minutes * 60000 - 80000;            // 최종 발표 몫을 남긴다
  const opening = { k: 'game', id: 'race' };
  const finale = { k: 'game', id: 'race', x2: true };
  let budget = target - cost(opening) - cost(finale) - cost({ k: 'game', id: 'race' }); // 중반 레이스 몫
  const pool = shuffle(Object.keys(GAMES).filter(id => id !== 'race'));
  const events = shuffle(Object.keys(EVENTS));
  const middle = [];
  let t = 0, gi = 0, ei = 0, games = 0;
  while (t < budget && middle.length < 48) {
    const id = pool[gi++ % pool.length];
    const st = { k: 'game', id };
    if (t + cost(st) > budget + 20000) break;
    middle.push(st); t += cost(st); games++;
    if (games % 3 === 0) {
      const ev = { k: 'event', id: events[ei++ % events.length] };
      if (t + cost(ev) <= budget) { middle.push(ev); t += cost(ev); }
    }
    if (gi % pool.length === 0) shuffle(pool);
  }
  if (!middle.some(st => st.k === 'event')) middle.splice(1, 0, { k: 'event', id: 'card' });
  const half = Math.max(1, Math.round(middle.length / 2));
  middle.splice(half, 0, { k: 'game', id: 'race' });   // 중반 레이스
  return [opening, ...middle, finale];
}

export function planMinutes(plan) {
  const cost = st => st.k === 'game'
    ? INTRO_GAME + GAMES[st.id].dur + RESULT_GAME
    : INTRO_EVENT + EVENTS[st.id].dur + RESULT_EVENT;
  return Math.round(plan.reduce((a, st) => a + cost(st), 0) / 60000 * 10) / 10;
}

function emptyRoom(code, hostToken) {
  return {
    v: 1, code, hostToken, createdAt: Date.now(), updatedAt: Date.now(),
    settings: { minutes: 30, losers: 2, mode: 'solo' },
    phase: 'lobby', step: -1, until: 0, plan: [],
    players: {}, order: [], subs: {}, picks: {}, decks: {}, results: {}, eventLog: {},
    finished: false, losers: [], finalRank: [],
  };
}

const activeIds = (room, now = Date.now()) =>
  room.order.filter(id => room.players[id] && now - (room.players[id].seen || 0) < IDLE_MS);

function everyoneDone(room, now) {
  const step = room.plan[room.step];
  if (!step) return false;
  if (step.k === 'event' && !EVENTS[step.id].pick) return false;
  const ids = activeIds(room, now);
  if (!ids.length) return false;
  const subs = room.subs[room.step] || {};
  return ids.every(id => subs[id] && subs[id].done);
}

/* ---------- 상태 진행 ---------- */
export function tick(room, now) {
  let changed = false;
  for (let guard = 0; guard < 30; guard++) {
    if (room.phase === 'lobby' || room.phase === 'final') break;
    if (now < room.until && !(room.phase === 'play' && everyoneDone(room, now))) break;
    advance(room, now);
    changed = true;
  }
  return changed;
}

function advance(room, now) {
  const step = room.plan[room.step];
  if (room.phase === 'intro') {
    room.phase = 'play';
    room.until = now + (step.k === 'game' ? GAMES[step.id].dur : EVENTS[step.id].dur);
    if (step.k === 'event' && EVENTS[step.id].pick) room.decks[room.step] = makeDeck(room, step.id);
  } else if (room.phase === 'play') {
    resolveStep(room, now);
    room.phase = 'result';
    room.until = now + (step.k === 'game' ? RESULT_GAME : RESULT_EVENT);
  } else if (room.phase === 'result') {
    room.step += 1;
    if (room.step >= room.plan.length) { finish(room, now); return; }
    const next = room.plan[room.step];
    room.phase = 'intro';
    room.until = now + (next.k === 'game' ? INTRO_GAME : INTRO_EVENT);
  }
}

function makeDeck(room, eventId) {
  const n = Math.max(3, room.order.length);
  const deck = [];
  if (eventId === 'bomb') {
    deck.push({ t: 'bomb', d: -14, label: '폭탄' });
    for (let i = 1; i < n; i++) deck.push({ t: 'safe', d: i % 3 === 0 ? 3 : 0, label: i % 3 === 0 ? '+3' : '안전' });
  } else {
    const values = [10, 7, 5, 3, 0, -3, -5, -7, -10, 4, -4, 6, -6, 2];
    for (let i = 0; i < n; i++) { const d = values[i % values.length]; deck.push({ t: 'card', d, label: d > 0 ? `+${d}` : `${d}` }); }
  }
  return shuffle(deck);
}

function rankValues(entries, low) {
  const scored = entries.filter(e => e.v !== null && Number.isFinite(e.v));
  const missing = entries.filter(e => e.v === null || !Number.isFinite(e.v));
  scored.sort((a, b) => low ? a.v - b.v : b.v - a.v);
  const out = [];
  let rank = 0, prev = null;
  scored.forEach((e, i) => {
    if (prev === null || e.v !== prev) rank = i + 1;
    prev = e.v;
    out.push(Object.assign({}, e, { rank, pts: POINTS[Math.min(rank - 1, POINTS.length - 1)] }));
  });
  missing.forEach(e => out.push(Object.assign({}, e, { rank: scored.length + 1, pts: 0, missed: true })));
  return out;
}

function resolveStep(room, now) {
  const step = room.plan[room.step];
  const subs = room.subs[room.step] || {};
  const ids = room.order.filter(id => room.players[id]);
  if (step.k === 'game') {
    const entries = ids.map(id => ({ id, v: subs[id] && Number.isFinite(subs[id].v) ? subs[id].v : null }));
    const ranked = rankValues(entries, GAMES[step.id].low);
    const mult = step.x2 ? 2 : 1;
    ranked.forEach(r => {
      r.pts = r.pts * mult;
      room.players[r.id].score = (room.players[r.id].score || 0) + r.pts;
      r.score = room.players[r.id].score;
    });
    room.results[room.step] = ranked;
    return;
  }
  const ev = EVENTS[step.id];
  const changes = [];
  if (ev.pick) {
    const deck = room.decks[room.step] || (room.decks[room.step] = makeDeck(room, step.id));
    const taken = room.picks[room.step] || (room.picks[room.step] = {});
    const used = Object.values(taken);
    const free = deck.map((_, i) => i).filter(i => !used.includes(i));
    shuffle(free);
    ids.forEach(id => {
      let slot = taken[id];
      if (slot === undefined) { slot = free.pop(); taken[id] = slot; }
      const card = deck[slot] || { d: 0, label: '없음' };
      room.players[id].score = (room.players[id].score || 0) + card.d;
      changes.push({ id, d: card.d, label: card.label, slot, score: room.players[id].score });
    });
  } else if (step.id === 'mercy') {
    const sorted = ids.slice().sort((a, b) => (room.players[a].score || 0) - (room.players[b].score || 0));
    const gifts = [9, 5];
    sorted.slice(0, 2).forEach((id, i) => {
      room.players[id].score = (room.players[id].score || 0) + gifts[i];
      changes.push({ id, d: gifts[i], label: `자비 +${gifts[i]}`, score: room.players[id].score });
    });
  } else if (step.id === 'swap') {
    if (ids.length >= 2) {
      const pair = shuffle(ids.slice()).slice(0, 2);
      const a = pair[0], b = pair[1];
      const sa = room.players[a].score || 0, sb = room.players[b].score || 0;
      room.players[a].score = sb; room.players[b].score = sa;
      changes.push({ id: a, d: sb - sa, label: '점수 교환', score: sb });
      changes.push({ id: b, d: sa - sb, label: '점수 교환', score: sa });
    }
  } else if (step.id === 'shield') {
    const pool = ids.filter(id => !room.players[id].exempt);
    if (pool.length) {
      const win = pool[rnd(pool.length)];
      room.players[win].exempt = true;
      changes.push({ id: win, d: 0, label: '청소 면제권', score: room.players[win].score || 0 });
    }
  }
  room.eventLog[room.step] = { id: step.id, changes };
  room.results[room.step] = changes.map(c => ({ id: c.id, v: c.d, pts: c.d, label: c.label, score: c.score }));
}

function autoTeams(room) {
  const ids = shuffle(room.order.filter(id => room.players[id]));
  ids.forEach((id, i) => { room.players[id].team = i % 2 === 0 ? 'A' : 'B'; });
}

export function teamStats(room) {
  const out = { A: { ids: [], total: 0, avg: 0 }, B: { ids: [], total: 0, avg: 0 } };
  room.order.forEach(id => {
    const p = room.players[id]; if (!p || !p.team || !out[p.team]) return;
    out[p.team].ids.push(id);
    out[p.team].total += p.score || 0;
  });
  ['A', 'B'].forEach(t => { out[t].avg = out[t].ids.length ? out[t].total / out[t].ids.length : 0; });
  return out;
}

function finish(room, now) {
  const ids = room.order.filter(id => room.players[id]);
  const wins = {};
  Object.keys(room.results).forEach(k => {
    const list = room.results[k];
    if (Array.isArray(list)) list.forEach(r => { if (r.rank === 1) wins[r.id] = (wins[r.id] || 0) + 1; });
  });
  const table = ids.map(id => ({
    id, score: room.players[id].score || 0, wins: wins[id] || 0,
    team: room.players[id].team || null,
    exempt: !!room.players[id].exempt, tie: Math.random(),
  }));
  table.sort((a, b) => b.score - a.score || b.wins - a.wins || a.tie - b.tie);
  table.forEach((row, i) => { row.rank = i + 1; delete row.tie; });
  let losers = [];
  if (room.settings.mode === 'team') {
    const ts = teamStats(room);
    const hasBoth = ts.A.ids.length && ts.B.ids.length;
    if (hasBoth) {
      let lose = ts.A.avg === ts.B.avg ? (Math.random() < .5 ? 'A' : 'B') : (ts.A.avg < ts.B.avg ? 'A' : 'B');
      losers = ts[lose].ids.filter(id => !room.players[id].exempt);
      if (!losers.length) losers = ts[lose].ids.slice();
      room.teamResult = {
        A: { total: ts.A.total, avg: Math.round(ts.A.avg * 10) / 10, n: ts.A.ids.length },
        B: { total: ts.B.total, avg: Math.round(ts.B.avg * 10) / 10, n: ts.B.ids.length },
        lose,
      };
    }
  }
  if (!losers.length) {
    const need = Math.min(room.settings.losers, Math.max(0, table.length - 1));
    for (let i = table.length - 1; i >= 0 && losers.length < need; i--) {
      if (!table[i].exempt) losers.push(table[i].id);
    }
    for (let i = table.length - 1; i >= 0 && losers.length < need; i--) {
      if (losers.indexOf(table[i].id) === -1) losers.push(table[i].id);
    }
  }
  room.finalRank = table;
  room.losers = losers;
  room.finished = true;
  room.phase = 'final';
  room.until = 0;
  room.finishedAt = now;
}

/* ---------- 조건부 쓰기 ---------- */
async function mutate(s, code, fn) {
  for (let i = 0; i < 8; i++) {
    const cur = await s.getWithMetadata(key(code), { type: 'json' });
    if (!cur || !cur.data) return { error: 'no_room' };
    const room = cur.data;
    if (Date.now() - room.createdAt > ROOM_TTL) return { error: 'no_room' };
    const out = fn(room) || {};
    if (out.error) return out;
    if (out.skip) return { room, value: out };
    room.updatedAt = Date.now();
    const res = await s.setJSON(key(code), room, { onlyIfMatch: cur.etag });
    if (res && res.modified === false) { await sleep(35 + i * 45); continue; }
    return { room, value: out };
  }
  return { error: 'busy' };
}

function publicRoom(room, now) {
  const out = Object.assign({}, room, { now, active: activeIds(room, now) });
  delete out.hostToken;
  return out;
}

/* ---------- 요청 처리 ---------- */
export default async (req) => {
  const url = new URL(req.url);
  const a = url.searchParams.get('a') || '';
  let body = {};
  if (req.method === 'POST') { try { body = await req.json(); } catch (e) { body = {}; } }
  const code = clean(body.code || url.searchParams.get('code') || '', 8).toUpperCase();
  const s = store();
  const now = Date.now();

  try {
    if (a === 'create') {
      const name = clean(body.name, NAME_MAX) || '호스트';
      for (let i = 0; i < 6; i++) {
        const c = newCode();
        const exists = await s.get(key(c), { type: 'json' });
        if (exists && Date.now() - exists.createdAt < ROOM_TTL) continue;
        const token = newId() + newId();
        const room = emptyRoom(c, token);
        const pid = newId();
        room.players[pid] = { id: pid, name, score: 0, seen: now, joined: now, host: true, exempt: false };
        room.order.push(pid);
        if (Number.isFinite(body.minutes)) room.settings.minutes = Math.min(60, Math.max(10, Math.round(body.minutes)));
        if (Number.isFinite(body.losers)) room.settings.losers = Math.min(4, Math.max(1, Math.round(body.losers)));
        await s.setJSON(key(c), room);
        return json({ code: c, playerId: pid, token, room: publicRoom(room, now) });
      }
      return fail('code_busy', 503);
    }

    if (a === 'join') {
      if (!/^[A-Z0-9]{4}$/.test(code)) return fail('bad_code');
      const name = clean(body.name, NAME_MAX) || '참가자';
      const pid = newId();
      const r = await mutate(s, code, room => {
        if (room.order.length >= MAX_PLAYERS) return { error: 'full' };
        if (room.finished) return { error: 'finished' };
        const scores = room.order.map(id => room.players[id].score || 0);
        const start = (room.phase === 'lobby' || !scores.length)
          ? 0 : Math.round(scores.reduce((x, y) => x + y, 0) / scores.length);
        let team = null;
        if (room.settings.mode === 'team') {
          const a = room.order.filter(id => room.players[id].team === 'A').length;
          const b = room.order.filter(id => room.players[id].team === 'B').length;
          team = a <= b ? 'A' : 'B';
        }
        room.players[pid] = { id: pid, name, score: start, seen: now, joined: now, host: false, exempt: false, team, late: room.phase !== 'lobby' };
        room.order.push(pid);
      });
      if (r.error) return fail(r.error, r.error === 'no_room' ? 404 : 400);
      return json({ code, playerId: pid, room: publicRoom(r.room, now) });
    }

    if (a === 'state') {
      if (!/^[A-Z0-9]{4}$/.test(code)) return fail('bad_code');
      const pid = clean(url.searchParams.get('pid') || '', 24);
      const r = await mutate(s, code, room => {
        let changed = false;
        if (pid && room.players[pid] && now - (room.players[pid].seen || 0) > 4000) {
          room.players[pid].seen = now; changed = true;
        }
        if (tick(room, now)) changed = true;
        if (!changed) return { skip: true };
      });
      if (r.error) return fail(r.error, r.error === 'no_room' ? 404 : 400);
      return json({ room: publicRoom(r.room, Date.now()) });
    }

    if (a === 'submit') {
      const pid = clean(body.playerId, 24);
      const step = Number(body.step);
      const value = Number(body.value);
      const done = !!body.done;
      const r = await mutate(s, code, room => {
        if (!room.players[pid]) return { error: 'no_player' };
        room.players[pid].seen = now;
        if (room.phase !== 'play' || room.step !== step) return { skip: true };
        const cur = room.subs[step] || (room.subs[step] = {});
        if (cur[pid] && cur[pid].done) return { skip: true };
        const prog = Number(body.p);
        cur[pid] = { v: Number.isFinite(value) ? value : null, p: Number.isFinite(prog) ? prog : 0, done, ts: now };
        tick(room, now);
      });
      if (r.error) return fail(r.error, 400);
      return json({ room: publicRoom(r.room, Date.now()) });
    }

    if (a === 'pick') {   // 이벤트에서 카드/상자 고르기 (선착순, 중복 불가)
      const pid = clean(body.playerId, 24);
      const step = Number(body.step);
      const slot = Number(body.slot);
      const r = await mutate(s, code, room => {
        if (!room.players[pid]) return { error: 'no_player' };
        room.players[pid].seen = now;
        if (room.phase !== 'play' || room.step !== step) return { error: 'too_late' };
        const taken = room.picks[step] || (room.picks[step] = {});
        if (taken[pid] !== undefined) return { skip: true };
        if (Object.values(taken).indexOf(slot) !== -1) return { error: 'taken' };
        taken[pid] = slot;
        const subs = room.subs[step] || (room.subs[step] = {});
        subs[pid] = { v: slot, done: true, ts: now };
        tick(room, now);
      });
      if (r.error) return fail(r.error, 400);
      return json({ room: publicRoom(r.room, Date.now()) });
    }

    if (a === 'host') {
      const token = clean(body.token, 64);
      const cmd = clean(body.cmd, 16);
      const r = await mutate(s, code, room => {
        if (token !== room.hostToken) return { error: 'not_host' };
        if (cmd === 'settings') {
          if (Number.isFinite(body.minutes)) room.settings.minutes = Math.min(60, Math.max(10, Math.round(body.minutes)));
          if (Number.isFinite(body.losers)) room.settings.losers = Math.min(4, Math.max(1, Math.round(body.losers)));
        } else if (cmd === 'start') {
          if (room.phase !== 'lobby') return { skip: true };
          room.plan = buildPlan(room.settings.minutes);
          room.step = 0; room.phase = 'intro'; room.until = now + INTRO_GAME;
          room.startedAt = now;
        } else if (cmd === 'skip') {
          if (room.phase === 'lobby' || room.phase === 'final') return { skip: true };
          room.until = 0; tick(room, now);
        } else if (cmd === 'restart') {
          room.order.forEach(id => {
            room.players[id].score = 0; room.players[id].exempt = false; room.players[id].late = false;
          });
          Object.assign(room, {
            phase: 'lobby', step: -1, until: 0, plan: [], subs: {}, picks: {}, decks: {},
            results: {}, eventLog: {}, finished: false, losers: [], finalRank: [], teamResult: null,
          });
        } else if (cmd === 'mode') {
          const m = clean(body.mode, 8);
          if (m === 'solo' || m === 'team') {
            room.settings.mode = m;
            if (m === 'team' && !room.order.some(id => room.players[id].team)) autoTeams(room);
            if (m === 'solo') room.order.forEach(id => { room.players[id].team = null; });
          }
        } else if (cmd === 'team') {
          const pid = clean(body.playerId, 24);
          const team = clean(body.team, 2);
          if (room.players[pid] && (team === 'A' || team === 'B')) room.players[pid].team = team;
        } else if (cmd === 'autoteam') {
          autoTeams(room);
        } else if (cmd === 'kick') {
          const pid = clean(body.playerId, 24);
          if (room.players[pid] && !room.players[pid].host) {
            delete room.players[pid];
            room.order = room.order.filter(x => x !== pid);
          }
        } else return { error: 'bad_cmd' };
      });
      if (r.error) return fail(r.error, r.error === 'not_host' ? 403 : 400);
      return json({ room: publicRoom(r.room, Date.now()) });
    }

    if (a === 'leave') {
      const pid = clean(body.playerId, 24);
      const r = await mutate(s, code, room => {
        if (!room.players[pid]) return { skip: true };
        if (room.phase === 'lobby') {
          delete room.players[pid];
          room.order = room.order.filter(x => x !== pid);
        } else room.players[pid].seen = 0;
      });
      if (r.error) return fail(r.error, 400);
      return json({ ok: true });
    }

    return fail('bad_action', 404);
  } catch (e) {
    return json({ error: 'server', detail: String((e && e.message) || e) }, 500);
  }
};
