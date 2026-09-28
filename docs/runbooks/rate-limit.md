# Rate limiting (catatan jujur)

## Kondisi saat ini

Tidak ada rate limiting aktif pada endpoint publik:

- `POST /api/donasi` (dinonaktifkan, `PAYMENT_ENABLED=false`)
- Server Action `submitDonation` (donasi manual)
- Server Action `submitFeedback` (kritik & saran) - dilindungi honeypot saja

Honeypot menangkap bot naif, tetapi **bukan** pengganti rate limit.

## Mengapa rate limit in-process TIDAK cukup di Vercel

Counter di memori proses (mis. `Map` per-instance) tidak melindungi di
serverless: setiap invocation bisa mendarat di instance berbeda, dan instance
tidak berbagi state. Jadi pendekatan "hitung di memori" hanya memberi ilusi
perlindungan.

## Opsi nyata (belum dipasang)

1. **Edge / platform rate limit** - mis. Vercel WAF rate limiting (per plan),
   atau Cloudflare di depan domain.
2. **Upstash Redis (`@upstash/ratelimit`)** - token bucket terdistribusi,
   cocok untuk serverless; butuh akun Upstash + env.
3. **DB-based** - tabel `rate_limits(key, window_start, count)` dengan
   `INSERT ... ON CONFLICT ... DO UPDATE`, lalu tolak bila melebihi ambang.
   Paling sederhana untuk volume kecil yayasan, tapi menambah beban DB.

## Rekomendasi

Untuk volume situs yayasan (rendah), **DB-based per-IP + per-window** pada
`submitFeedback` dan `submitDonation` sudah memadai dan tanpa vendor tambahan.
Pasang bila spam mulai terlihat; dokumentasikan ambang (mis. 5/menit/IP).

## Status

Ditunda (future work). Dicatat di sini agar tidak terlupakan.