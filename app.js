// =============================================================
//  TechSolutions — page scripts (uses TS from data.js)
// =============================================================
document.documentElement.classList.remove('no-js');
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const page = document.body.dataset.page;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const ICON = {
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
};
const svg = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;

// ---------- Menu ----------
const nav = $('.nav'), menuBtn = $('.menu-btn');
if (nav && menuBtn) {
  const setOpen = (o) => { nav.classList.toggle('is-open', o); menuBtn.setAttribute('aria-expanded', String(o)); menuBtn.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); };
  menuBtn.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  $$('.nav-links a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  addEventListener('resize', () => { if (innerWidth > 900) setOpen(false); });
}
$$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

// ---------- Toast ----------
function toast(msg) {
  let t = $('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600);
}

// ---------- Reveal + count-up ----------
function countUp(el) {
  const end = Number(el.dataset.count), suffix = el.dataset.suffix || '', prefix = el.dataset.prefix || '';
  if (reduced) { el.textContent = prefix + end.toLocaleString() + suffix; return; }
  const t0 = performance.now(), dur = 1400;
  const step = (t) => { const p = Math.min(1, (t - t0) / dur); const v = Math.round(end * (1 - Math.pow(1 - p, 3))); el.textContent = prefix + v.toLocaleString() + suffix; if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function reveal() {
  const els = $$('.reveal:not(.in), [data-count]:not(.counted)');
  if (!('IntersectionObserver' in window)) { els.forEach((e) => { e.classList.add('in'); if (e.dataset.count) countUp(e); }); return; }
  const io = new IntersectionObserver((en) => en.forEach((x) => {
    if (!x.isIntersecting) return;
    x.target.classList.add('in');
    if (x.target.dataset.count && !x.target.classList.contains('counted')) { x.target.classList.add('counted'); countUp(x.target); }
    io.unobserve(x.target);
  }), { threshold: 0.12 });
  els.forEach((e) => io.observe(e));
}

// ---------- Spotlight glow that follows the pointer on cards ----------
document.addEventListener('pointermove', (e) => {
  const c = e.target.closest?.('.glow');
  if (!c) return;
  const r = c.getBoundingClientRect();
  c.style.setProperty('--mx', `${e.clientX - r.left}px`);
  c.style.setProperty('--my', `${e.clientY - r.top}px`);
});

// ---------- Hero laptop: live numbers ----------
if (page === 'home' && !reduced) {
  const rev = $('#live-rev'), ord = $('#live-orders');
  let r = 4820000, o = 312;
  setInterval(() => {
    r += Math.round(8000 + Math.random() * 42000); o += Math.random() < 0.6 ? 1 : 0;
    if (rev) rev.textContent = '₦' + (r / 1e6).toFixed(2) + 'm';
    if (ord) ord.textContent = o.toLocaleString();
  }, 2200);
}

// ---------- Generic validation helper ----------
function validate(form, required) {
  $$('.field-err', form).forEach((el) => el.classList.remove('field-err'));
  const d = Object.fromEntries(new FormData(form));
  const bad = required.filter((k) => !String(d[k] || '').trim());
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) && !bad.includes('email')) bad.push('email');
  bad.forEach((k) => form.elements[k]?.classList.add('field-err'));
  return { d, bad };
}
document.addEventListener('input', (e) => e.target.classList?.remove('field-err'));
const fill = (sel, items, ph) => { if (sel) sel.innerHTML = (ph ? `<option value="">${esc(ph)}</option>` : '') + items.map((v) => `<option>${esc(v)}</option>`).join(''); };

// =============================================================
//  PARTNERS — B2B import / export network
// =============================================================
if (page === 'partners') {
  const grid = $('#biz-grid'), count = $('#biz-count');
  const q = $('#f-q'), fSector = $('#f-sector'), fCountry = $('#f-country'), fTrade = $('#f-trade');
  fill(fSector, TS.SECTORS, 'All sectors');
  fill(fCountry, TS.COUNTRIES, 'All countries');
  fill($('#l-sector'), TS.SECTORS, 'Select sector');
  fill($('#l-country'), TS.COUNTRIES, 'Select country');

  const card = (b) => `<article class="biz glow reveal">
      <div class="biz-head"><span class="avatar">${esc(TS.initials(b.name))}</span><div><h3>${esc(b.name)}</h3><span class="sector">${esc(b.sector)}</span></div></div>
      <div class="chips">${b.trade.map((t) => `<span class="chip ${t === 'import' ? 'imp' : 'exp'}">${t === 'import' ? 'Importer' : 'Exporter'}</span>`).join('')}${b.mine ? '<span class="chip">Your listing</span>' : ''}</div>
      <p>${esc(b.about)}</p>
      <div class="loc">
        <span>${svg('pin')}<span>${esc(b.address)}, ${esc(b.city)}, ${esc(b.country)} · <a href="${TS.mapsUrl(`${b.address}, ${b.city}, ${b.country}`)}" target="_blank" rel="noopener" class="map-link">Open map</a></span></span>
        <span>${svg('globe')}<span>${b.site ? esc(b.site) : 'No website yet'}</span></span>
        <span>${svg('target')}<span>Looking for: ${esc(b.looking || 'Partners')}</span></span>
      </div>
      <div class="biz-actions"><button type="button" class="btn btn-primary btn-sm" data-req="${esc(b.id)}">Request partnership</button></div>
    </article>`;

  function render() {
    const term = q.value.trim().toLowerCase();
    const list = TS.allPartners().filter((b) =>
      (!term || `${b.name} ${b.about} ${b.city} ${b.country} ${b.sector}`.toLowerCase().includes(term)) &&
      (!fSector.value || b.sector === fSector.value) &&
      (!fCountry.value || b.country === fCountry.value) &&
      (!fTrade.value || b.trade.includes(fTrade.value)));
    count.textContent = `${list.length} business${list.length === 1 ? '' : 'es'} found`;
    grid.innerHTML = list.length ? list.map(card).join('') : '<div class="empty">No businesses match. Try a different sector or country — or list your own business below.</div>';
    reveal();
  }
  [q, fSector, fCountry, fTrade].forEach((el) => el.addEventListener('input', render));
  render();

  // Partnership request dialog
  const dlg = $('#req-dialog'), rForm = $('#req-form'), rStatus = $('.form-status', rForm);
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('[data-req]'); if (!b) return;
    const biz = TS.allPartners().find((x) => x.id === b.dataset.req);
    rForm.reset(); rStatus.textContent = ''; rStatus.className = 'form-status'; rForm.hidden = false; $('#req-done').hidden = true;
    rForm.elements.to.value = biz.id;
    $('#req-title').textContent = `Partner with ${biz.name}`;
    $('#req-sub').textContent = `${biz.sector} · ${biz.city}, ${biz.country}`;
    dlg.showModal();
  });
  $$('.dlg-close', dlg).forEach((b) => b.addEventListener('click', () => dlg.close()));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  rForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const { d, bad } = validate(rForm, ['company', 'email', 'type', 'message']);
    if (bad.length) { rStatus.className = 'form-status err'; rStatus.textContent = 'Please complete the highlighted fields.'; return; }
    TS.saveRequest({ ...d, at: Date.now() });
    rForm.hidden = true; $('#req-done').hidden = false;
  });

  // List your business
  const lForm = $('#list-form'), lStatus = $('.form-status', lForm);
  lForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const { d, bad } = validate(lForm, ['name', 'email', 'sector', 'country', 'city', 'address', 'about']);
    const trade = $$('input[name=trade]:checked', lForm).map((x) => x.value);
    if (!trade.length) bad.push('trade');
    if (bad.length) { lStatus.className = 'form-status err'; lStatus.textContent = trade.length ? 'Please complete the highlighted fields.' : 'Please choose whether you import, export or both.'; return; }
    TS.addListing({ id: 'u' + Date.now().toString(36), name: d.name.trim(), sector: d.sector, trade, city: d.city.trim(), country: d.country, address: d.address.trim(), site: d.site.trim().replace(/^https?:\/\//, ''), about: d.about.trim(), looking: d.looking.trim() || 'Partners', mine: true });
    lForm.reset(); lStatus.className = 'form-status ok'; lStatus.textContent = 'Your business is now listed in the network.';
    q.value = ''; fSector.value = ''; fCountry.value = ''; fTrade.value = '';
    render(); grid.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    toast('Business listed');
  });
}

// =============================================================
//  DASHBOARD — track what you sell
// =============================================================
if (page === 'dashboard') {
  const form = $('#sale-form'), status = $('.form-status', form);
  const chSel = $('#s-channel');
  chSel.innerHTML = Object.entries(TS.CHANNELS).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('');
  const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  form.elements.date.value = today.toISOString().slice(0, 10);
  form.elements.date.max = form.elements.date.value;
  let data = TS.sales();

  function render() {
    const total = data.reduce((s, x) => s + x.qty * x.price, 0);
    const units = data.reduce((s, x) => s + x.qty, 0);
    $('#k-rev').textContent = TS.money(total);
    $('#k-orders').textContent = data.length.toLocaleString();
    $('#k-units').textContent = units.toLocaleString();
    $('#k-avg').textContent = TS.money(data.length ? total / data.length : 0);

    // last 14 days revenue
    const days = [...Array(14)].map((_, i) => { const d = new Date(today); d.setDate(d.getDate() - (13 - i)); return d.toISOString().slice(0, 10); });
    const byDay = days.map((d) => data.filter((x) => x.date === d).reduce((s, x) => s + x.qty * x.price, 0));
    const max = Math.max(...byDay, 1);
    const W = 560, H = 200, bw = W / 14;
    $('#chart').innerHTML = `<svg viewBox="0 0 ${W} ${H + 24}" role="img" aria-label="Revenue for the last 14 days">
      ${[0.25, 0.5, 0.75, 1].map((f) => `<line x1="0" x2="${W}" y1="${H - H * f}" y2="${H - H * f}" stroke="#19302a" stroke-width="1"/>`).join('')}
      ${byDay.map((v, i) => { const h = Math.max(2, (v / max) * (H - 10)); return `<rect x="${i * bw + 5}" y="${H - h}" width="${bw - 10}" height="${h}" rx="4" fill="url(#gb)"><title>${days[i]}: ${TS.money(v)}</title></rect>`; }).join('')}
      ${days.map((d, i) => i % 2 === 0 ? `<text x="${i * bw + bw / 2}" y="${H + 17}" text-anchor="middle" font-size="11" fill="#6b7f78">${d.slice(8)}/${d.slice(5, 7)}</text>` : '').join('')}
      <defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6ee7b7"/><stop offset="1" stop-color="#16a34a"/></linearGradient></defs></svg>`;

    // channels
    const ch = Object.keys(TS.CHANNELS).map((k) => [k, data.filter((x) => x.channel === k).reduce((s, x) => s + x.qty * x.price, 0)]);
    const chMax = Math.max(...ch.map((x) => x[1]), 1);
    $('#channels').innerHTML = ch.map(([k, v]) => `<li><div class="lbl"><span>${esc(TS.CHANNELS[k])}</span><span>${TS.money(v)}</span></div><div class="bar"><i style="width:${(v / chMax) * 100}%"></i></div></li>`).join('');

    // top products
    const prod = {};
    data.forEach((x) => { prod[x.product] = (prod[x.product] || 0) + x.qty * x.price; });
    const top = Object.entries(prod).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const pMax = top[0]?.[1] || 1;
    $('#top').innerHTML = top.length ? top.map(([n, v]) => `<li><div class="lbl"><span>${esc(n)}</span><span>${TS.money(v)}</span></div><div class="bar"><i style="width:${(v / pMax) * 100}%"></i></div></li>`).join('') : '<li class="muted">No sales yet.</li>';

    // table
    const rows = [...data].sort((a, b) => b.date.localeCompare(a.date));
    $('#sales-body').innerHTML = rows.length ? rows.map((x) => `<tr>
        <td>${esc(x.date)}</td><td>${esc(x.product)}</td>
        <td><span class="pill ${x.channel === 'b2b' ? 'b2b' : x.channel === 'mkt' ? 'mkt' : ''}">${esc(TS.CHANNELS[x.channel])}</span></td>
        <td>${esc(x.customer || '—')}</td><td class="num">${x.qty.toLocaleString()}</td><td class="num">${TS.money(x.price)}</td><td class="num">${TS.money(x.qty * x.price)}</td>
        <td><button class="del" data-del="${esc(x.id)}" aria-label="Delete sale of ${esc(x.product)}">✕</button></td></tr>`).join('')
      : '<tr><td colspan="8" class="muted">No sales recorded yet. Add your first sale above.</td></tr>';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { d, bad } = validate(form, ['product', 'qty', 'price', 'date']);
    if (!(Number(d.qty) > 0)) bad.push('qty');
    if (!(Number(d.price) > 0)) bad.push('price');
    bad.forEach((k) => form.elements[k]?.classList.add('field-err'));
    if (bad.length) { status.className = 'form-status err'; status.textContent = 'Please enter a product, quantity, price and date.'; return; }
    data.push({ id: 's' + Date.now().toString(36), product: d.product.trim(), channel: d.channel, qty: Math.round(Number(d.qty)), price: Number(d.price), customer: d.customer.trim(), date: d.date });
    TS.saveSales(data); render();
    form.elements.product.value = ''; form.elements.qty.value = ''; form.elements.price.value = ''; form.elements.customer.value = '';
    status.className = 'form-status ok'; status.textContent = 'Sale recorded.'; toast('Sale recorded');
  });
  $('#sales-body').addEventListener('click', (e) => {
    const b = e.target.closest('[data-del]'); if (!b) return;
    data = data.filter((x) => x.id !== b.dataset.del); TS.saveSales(data); render(); toast('Sale removed');
  });
  $('#reset').addEventListener('click', () => { data = TS.demoSales(); TS.saveSales(data); render(); toast('Demo data restored'); });
  $('#clear').addEventListener('click', () => { data = []; TS.saveSales(data); render(); toast('All sales cleared'); });
  $('#export').addEventListener('click', () => {
    const lines = [['Date', 'Product', 'Channel', 'Customer', 'Quantity', 'Unit price', 'Total']].concat(data.map((x) => [x.date, x.product, TS.CHANNELS[x.channel], x.customer, x.qty, x.price, x.qty * x.price]));
    const csv = lines.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'techsolutions-sales.csv'; a.click(); URL.revokeObjectURL(a.href);
  });
  render();
}

// =============================================================
//  CONTACT
// =============================================================
if (page === 'contact') {
  const form = $('#contact-form'), status = $('.form-status', form);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { d, bad } = validate(form, ['name', 'email', 'message']);
    if (bad.length) { status.className = 'form-status err'; status.textContent = 'Please fill in your name, a valid email and a message.'; return; }
    form.reset(); status.className = 'form-status ok';
    status.textContent = `Thanks, ${d.name.split(' ')[0]}! This is a concept site, so the form is a demo and no message was sent.`;
  });
}

reveal();
