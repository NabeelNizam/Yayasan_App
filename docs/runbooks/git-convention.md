# Konvensi Git — Yayasan App

Mengikuti best practice (Conventional Branch v1.1.0, Conventional Commits 1.0.0, trunk-based untuk tim kecil).

## Branch
- Trunk: `main` (tanpa prefix). Selalu deployable.
- Work branch **short-lived**: prefix `/` deskripsi kebab-case lowercase.
- Prefix yang dipakai:
  - `feature/` atau `feat/` — fitur baru user-facing
  - `fix/` — perbaikan bug
  - `refactor/` — perubahan arsitektur/struktur tanpa mengubah perilaku
  - `chore/` — tooling, dependency, non-kode
  - `docs/` — dokumentasi
  - `test/` — test
  - `ci/` — pipeline
- Branch saat ini: **`refactor/arsitektur-payload-rebuild`** (rebuild arsitektur Next.js + Payload).

## Commit — Conventional Commits
`<type>(scope opsional): <deskripsi>`

- Type: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`.
- Contoh: `feat: add Payload in-app via (payload) route group`
- Satu commit = satu perubahan logis (atomic). Body menjelaskan *apa & kenapa*.

## Integrasi
- Rebase ke `main` (bukan merge) secara berkala.
- **Squash merge** ke `main` → satu commit bersih, pesan Conventional Commit.
- Hapus branch setelah merge.
