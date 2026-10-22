/* demo-shim.js: mode demo statis untuk GitHub Pages
 *
 * Muat SEBELUM script.js:
 *   <script src="demo-shim.js"></script>
 *   <script src="script.js"></script>
 *
 * Fungsinya:
 *  1. Mencegat semua fetch ke /api/* dan menjawab dari data/snapshot.json
 *     (dibuat oleh export_static.py), jadi tidak butuh backend.
 *  2. Menonaktifkan semua aksi tulis (POST/PUT/DELETE) di demo.
 *  3. Menyederhanakan login: hanya tab Guest yang ditampilkan.
 *
 * Aktif otomatis di domain publik. Di localhost shim mati (pakai Flask
 * asli); untuk mengetesnya secara lokal buka halaman dengan ?demo=1
 */
(function () {
  'use strict';

  var host = window.location.hostname;
  var isLocal = host === 'localhost' || host === '127.0.0.1';
  var forced = /[?&]demo=1/.test(window.location.search);
  if (isLocal && !forced) return;

  var SNAPSHOT_URL = 'data/snapshot.json';
  var realFetch = window.fetch.bind(window);
  var snapshotPromise = null;

  function loadSnapshot() {
    if (!snapshotPromise) {
      snapshotPromise = realFetch(SNAPSHOT_URL).then(function (r) {
        if (!r.ok) throw new Error('snapshot.json tidak ditemukan');
        return r.json();
      });
    }
    return snapshotPromise;
  }

  function jsonResponse(body, status) {
    return new Response(JSON.stringify(body), {
      status: status || 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Harus identik dengan make_key() di export_static.py
  function makeKey(u) {
    var pairs = [];
    u.searchParams.forEach(function (v, k) { if (v !== '') pairs.push([k, v]); });
    pairs.sort(function (a, b) { return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0; });
    var qs = pairs.map(function (p) { return p[0] + '=' + p[1]; }).join('&');
    return u.pathname + (qs ? '?' + qs : '');
  }

  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : ((input && input.url) || '');
    var u;
    try { u = new URL(url, window.location.href); }
    catch (e) { return realFetch(input, init); }

    // Hanya cegat panggilan API; file lain (CSS, gambar, PDF) lewat seperti biasa
    if (u.pathname.indexOf('/api/') !== 0) return realFetch(input, init);

    var method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
    if (method !== 'GET') {
      return Promise.resolve(jsonResponse({
        error: 'Mode demo (hanya baca)',
        message: 'Fitur ini dinonaktifkan pada versi demo.'
      }, 403));
    }

    // Data yang sengaja tidak disertakan di demo publik
    if (u.pathname === '/api/laporan')       return Promise.resolve(jsonResponse({ laporan: [], total: 0 }));
    if (u.pathname === '/api/banner/public') return Promise.resolve(jsonResponse({ banners: [] }));

    return loadSnapshot().then(function (snap) {
      var hit = snap[makeKey(u)];
      if (hit !== undefined) return jsonResponse(hit);
      return jsonResponse({ error: 'Data demo tidak tersedia', ada_data: false }, 404);
    }).catch(function () {
      return jsonResponse({ error: 'Snapshot demo gagal dimuat', ada_data: false }, 500);
    });
  };

  /* ── Tweak UI demo ── */
  var style = document.createElement('style');
  style.textContent =
    '.login-role-tab[data-role="admin"],.login-role-tab[data-role="manajemen"],' +
    '#loginRegisterLink{display:none!important}' +
    '#demoBadge{position:fixed;left:12px;bottom:12px;z-index:9999;max-width:340px;' +
    'padding:8px 12px;border-radius:10px;background:rgba(15,23,42,.92);color:#e2e8f0;' +
    'font:11.5px/1.45 Inter,system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.25);cursor:pointer}';
  document.head.appendChild(style);

  document.addEventListener('DOMContentLoaded', function () {
    // Login modal langsung membuka tab Guest
    var origOpen = window.openLoginModal;
    if (typeof origOpen === 'function' && typeof window.setLoginRoleTab === 'function') {
      window.openLoginModal = function () {
        origOpen();
        window.setLoginRoleTab('guest');
      };
    }

    var badge = document.createElement('div');
    badge.id = 'demoBadge';
    badge.title = 'Klik untuk menutup';
    badge.textContent = 'Mode demo: data statis hanya-baca dari laporan keuangan publik ' +
      'PT Indocement Tunggal Prakarsa Tbk. Proyek akademik, tidak berafiliasi dengan perusahaan.';
    badge.addEventListener('click', function () { badge.remove(); });
    document.body.appendChild(badge);
  });
})();
