(() => {
  'use strict';
  const value = document.getElementById('cf-value');
  const status = document.getElementById('cf-status');
  const card = document.getElementById('cf-rating');
  if (!value || !status || !card) return;
  const key = 'mxlev.codeforces.lskuratov.v1';
  const ttl = 15 * 60 * 1000;
  let cached;
  function valid(data) { return data && Number.isFinite(data.at) && data.at > 0 && data.at <= Date.now() && (data.rating === null || (Number.isInteger(data.rating) && data.rating >= 0)) && typeof data.rank === 'string'; }
  try { const data = JSON.parse(localStorage.getItem(key)); if (valid(data)) cached = data; } catch { /* Storage can be unavailable. */ }
  function paint(data, stale = false) {
    value.textContent = data.rating === null ? '—' : String(data.rating);
    status.textContent = stale ? 'Последние данные · ' + new Date(data.at).toLocaleDateString('ru-RU') : data.rating === null ? 'Пока без рейтинга' : data.rank;
    const rating = data.rating;
    card.dataset.rank = rating === null ? 'unrated' : rating < 1200 ? 'newbie' : rating < 1400 ? 'pupil' : rating < 1600 ? 'specialist' : rating < 1900 ? 'expert' : rating < 2100 ? 'candidate' : rating < 2400 ? 'master' : 'grandmaster';
    card.title = (stale ? 'Сохранённые данные от ' : 'Проверено ') + new Date(data.at).toLocaleString('ru-RU');
  }
  if (cached) { paint(cached, Date.now() - cached.at >= ttl); if (Date.now() - cached.at < ttl) return; }
  // Official JSONP endpoint works on static hosting without a proxy or API key.
  const callback = '__mxlevCfRating';
  const script = document.createElement('script');
  let settled = false;
  const timer = setTimeout(() => finish(null), 12000);
  function finish(data) {
    if (settled) return;
    settled = true; clearTimeout(timer); script.remove();
    window[callback] = () => {}; // A late network response is safe after a timeout.
    if (data) { paint(data); try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* Optional cache. */ } }
    else if (cached) paint(cached, true);
    else { value.textContent = '—'; status.textContent = 'Рейтинг временно недоступен'; card.title = 'Открыть профиль lskuratov на Codeforces'; }
  }
  window[callback] = response => {
    const user = response?.status === 'OK' && response.result?.[0];
    if (!user || typeof user.handle !== 'string' || user.handle.toLowerCase() !== 'lskuratov' || (user.rating !== undefined && (!Number.isInteger(user.rating) || user.rating < 0))) { finish(null); return; }
    finish({ rating: user.rating ?? null, rank: typeof user.rank === 'string' ? user.rank : '', at: Date.now() });
  };
  script.src = 'https://codeforces.com/api/user.info?handles=lskuratov&jsonp=' + callback;
  script.async = true; script.onerror = () => finish(null);
  document.head.append(script);
})();
