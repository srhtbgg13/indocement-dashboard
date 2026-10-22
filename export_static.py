"""
export_static.py: ekspor snapshot data untuk demo statis (GitHub Pages).

Cara pakai (di folder yang sama dengan app.py, MySQL lokal harus menyala):
    python export_static.py

Hasilnya: data/snapshot.json
Isinya semua respons endpoint publik untuk setiap kombinasi
tahun x kuartal, jadi angkanya identik dengan versi Flask penuh.
"""
import json
import os

OUT_DIR = "data"
OUT_FILE = os.path.join(OUT_DIR, "snapshot.json")

# Endpoint publik (tanpa login) yang dipanggil script.js dengan filter tahun/kuartal
FILTERED_ENDPOINTS = [
    "/api/kpi/keuangan",
    "/api/kpi/operasional",
    "/api/kpi/cashflow",
    "/api/kpi/margin",
    "/api/kpi/balance",
    "/api/kpi/kfi",
    "/api/tabel/keuangan",
]
# Endpoint chart (Chart.js) yang dipanggil script.js tanpa parameter
UNFILTERED_ENDPOINTS = [
    "/api/tabel/balance",
    "/api/tabel/kfi",
    "/api/tabel/margin",
]
QUARTERS = [None, "Q1", "Q2", "Q3", "Q4"]


def make_key(path, params):
    """Kunci snapshot. HARUS identik dengan makeKey() di demo-shim.js:
    path + parameter non-kosong yang diurutkan berdasarkan nama."""
    pairs = sorted((k, str(v)) for k, v in params.items() if v not in (None, ""))
    qs = "&".join(f"{k}={v}" for k, v in pairs)
    return path + ("?" + qs if qs else "")


def main():
    print("Memuat app.py ...", flush=True)
    import app as app_module  # diimpor di sini agar make_key bisa dites tanpa Flask
    app = app_module.app

    # Batas waktu supaya masalah koneksi muncul sebagai error, bukan diam
    cfg = app_module.MYSQL_CONFIG
    cfg.setdefault("connect_timeout", 10)
    cfg.setdefault("read_timeout", 60)
    print(f"Menghubungkan ke MySQL {cfg['host']}:{cfg['port']} (database: {cfg['database']}) ...", flush=True)

    client = app.test_client()
    snapshot = {}

    res = client.get("/api/tahun-tersedia")
    if res.status_code != 200:
        raise SystemExit(f"Gagal membaca daftar tahun ({res.status_code}). Pastikan MySQL menyala "
                         f"dan isi .env (DB_HOST, DB_USER, DB_PASSWORD) benar.")
    tahun_data = res.get_json()
    years = tahun_data["tahun"]
    snapshot[make_key("/api/tahun-tersedia", {})] = tahun_data
    print(f"Terhubung. Tahun tersedia: {years}", flush=True)

    gagal = 0
    for path in FILTERED_ENDPOINTS:
        print(f"Mengekspor {path} ...", flush=True)
        for year in [None] + years:
            for quarter in QUARTERS:
                params = {"tahun": year, "kuartal": quarter}
                query = {k: v for k, v in params.items() if v not in (None, "")}
                r = client.get(path, query_string=query)
                if r.status_code != 200:
                    print("GAGAL", path, query, r.status_code)
                    gagal += 1
                    continue
                snapshot[make_key(path, params)] = r.get_json()

    for path in UNFILTERED_ENDPOINTS:
        print(f"Mengekspor {path} ...", flush=True)
        r = client.get(path)
        if r.status_code != 200:
            print("GAGAL", path, r.status_code)
            gagal += 1
            continue
        snapshot[make_key(path, {})] = r.get_json()

    os.makedirs(OUT_DIR, exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(snapshot, f, ensure_ascii=False, separators=(",", ":"), default=str)

    ukuran = os.path.getsize(OUT_FILE) / 1024
    print(f"Selesai: {len(snapshot)} respons, {ukuran:.0f} KB -> {OUT_FILE} ({gagal} gagal)")


if __name__ == "__main__":
    main()
