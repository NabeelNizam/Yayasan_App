---
slug: yayasan-plan-2-5
intent: clear
review_required: true
status: 6-plan-set READY 98.5% — 3-lens reviewed (Oracle senior-dev + grill-me adversarial + Momus); all MUST-FIX applied
created: 2026-09-27
---

# ULW-PLAN Draft — Plan 2-5 (Yayasan Al-Muhajirin)

## Resume fields
- **intent:** CLEAR (user menetapkan endpoint: tulis Plan 2-5)
- **review_required:** true (user minta "sesuai kriteria" = metodologis + bukti empiris + lolos audit)
- **status:** awaiting-approval

## Scope (dari spec v3, Option D, target Vercel)
- Plan 2 — Web `features/` + error boundary + ISR
- Plan 3 — Halaman publik per modul (tentang-kami, publikasi, kegiatan[lembaga/kajian/recap], donasi, kontak)
- Plan 4 — Donasi (seam manual) + Kontak submission
- Plan 5 — Durability & Ops lengkap (backup off-site, restore drill, monitoring, PITR trigger)

## Keputusan yang diadopsi (default, reversible — tidak ditanyakan)
- Struktur `features/` sederhana (bukan FSD penuh) — sesuai koreksi Metis #5.
- Rich text Kajian dirender via `convertLexicalToHTML` (URL relative, bukan dangerouslySetInnerHTML mentah).
- Error boundary: `error.tsx` per segmen penting (recap, kajian, donasi, kontak, tentang-kami, publikasi) + `global-error.tsx`; tidak fetch data di `layout.tsx`.
- ISR: `revalidate` 300s + `revalidateTag('phbi')` saat sync sukses.
- Scheduler: `pg_cron`+`pg_net` Supabase (bukan Vercel Cron).
- Durability: Supabase Pro daily + off-site mingguan; PITR ditunda dengan trigger.

## Fork owner-decision — TERJAWAB
1. **Editor artikel Kajian:** ✅ **Payload Lexical rich text** (render via convertLexicalToHTML).
2. **URL admin:** ✅ **`/admin` pada domain yang sama** (middleware matcher mengecualikan /admin).

## Verifikasi empiris (terkumpul)
- unstable_rethrow: nextjs.org/docs/app/api-reference/functions/unstable_rethrow
- convertLexicalToHTML: payloadcms.com/docs/rich-text/converting-html
- Local API getPayload: payloadcms.com/docs/local-api/overview
- Supabase pooler/pg_cron/pg_net, Vercel cron/rollback: (Plan 1 refs)

## Next action
Present approval brief → user says okay → write Plan 2-5 to docs/superpowers/plans/ → run high-accuracy review (momus + oracle) → handoff.
