# SOC OPS Dashboard - Manual Book (Source of Guidance)

Dokumen ini adalah panduan utama (single source of guidance) untuk operasional, arsitektur, roadmap, dan standar development SOC OPS Dashboard.

## 1. Status Dokumen
- Status: Active
- Last updated: 2026-04-05
- Owner: Engineering (SOC OPS)
- Cakupan: Frontend SPA, BFF, integrasi eksternal (Wazuh/OpenCTI/Telegram), workflow SOC analis, dan governance dokumentasi.

## 2. Executive Summary
SOC OPS Dashboard adalah aplikasi web React + Vite untuk Security Operations Center (SOC), berfungsi sebagai pusat komando untuk:
- Monitoring dan triage alert
- Enrichment intelijen ancaman
- Workflow investigasi dan eskalasi
- Manajemen false positive
- Pelaporan operasional dan eksekutif

Evolusi sistem telah bergerak dari mode simulasi ke fondasi production-oriented dengan fokus utama:
1. Performance resiliency
2. Secure integration melalui BFF
3. Credential hygiene
4. Efisiensi beban kerja analis

## 3. Fitur Utama (Konsolidasi README + Implementation Plan)
- Bilingual UI (Indonesia/English)
- Alert register dengan filter, search, dan ekspor CSV/JSON
- Triage workspace dengan audit trail, playbook, escalation flow
- False positive archive dengan workflow restore
- Dashboard KPI dan analitik visual
- Reports center + ekspor PDF berbasis data
- Bulk actions dan incident clustering
- Runtime protection per page (Error Boundary + service fallback)
- Socket-based presence (kolaborasi analis pada alert yang sama)

## 4. Arsitektur Sistem

### 4.1 Frontend
- React 18 + Vite
- React Router (hash router)
- Tailwind CSS
- Recharts
- TanStack React Query
- TanStack React Virtual
- Axios
- Socket.io client

### 4.2 Backend-for-Frontend (BFF)
- Node.js + Express
- CORS + dotenv
- Socket.io server
- Lokasi source: `server/src/*`

### 4.3 Prinsip Integrasi
- Frontend hanya mengakses endpoint lokal `/api/*`.
- BFF menangani komunikasi ke Wazuh/OpenCTI/Telegram.
- Secret sensitif disanitasi dan tidak dipersist plaintext di browser.

## 5. Endpoint BFF Aktif
- `GET /api/health`
- `POST /api/alerts`
- `POST /api/opencti/query`
- `POST /api/telegram/send`
- `POST /api/wazuh/authenticate`
- `POST /api/wazuh/alerts`
- `POST /api/wazuh/agents`
- `POST /api/test/wazuh-manager`
- `POST /api/test/wazuh-indexer`
- `POST /api/test/opencti`
- `POST /api/test/telegram`

## 6. Runbook Operasional

### 6.1 Prasyarat
- Node.js 18+
- npm

### 6.2 Perintah Utama
```bash
npm install
npm run dev
npm run dev:bff
npm run lint
npm run build
```

### 6.3 Catatan Operasional
- Dev proxy: `/api/*` -> `http://localhost:8787`
- Jika integrasi bermasalah, validasi awal di `/api/health`
- Salin `.env.example` menjadi `.env` untuk konfigurasi BFF

## 7. Logika Workflow SOC

### 7.1 Alur Umum
1. Deteksi event/alert
2. Validasi awal
3. Enrichment intelijen
4. Triage dan keputusan
5. Eskalasi atau penutupan kasus
6. Pelaporan dan audit

### 7.2 Formula Prioritas
`Urgency Score = (Wazuh Rule Level * 0.6) + (OpenCTI Threat Score * 0.4)`

Interpretasi:
- 1-5: Low
- 6-8: High
- 9-10: Critical

### 7.3 Smart Playbook
Kategori alert dipetakan ke langkah investigasi terstandar (SOP) untuk konsistensi keputusan analis.

## 8. Status Implementasi Roadmap

| Fase | Fokus | Status | Ringkasan |
| :-- | :-- | :-- | :-- |
| Fase 1 | Ketahanan performa & konsistensi data | Completed (major) | Normalisasi `id`, virtualization, localStorage hardening, polling overlap guard |
| Fase 2 | Efisiensi workflow analis | Completed (major) | Bulk actions + incident clustering |
| Fase 3 | Keamanan API & arsitektur koneksi | Completed (core) | BFF aktif, migrasi service ke `/api/*` |
| Fase 4 | UX/runtime hardening | In progress | Per-page runtime guard, translasi runtime, optimasi chunk route |

## 9. Implementasi Teknis Penting

### 9.1 Data & Performa
- Normalizer alert domain (`normalizeAlert`) untuk kontrak data lintas sumber.
- Virtualisasi list besar di Alerts/False Positive.
- Retry sync dan state error sinkronisasi runtime.

### 9.2 Keamanan Identitas Lokal
- Password lokal dipersist sebagai `passwordHash` (PBKDF2-SHA256).
- Migrasi otomatis dari legacy plaintext credential.
- Proteksi duplikasi email pada provisioning user.

### 9.3 API Error Diagnostics
- Error API distandarkan: `network`, `timeout`, `auth`, `server`, `request`, `unknown`.
- Message/hint runtime diselaraskan dengan bahasa UI aktif (ID/EN).

### 9.4 Indicator Animation System
- Indikator konektivitas topbar menggunakan CSS keyframe animations context-aware:
  - `indicator-glow` (hijau, 2.5s) — Connected/Online
  - `indicator-alert` (merah, 1.6s) — Disconnected/Offline
  - `indicator-sync` (cyan, 1.2s) — Syncing data
  - `indicator-partial` (amber, 2s) — Partial connectivity
  - `indicator-dot-breathe` — Icon breathing untuk status non-connected
- Status layanan di-propagasi real-time dari `SettingsPage.testConnection()` ke global `SettingsContext` via `updateServiceStatus()`.
- Tooltip indikator menampilkan detail konfigurasi lengkap: host, port, user, API status, metadata sinkronisasi, dan pesan error.

### 9.5 Runtime Safety
- Global boundary: `ErrorBoundary`
- Per page: `PageErrorBoundary`, `PageRuntimeGuard`, `ServiceFallbackPanel`

## 10. Ringkasan Optimasi Bundle
- Route-level lazy loading diterapkan pada page/layout utama.
- Modul berat dipisahkan load-on-demand:
  - `reportPdfUtils` hanya saat ekspor PDF
  - `CorrelationGraph` hanya saat tab graph triage dibuka
- Dampak: chunk route berat menurun signifikan, warning `chunk > 500k` berhasil dihilangkan.

## 11. Catatan Rilis Terbaru
- Validasi teknis internal tetap dilakukan pada setiap rilis/hotfix.
- Detail perintah verifikasi tidak lagi dicatat pada activity log dokumen ini.

## 12. Troubleshooting Ringkas

### 12.1 Degraded Mode
Jika muncul mode degradasi di page alert-based:
- Cek konfigurasi Wazuh Indexer di Settings
- Jalankan test connection
- Cek BFF health (`/api/health`)
- Gunakan tombol retry sync

### 12.2 Error 5xx dari BFF
- Pastikan service target (Wazuh/OpenCTI) reachable
- Cek env dan kredensial BFF
- Audit log backend server

## 13. Governance Dokumentasi
Prioritas acuan dokumen:
1. `manual_book.md` (dokumen ini)
2. `DISCUSSION_LOG.md` - Log diskusi, review, dan kesimpulan pengembangan
3. `implementation_plan.md`
4. `README.md`

Aturan:
- Setiap fitur/hotfix/refactor wajib menambah entry log aktivitas di Section 15 (Activity Log).
- Jika arsitektur berubah, update section roadmap + implementasi teknis.
- **AI Assistant Wajib Update**: Setiap diskusi review, analisis, atau rekomendasi arsitektur dicatat di `DISCUSSION_LOG.md`.
- Update dokumentasi dilakukan **synchronous** dengan perubahan kode (tidak boleh tertunda).
- Gunakan template standar (Section 14) untuk konsistensi entry log.

## 14. Template Activity Log
```md
### [YYYY-MM-DD HH:mm] Release/Hotfix: vX.Y.Z "Nama"
- Aksi:
- Perubahan teknis:
- File kunci:
- Status:
```

## 15. Activity Log (Earliest to Latest)

### 15.1 Fase Inisiasi & Fondasi (2026-03-31)
- [2026-03-31 01:00] Inisiasi Fase 4 Sub-Fase 3: instalasi dependency dan persiapan login premium.
- [2026-03-31 01:05] Penyelesaian Fase 4 Sub-Fase 3: transisi login, validasi input, dan UX autentikasi.
- [2026-03-31 01:10] Inisiasi Fase 1 Intel-Enrichment (research).
- [2026-03-31 01:12] Detail rencana Fase 1 disiapkan.
- [2026-03-31 01:15] Fase 1 selesai: enrichment flow OpenCTI di triage.
- [2026-03-31 01:20] Inisiasi Fase 2 Case-Collaboration (research).
- [2026-03-31 01:21] Detail rencana Fase 2 disiapkan.
- [2026-03-31 01:38] Fase 2 selesai: kolaborasi kasus dan peningkatan workflow investigasi.
- [2026-03-31 01:41] Inisiasi Fase 3 Reporting & Metrics.
- [2026-03-31 02:05] Fase 2 & 3 selesai: reporting operasional dan strategis.
- [2026-03-31 02:09] Inisiasi Fase 5 System Health & final consolidation.
- [2026-03-31 02:17] Finalize: baseline SOC OPS Dashboard completed.
- [2026-03-31 02:50] Fase AIO v2.5: enhancement Landing/About page.

### 15.2 Fase v2.5.x (2026-04-01)
- [2026-04-01 09:30] Hotfix v2.5.1: resolusi routing 404 pasca login.
- [2026-04-01 09:55] v2.5.1: role Executive Auditor (read-only).
- [2026-04-01 16:40] v2.5.2: hardening persona demo + data obfuscation.
- [2026-04-01 18:15] Hotfix v2.5.3: perbaikan error state/404 di Alerts.
- [2026-04-01 18:25] v2.5.4: peningkatan interaktivitas UI.
- [2026-04-01 18:40] v2.5.5: overhaul Settings + integration hub.
- [2026-04-01 19:00] v2.5.6: refinement user management + identity persistence.
- [2026-04-01 19:10] v2.5.7: global logo upload + whitelabeling.
- [2026-04-01 19:15] v2.5.8: operational user management + integration hardening.

### 15.3 Fase v3.x (2026-04-01 s.d. 2026-04-02 dini hari)
- [2026-04-01 19:48] v3.0.0 Professional Architecture: service layer dan error resilience.
- [2026-04-01 21:15] v3.0.0-PRO-READY: linguistic & operational overhaul.
- [2026-04-01 22:30] v3.1.0 Integration Readiness.
- [2026-04-01 23:15] v3.2.0 Advanced Backend Hardening (manager/indexer split).
- [2026-04-02 01:15] v3.3.0 Production Integrity & UX Hardening.

### 15.4 Fase v4.0.x (2026-04-02)
- [2026-04-02 01:30] v4.0.0 Full Production Mode (hapus mode simulasi, context migrasi).
- [2026-04-02 01:35] Hotfix v4.0.1 Real Network Handshake.
- [2026-04-02 01:48] Hotfix v4.0.2 Production Linguistic Overhaul.
- [2026-04-02 02:00] v4.0.3 Localization & UX Finalization.
- [2026-04-02 02:25] v4.0.4 Dynamic Connection Status Logic.
- [2026-04-02 02:30] v4.0.5 Validation-Driven Status Reset.

### 15.5 Fase v4.1.x (2026-04-02)
- [2026-04-02 03:10] v4.1.0 Roadmap Execution Wave 1.
- [2026-04-02 03:40] v4.1.1 Credential & API Error Hygiene.
- [2026-04-02 04:25] v4.1.2 Per-Page Runtime Protection.
- [2026-04-02 04:55] v4.1.3 Full Audit + Documentation Consolidation.
- [2026-04-02 05:15] v4.1.4 Lint Baseline Zero-Warning.
- [2026-04-02 05:35] v4.1.5 Route-Level Code Splitting.
- [2026-04-02 06:05] v4.1.6 Runtime Degraded Mode Localization.

### 15.6 Status Aktivitas
- Semua item di atas berstatus **Completed**, kecuali jika ada catatan khusus pada release berikutnya.

### 15.7 Fase v4.2.x (2026-04-03)
- [2026-04-03 00:20] v4.2.0 Reports UX & PDF Scope Controls.
  - Radar chart diperkecil dan proporsional terhadap blok Executive Summary.
  - Menambah kontrol cakupan export PDF (`semua data` / `data terpilih`) beserta filter severity, status, category.
  - Export PDF dipastikan data-driven dari dataset terpilih (bukan screenshot).
- [2026-04-03 00:40] v4.2.1 Reports Localization Fix.
  - Perbaikan key translasi `reports.downloadPdf` dan `reports.radarTitle` di root `reports`.
  - Penambahan key copy export scope dan fallback lowercase untuk kompatibilitas.
- [2026-04-03 01:10] v4.2.2 PDF Generation Runtime Hardening.
  - Migrasi pemanggilan tabel PDF dari `doc.autoTable(...)` ke `autoTable(doc, ...)` untuk kompatibilitas runtime.
  - Menambah `try/catch` pada aksi unduh PDF + pesan error terlokalisasi.
  - Menambah guard jumlah baris export (`MAX_ALERT_ROWS`) untuk mencegah freeze saat dataset besar.
- [2026-04-03 01:30] v4.2.3 Reports Header Cleanup.
  - Menghapus teks versi statis pada halaman Reports: `v2.1 - Data Driven` dan `SOC_OPS_v0.1.0_PROD`.
  - Merapikan posisi dropdown/tombol export menjadi layout bertingkat yang lebih stabil di desktop dan mobile.

### 15.8 Fase v4.3.x (2026-04-03)
- [2026-04-03 02:20] v4.3.0 Secure Demo Mode (Login-triggered).
  - Menambahkan tombol `Demo Mode` pada halaman login untuk akses cepat persona demo tanpa memaparkan kredensial riil.
  - Session demo dipersist dengan flag khusus (`socops_demo_mode`) agar jalur request dapat diidentifikasi aman di runtime.
- [2026-04-03 02:30] v4.3.1 BFF Demo Routing & Credential Shield.
  - Menambahkan deteksi request demo di BFF (`X-Socops-Demo-Mode` header / env `BFF_DEMO_MODE`).
  - Endpoint sensitif (`/api/alerts`, `/api/wazuh/*`, `/api/opencti/*`, `/api/telegram/*`) kini dapat mengembalikan payload mock aman pada mode demo.
  - Kredensial eksternal tidak diperlukan untuk menjalankan fitur utama selama demo.
- [2026-04-03 02:40] v4.3.2 Runtime Compatibility for Demo.
  - AlertDataContext diperbarui agar:
    - menggunakan namespace storage demo terpisah (`socops_alerts_demo_v1`),
    - melakukan seed data demo otomatis saat login demo,
    - tetap sinkron ke endpoint demo tanpa membutuhkan konfigurasi indexer host nyata.
  - PageRuntimeGuard diperbarui agar mode demo tidak diblok fallback “waiting indexer”.
  - Enrichment OpenCTI tetap berjalan dalam mode demo via jalur mock BFF.
- [2026-04-03 03:25] v4.3.4 Demo Sensitive Data Obfuscation.
  - Menambahkan komponen reusable `SensitiveText` untuk memburamkan data sensitif saat user role `demo`.
  - Data yang diburamkan pada mode demo mencakup field identitas utama: `alert ID`, `rule ID`, `hostname`, `agent endpoint`, `source IP`, serta ringkasan host/ID pada incident cluster.
  - Dropdown host filter di Alerts kini menampilkan label ter-obfuscate pada mode demo.
  - Detail sensitif di Triage diburamkan (alert ID, rule ID, hostname).
  - Dashboard `Top Hosts` dan `Recent Alerts` diburamkan pada kolom identitas sensitif.
  - Section manajemen pengguna di Settings diburamkan penuh saat mode demo.
- [2026-04-03 03:45] v4.3.6 Settings Full Obfuscation (Demo).
  - Seluruh area isian pada halaman Settings kini diburamkan pada mode demo (bukan hanya user management).
  - Menambahkan notice khusus bahwa data konfigurasi diburamkan untuk proteksi informasi sensitif.
- [2026-04-03 04:20] v4.3.8 Platform Content Realignment (Main + About).
  - Narasi halaman utama (Landing) diperbarui agar menonjolkan **fitur/fungsi aplikasi** dan **alur kerja operasional**.
  - Halaman Informasi Platform (About) direstruktur agar fokus pada:
    - Prosedur operasional standar,
    - Tahapan alur kerja aplikasi,
    - Daftar fitur dan fungsi utama aplikasi.
  - Istilah berbasis “roadmap/pengembangan” pada konten utama About diganti menjadi orientasi operasional dan kapabilitas aplikasi.
  - Sinkronisasi translasi ID/EN untuk key baru (`landing.workflowTitle`, `landing.workflow`, `about.workflowStagesTitle`, `about.workflowStages`, `about.featureFunctionsTitle`, `about.featureFunctions`).
- [2026-04-03 05:10] v4.4.0 Versioning + UX Consistency.
  - Versi platform diperbarui menjadi **V2.0** pada portal utama/login, footer aplikasi, metadata aplikasi, dan footer PDF report.
  - Label persona demo di topbar kini mengikuti translasi aktif (ID/EN) secara dinamis agar tidak terkunci pada bahasa saat login pertama.
  - Penyelarasan tooltip pada halaman utama/informasi platform agar tiap konteks menampilkan deskripsi yang spesifik dan tidak berulang.
- [2026-04-03 05:20] v4.4.1 Real-time Connection Status (Settings).
  - Status koneksi Wazuh Manager, Wazuh Indexer, dan OpenCTI kini diprobe otomatis (silent health-check) saat konfigurasi berubah.
  - Status tidak lagi menunggu klik tombol verifikasi untuk berubah; bila koneksi putus, status otomatis kembali `disconnected`.
  - Tombol verifikasi manual tetap tersedia untuk validasi eksplisit + toast feedback.
- [2026-04-03 06:00] v4.4.2 Tooltip Uniqueness Hardening (Landing/About).
  - Memisahkan key tooltip agar konteks berbeda tidak berbagi teks yang sama:
    - `tooltips.landingWorkflowTitle`
    - `tooltips.aboutSopWorkflow`
    - `tooltips.aboutWorkflowStages`
    - `tooltips.landingFeaturesTitle`
    - `tooltips.aboutFeatureFunctions`
  - Mengganti pemanggilan tooltip pada halaman Landing dan About ke key kontekstual tersebut.
  - Sinkronisasi translasi ID/EN untuk seluruh key tooltip baru agar konsisten lintas bahasa.
- [2026-04-03 06:35] v4.4.3 Main Portal Layout Refresh + Version Tag.
  - Merapikan layout Portal Utama dengan struktur informasi yang lebih hierarkis dan mudah dipindai.
  - Menambahkan ringkasan cepat operasional (Dashboard, Alert Register, Reports) untuk meningkatkan konteks awal pengguna.
  - Menambahkan badge versi baru pada portal utama: **`SOC OPS Portal V.20`**.
  - Menambah teks pendamping CTA agar fungsi portal lebih informatif (monitoring, triage, reporting dalam satu alur).
- [2026-04-03 07:20] v4.4.4 Demo Route Rework + Portal CTA Realignment.
  - Koreksi versi portal utama dari **`V.20`** menjadi **`V2.0`**.
  - Akses demo dipindahkan ke Portal Utama (sejajar tombol `Masuk Platform`) dan login demo langsung diarahkan ke route **`/demo`**.
  - Tombol demo pada halaman login diganti menjadi tombol **kembali ke portal utama**.
  - Menambahkan namespace route aman untuk mode demo (`/demo/*`) sejajar dengan route operasional (`/app/*`) agar URL demo konsisten.
  - Menyesuaikan navigasi internal berbasis role (`app` vs `demo`) pada sidebar, topbar, drill-down, shortcut triage, fallback panel, dan error boundary.
  - Menghapus copy tambahan pada portal utama:
    - `Infrastruktur Produksi Aktif`
    - `Portal informasi, monitoring, triage, dan pelaporan dalam satu alur.`
- [2026-04-03 07:35] v4.4.5 Landing Disclaimer Removal.
  - Menghapus blok `Pernyataan Sanggahan (Disclaimer)` dari Portal Utama sesuai arahan.
  - Fokus tampilan portal utama disederhanakan ke identitas platform, CTA akses, fitur, dan alur kerja.
- [2026-04-03 07:45] v4.4.6 Landing Disclaimer Label Adjustment.
  - Menyesuaikan implementasi disclaimer di Portal Utama: konten disclaimer dikembalikan, namun label teks **`Pernyataan Sanggahan`** tidak ditampilkan.
  - Blok disclaimer kini hanya menampilkan isi pesan operasional tanpa judul label.
- [2026-04-03 07:55] v4.4.7 About Disclaimer Label Adjustment.
  - Menghapus label/judul disclaimer pada halaman About dengan pendekatan yang sama seperti Portal Utama.
  - Isi disclaimer operasional tetap dipertahankan tanpa heading label.
- [2026-04-03 08:05] v4.4.8 Global Disclaimer Label Cleanup.
  - Membersihkan label global `common.disclaimer` pada dictionary translasi ID/EN agar teks `Disclaimer` tidak lagi muncul dari sumber global.
  - Menjaga konten pesan operasional di Landing/About tetap tampil tanpa heading label.
- [2026-04-03 08:15] v4.4.9 Disclaimer Label Restore (Portal + About).
  - Mengembalikan label teks **`Disclaimer!`** pada blok pesan operasional di halaman Portal Utama dan About.
  - Konten disclaimer tetap dipertahankan, dengan format label + isi pesan.
- [2026-04-03 08:25] v4.4.10 Translation Label Restore (`common.disclaimer`).
  - Mengembalikan nilai translasi `common.disclaimer` (ID/EN) di `LanguageContext.jsx` agar tidak kosong.
  - Menjaga konsistensi source translasi untuk kebutuhan komponen lain yang mungkin memakai key tersebut.
- [2026-04-03 09:10] v4.5.0 Inject Payload Hardening (Admin-Only + Safe Clear).
  - Mengganti label modul Ingesti Log menjadi **Inject Payload** pada navigasi dan judul halaman.
  - Menambahkan tombol **Hapus Payload** untuk membersihkan data injeksi lokal yang pernah diinput ke aplikasi.
  - Aksi hapus dirancang aman: hanya menghapus alert dengan marker `source = manual_ingestion`, sehingga data real dari integrasi external tetap aman.
  - Mengunci akses halaman Inject Payload agar hanya role **Admin** yang dapat membuka route dan mengeksekusi tombol aksi.
  - Menambahkan notice eksplisit pada halaman bahwa operasi clear tidak menghapus data produksi external.
- [2026-04-03 09:35] v4.5.1 Inject Copy Consistency + Clear Confirmation.
  - Menambahkan dialog konfirmasi sebelum eksekusi tombol **Hapus Payload**.
  - Menormalisasi wording UI dari `ingesti/ingestion` ke `inject` pada halaman, tooltip, status, dan action label.
  - Menyelaraskan label page runtime internal menjadi **Inject Payload** agar konsisten lintas fallback/error boundary.
- [2026-04-03 10:05] v4.6.0 RBAC Hardening (Capability Map + Route Guard).
  - Menambahkan capability matrix terpusat per role di layer auth untuk mengurangi rule tersebar dan inkonsistensi.
  - Menambahkan dukungan `requiredCapability` pada `ProtectedRoute`.
  - Mengunci route **Audit** dengan guard capability (`access_audit`) agar tidak bisa diakses langsung via URL oleh role non-authorized.
  - Mengalihkan route **Inject Payload** ke guard capability (`access_ingestion`) dan mempertahankan admin-only policy.
  - Menyatukan kontrol aksi halaman berbasis capability:
    - Alerts (`mutate_alerts`)
    - Triage (`mutate_triage`)
    - False Positive (`mutate_false_positive`)
    - Reports export (`export_reports`)
    - Settings mutate (`manage_settings`)
- [2026-04-03 10:25] v4.6.1 BFF Server-Side RBAC Enforcement.
  - Menambahkan RBAC middleware di BFF (`server/src/index.js`) berbasis header role request (`X-Socops-Role`).
  - Menetapkan capability endpoint-level:
    - `read_alerts` untuk endpoint pengambilan data (`/api/alerts`, `/api/wazuh/*`, `/api/opencti/query`).
    - `manage_integration` untuk endpoint test/auth integrasi (`/api/test/*`, `/api/wazuh/authenticate`).
    - `send_telegram` untuk endpoint notifikasi (`/api/telegram/send`).
  - Menambahkan propagasi role dari frontend axios interceptor (`src/services/api.js`) ke BFF agar policy server-side dapat dievaluasi.
  - Tujuan: mencegah bypass via manipulasi UI/front-end karena validasi otorisasi kini dijaga juga di sisi server.
- [2026-04-03 10:45] v4.6.2 Optional Strict Auth Mode (BFF).
  - Menambahkan mode **strict auth** di BFF melalui env:
    - `BFF_STRICT_AUTH=true`
    - `BFF_AUTH_JWT_SECRET=<secret>`
  - Pada strict mode, role request tidak lagi dipercaya dari header mentah; BFF mengekstrak role dari JWT Bearer yang tervalidasi HS256.
  - Menambahkan validasi mismatch antara `X-Socops-Role` dan role di payload JWT (request ditolak jika tidak konsisten).
  - Kompatibilitas tetap terjaga: default `BFF_STRICT_AUTH=false` sehingga lingkungan dev/local tidak langsung terputus.
  - Menambahkan dokumentasi variabel env baru pada `.env.example`.
- [2026-04-03 11:10] v4.7.0 UI Motion Polish (Lightweight & Performance-Safe).
  - Menambahkan transisi route ringan pada level shell aplikasi:
    - top-level route transition (`Landing/Login/App`)
    - in-app page transition (`Dashboard`, `Alerts`, `Triage`, dst.)
  - Menambahkan animasi halus saat pergantian translasi (`language switch`) melalui flag transisi terkontrol di `LanguageContext`.
  - Menambahkan micro-interaction global untuk tombol/aksi (`active scale`, `transition color/border`) agar interaksi terasa responsif tanpa animasi berat.
  - Menambahkan dukungan `prefers-reduced-motion` untuk aksesibilitas dan menjaga performa pada perangkat low-end.
  - Prinsip implementasi: durasi pendek, transform/opacity-only, tanpa animasi berat berbasis layout.
- [2026-04-03 11:30] v4.7.1 Stagger Reveal (Dashboard + Reports).
  - Menambahkan komponen reusable `StaggerGroup` + `StaggerItem` untuk animasi card/section yang konsisten dan ringan.
  - Menerapkan stagger reveal di Dashboard:
    - KPI cards
    - chart cards
    - top list cards
  - Menerapkan stagger reveal di Reports:
    - blok radar + executive summary
    - summary cards per section report
  - Tetap performance-safe: animasi pendek berbasis opacity/transform, otomatis nonaktif saat `prefers-reduced-motion`.

### 15.9 Fase v4.7.x Lanjutan (2026-04-03)
- [2026-04-03 12:10] v4.7.2 Cross-Display Responsive Hardening (Mobile to Monitor).

### [2026-04-03 13:15] Release Version: v4.7.3 "Architectural Refinement & PDF Hardening"
- Aksi: Optimalisasi alur kerja socket dan penguatan mesin ekspor laporan teknis.
- Perubahan teknis:
  - Refactor `SocketContext` menggunakan `useCallback` pada handler room (`join/leave_alert`) untuk stabilitas membership socket.
  - Hardening `reportPdfUtils` dengan format tanggal aman (*locale-aware*), humanisasi kunci metrik otomatis, dan proteksi kapasitas baris (`MAX_ALERT_ROWS`).
  - Migrasi sistem tabel PDF ke pola modular `autoTable(doc, options)` yang lebih stabil.
- File kunci:
  - `src/context/SocketContext.jsx`
  - `src/utils/reportPdfUtils.js`
- Status: Selesai (Completed).

### [2026-04-03 14:00] Release Version: v4.8.0 "Full RBAC & Data Masking Implementation"
- Aksi: Finalisasi kontrol akses berbasis kemampuan (*Capability-based RBAC*) dan proteksi data sensitif di seluruh antarmuka.
- Perubahan teknis:
  - Implementasi komponen `SensitiveText` untuk obfuscasi data (IP, Host, ID) secara dinamis berbasis pada kapabilitas role `demo`.
  - Integrasi middleware `requireCapability` pada seluruh endpoint BFF untuk validasi otorisasi di sisi server (BFF-side enforcement).
  - Penambahan otentikasi opsional tingkat tinggi (Strict Mode JWT HS256) pada BFF.
  - Lazy loading modul `CorrelationGraph` di Triage untuk performa in-app navigation yang lebih ringan.
  - Sinkronisasi global status `Inject Payload` (sebelumnya Ingestion) dengan kebijakan Admin-only dan prosedur *safe clear*.
- File kunci:
  - `server/src/index.js`
  - `src/pages/TriagePage.jsx`
  - `src/pages/AlertsPage.jsx`
  - `src/context/LanguageContext.jsx`
- Status: Selesai (Completed).
  - Menyesuaikan layout shell agar lebih aman di viewport kecil:
    - `DashboardLayout` padding mobile dipadatkan (`p-3`) untuk meningkatkan ruang konten.
    - `AppSidebar` dibuat adaptif (`86vw`, `max-width`) dengan scroll internal dan safe-area padding.
    - `AppTopbar` ditingkatkan dengan `min-w-0`, wrapping adaptif, truncation teks identitas, dan breadcrumb hanya tampil di `md+` agar tidak overflow.
  - Menyesuaikan ergonomi kontrol di `ReportsPage`:
    - seluruh dropdown scope/filter PDF menjadi `full-width` di mobile dan kembali proporsional di `sm+`.
    - tombol unduh PDF dibuat responsif (`full-width` di mobile, auto di desktop).
    - header reports dipadatkan agar tetap rapi di HP tanpa memotong konteks.
  - Menambah hardening table UX di `AlertsPage` dan `FalsePositivePage`:
    - horizontal scroll diberi `overscroll containment` + momentum touch (`table-scroll`).
    - tinggi viewport tabel virtual disesuaikan dinamis agar nyaman di perangkat kecil.
    - baris search + tombol ekspor disusun ulang agar tidak tumpang tindih pada layar sempit.
  - Menambah guard CSS global untuk kompatibilitas lintas display:
    - `overflow-x: hidden` di body untuk mencegah horizontal bleed.
    - `-webkit-text-size-adjust: 100%` untuk stabilitas ukuran font di mobile browser.
    - `img/svg/video/canvas { max-width: 100%; }` untuk mencegah elemen media melebihi container.

### [2026-04-03 15:30] Release Version: v4.8.1 "Golden Data & Demo Mode Hardening"
- Aksi: Pengerasan isolasi data Mode Demo untuk mencegah kontaminasi dari data operasional atau penghapusan manual.
- Perubahan teknis:
  - **Golden Dataset Identity**: Penandaan seluruh data demo statis dengan tag `source: 'gold_demo'` pada `wazuhData.js` (Frontend) dan `demoData.js` (BFF).
  - **Logical Isolation Fix**: Memperbaiki logika sinkronisasi di `AlertDataContext.jsx` agar melewati (*skip*) proses sinkronisasi Indexer saat persona `demo` aktif.
  - **Immutable Dataset Protection**: Memperbarui logika `clearIngestedPayloads` untuk mengecualikan data bertanda `gold_demo`, sehingga dataset utama demo tidak pernah terhapus oleh aksi "Hapus Payload".
  - **Persistence Routing**: Memastikan data demo tersimpan di namespace `alertsDemo` yang terisolasi dari namespace `alerts` operasional.
- File kunci:
  - `src/context/AlertDataContext.jsx`
  - `src/data/wazuhData.js`
  - `server/src/services/demoData.js`
- Status: Selesai (Completed).

### [2026-04-03 04:28] Release Version: v4.8.2 "Dynamic Branding Integration"
- Aksi: Finalisasi migrasi sistem branding dinamis. Seluruh identitas hardcoded (nama platform, organisasi) diganti dengan variabel dari `SettingsContext`.
- Perubahan teknis:
  - **LoginPage.jsx**: Copyright footer menggunakan `settings.appName` dan `new Date().getFullYear()` secara dinamis.
  - **AppFooter.jsx**: Import `useSettings`, copyright menggunakan `settings.orgName` dan tahun dinamis.
  - **reportPdfUtils.js**: Footer PDF menggunakan `settings.appName` menggantikan "UNIFIED SOC DASHBOARD".
- Hasil audit branding:
  - `grep "OpenClaw" src/` → 0 hasil
  - `grep "SOC OPS Dashboard" src/` → 0 hasil
  - `grep "UNIFIED SOC" src/` → 0 hasil
  - `grep "Sigit Adi" src/` → 0 hasil
- File kunci:
  - `src/pages/LoginPage.jsx`
  - `src/components/layout/AppFooter.jsx`
  - `src/utils/reportPdfUtils.js`
  - `src/context/SettingsContext.jsx` (sumber konfigurasi)
- Status: Selesai (Completed).

### [2026-04-03 04:39] Release Version: v4.8.3 "Complete Branding Audit & Deep Migration"
- Aksi: Audit menyeluruh terhadap seluruh codebase dan penggantian semua sisa branding hardcoded.
- Perubahan teknis:
  - **LandingPage.jsx**: Badge "SOC OPS Portal V2.0" → `{settings.appName} Portal V2.0`
  - **useAppMeta.js**: Refactor total, appName sekarang menggunakan `settings.appName` + `settings.orgName` dari SettingsContext
  - **telegramService.js**: `sendAlert()` menerima parameter `appName` untuk notifikasi Telegram dinamis
  - **IntegratorGuide.jsx**: Teks panduan teknis menggunakan `settings.appName` dinamis
  - **AppFooter.jsx**: Heading footer `t('common.appTitle')` → `settings.appName`
  - **reportPdfUtils.js**: Header PDF, verification footer, dan nama file output semuanya menggunakan `settings.appName`
  - **SettingsContext.jsx**: Menambahkan `document.title` dinamis berdasarkan `settings.appName`
- Hasil audit final codebase:
  - Semua referensi UI ke nama platform sudah menggunakan `settings.appName`
  - Semua referensi UI ke organisasi sudah menggunakan `settings.orgName`  
  - Semua referensi logo sudah menggunakan `settings.appLogo`
  - Browser tab title berubah otomatis mengikuti `settings.appName`
  - Favicon berubah otomatis mengikuti `settings.appLogo`
- File kunci yang dimodifikasi:
  - `src/pages/LandingPage.jsx`
  - `src/hooks/useAppMeta.js`
  - `src/services/telegramService.js`
  - `src/components/settings/IntegratorGuide.jsx`
  - `src/components/layout/AppFooter.jsx`
  - `src/utils/reportPdfUtils.js`
  - `src/context/SettingsContext.jsx`
- Status: Selesai (Completed).

### Activity Log (v4.8.4 - 2026-04-03) - Paripurna Audit & Security Hardening
- **Security Hardening (RBAC)**: Enforced strict `ProtectedRoute` on `/settings` and implemented logic-based visibility for Sidebar menu items.
- **Unified Audit Ecosystem**: Implemented `systemLogs` in `AlertDataContext` to track non-alert events (Logins, Injections, Config changes).
- **Audit Log Redesign**: Upgraded `AuditLogPage.jsx` to a unified chronological view for both Alert History and System Activities with dedicated visual cues.
- **Premium UI Overhaul**: Redesigned `AboutPage.jsx` with a production-ready aesthetic and dynamic workflow visualization.
- **Sync Stability**: Refactored Wazuh polling logic to use a recursive `setTimeout` pattern, preventing race conditions and task overlaps.
- **Operational Status Indicators**: Integrated `SyncIndicator` into the Topbar for real-time data connectivity feedback.
- **Critical Logic Fix**: Resolved a destructuring bug in `LoginPage.jsx` that caused authentication failure.
- **Branding Audit**: Verified 100% dynamic branding across application (Document Title, Favicon, Page Headers, Footers, and PDF Reports).

### Activity Log (v4.8.5 - 2026-04-03) - Runtime Stability & UI Polish
- **Critical Fix - Runtime Syntax Error**: Memperbaiki `SyntaxError: Invalid or unexpected token` pada file `src/utils/sensitiveData.js` akibat karakter korup (`return \\\\\`). Perbaikan ini memulihkan akses ke halaman Alerts dan Dashboard.
- **Bug Fix - Async Cleanup**: Menyelesaikan `ReferenceError: cancelled is not defined` pada `AlertDataContext.jsx` dengan deklarasi flag pembersihan yang tepat dalam `useEffect` untuk mencegah kebocoran state asinkron.
- **UI Refresh - Threat Radar**: Optimasi visual **Radar Distribusi Ancaman** di Pusat Laporan. Ukuran diperbesar (`180px` → `340px`), radius ditingkatkan ke `80%`, dan ditambahkan efek *gradient fill* untuk tampilan yang lebih premium dan proporsional.
- **Localization - Sync Indicator**: Menambahkan kunci terjemahan yang hilang (`common.syncing`, `common.syncError`, `common.synchronized`) pada `LanguageContext.jsx` (ID/EN) untuk memberikan feedback konektivitas yang akurat di Topbar.

### Activity Log (v4.8.6 - 2026-04-03) - Public Deployment & Logic Alignment
- **Feature - Sync Indicator Hardening**: Memperbaiki anomali logika pada `SyncIndicator`. Sekarang, jika Host Wazuh tidak dikonfigurasi, indikator akan menampilkan status **"Belum Dikonfigurasi"** (muted) alih-alih menampilkan status "Terhubung" yang menyesatkan.
- **Documentation - Public README Audit**: Melakukan audit dan penulisan ulang `README.md` untuk keperluan publik (GitHub). Menghapus detail implementasi internal dan roadmap sensitif, serta menyajikan fitur aplikasi dalam narasi profesional tingkat tinggi.
- **Security - .gitignore Hardening**: Memperketat filter `.gitignore` untuk mencegah kebocoran file `.env` dan *dependencies* server ke repositori publik.
- **Deployment - GitHub Pages Live**: Berhasil melakukan deployment platform ke GitHub Pages dengan basis path `/scops/`.

### Activity Log (v4.8.7 - 2026-04-03) - Routing Resilience & Integration UX
- **Critical Fix - Router Crash Recovery**: Menghapus `lazy loading` pada boundary `App.jsx` dan merestrukturisasi perutean menggunakan _absolute path_ untuk memecahkan dilema "404 Resource Out of Reach". Mengatasi _ReferenceError_ akibat ketiadaan deklarasi `user` saat proses destrukturisasi di `AppSidebar.jsx` saat `DashboardLayout` di-_mount_.
- **Localization - Legal Compliance**: Mengekstraksi teks hardcode "Legal Disclosure & Usage Bound" di `AboutPage.jsx` menjadi variabel dinamis (`disclaimerTitle`) dan menambahkan terjemahan Indonesia untuk kepatuhan operasional.
- **UX - Telegram Integration Audit**: Memasukkan `Telegram` ke dalam string pengecekan integrasi prasyarat (BFF) agar analis mendapat informasi utuh terkait integrasi yang tertunda.
- **Diagnostic - Backend/Static Hosting Environment**: Menyempurnakan alur panduan saat server gagal menjangkau layanan pihak ketiga akibat absennya Node BFF (menghasilkan HTTP 405/404 di GitHub Pages atau 500 saat proksi target mati di Vite).

**Status**: LIVE & STABIL (Versi Publik Selesai) 🚀

### 15.10 Fase v4.9.x (2026-04-04)

### [2026-04-04 12:16] Release Version: v4.9.0 "Demo Route Independence & Rich Tooltips Foundation"
- Aksi: Memisahkan akses route demo dari alur login dan membangun fondasi sistem tooltip interaktif pada indikator konektivitas.
- Perubahan teknis:
  - **Demo Route Independence**: Route `/demo` kini dapat diakses langsung via browser tanpa redirect ke halaman login. Mekanisme auto-login guest diimplementasikan pada `App.jsx` saat path `/demo` terdeteksi.
  - **Rich Tooltip System**: Membangun komponen `IndicatorTooltip` dengan panel hover yang menampilkan status koneksi real-time untuk setiap layanan eksternal.
  - **Tooltip Wazuh**: Menampilkan dua subsistem terpisah (Manager API v4 + Indexer Data Node) dengan detail host, port, user, dan status koneksi.
  - **Tooltip OpenCTI**: Menampilkan URL endpoint, confidence threshold, dan status koneksi.
  - **Tooltip Telegram**: Menampilkan chat ID dan status bot.
  - **Demo Obfuscation**: Data sensitif (host, user) diburamkan otomatis (`••••••••`) saat persona demo aktif.
- File kunci:
  - `src/App.jsx` (demo auto-login)
  - `src/components/navigation/AppTopbar.jsx` (IndicatorTooltip, ConnectivityIndicators)
  - `src/context/LanguageContext.jsx` (translation keys ID/EN)
- Status: Selesai (Completed).

### [2026-04-04 12:30] Release Version: v4.9.1 "Wazuh Full Configuration Tooltip"
- Aksi: Memperkaya tooltip Wazuh dengan informasi konfigurasi lengkap dan metadata sinkronisasi.
- Perubahan teknis:
  - **Manager Section**: Menampilkan detail endpoint (host + port 55000), API user, dan status API (`connected`/`disconnected`).
  - **Indexer Section**: Menampilkan detail endpoint (host + port 9200), user indexer, dan status data.
  - **Sync Metadata**: Menampilkan waktu sinkronisasi terakhir (`lastSuccessfulSyncAt`) dan interval refresh data.
  - **Error Panel**: Menampilkan pesan error beserta hint teknis saat sinkronisasi gagal.
  - **Status Badge Dynamic**: Badge header berubah antara DEMO / ONLINE / PARTIAL / OFFLINE / SYNC sesuai kondisi real.
  - **Bilingual Support**: Seluruh label teknis diterjemahkan (ID/EN) termasuk `managerTitle`, `indexerTitle`, `apiStatus`, `dataStatus`, `lastSync`, `refreshInterval`.
- File kunci:
  - `src/components/navigation/AppTopbar.jsx` (wazuhPanel redesign)
  - `src/context/LanguageContext.jsx` (+14 translation keys)
  - `src/context/SettingsContext.jsx` (schema referensi)
- Status: Selesai (Completed).

### [2026-04-04 12:52] Release Version: v4.9.2 "Real-Time Indicator Animations"
- Aksi: Implementasi animasi CSS premium pada indikator konektivitas untuk feedback visual real-time yang intuitif.
- Perubahan teknis:
  - **CSS Keyframe Animations** (`index.css`):
    - `indicator-glow` — Pendaran hijau lembut (2.5s) untuk status Connected.
    - `indicator-alert` — Denyut merah cepat (1.6s) untuk status Disconnected.
    - `indicator-sync` — Cincin cyan berputar (1.2s) untuk status Syncing.
    - `indicator-partial` — Denyut amber (2s) untuk status Partial.
    - `indicator-dot-breathe` — Animasi breathing pada ikon (opacity + scale).
  - **Dynamic Indicator Pills** (`AppTopbar.jsx`):
    - Border color pill berubah sesuai status: `emerald-500` (connected), `rose-500` (disconnected), `cyan-500` (syncing), `amber-500` (partial).
    - Label text color berubah dinamis sesuai status layanan.
    - Ikon menggunakan animasi breathing saat disconnected/partial.
    - Wazuh menampilkan ikon berbeda per status: `Shield` (connected), `ShieldOff` (disconnected/error), `RefreshCw` (syncing).
- File kunci:
  - `src/index.css` (+33 baris: 6 keyframes, 5 utility classes)
  - `src/components/navigation/AppTopbar.jsx` (indicator rendering overhaul)
- Status: Selesai (Completed).

### [2026-04-04 13:00] Release Version: v4.9.3 "Settings Real-Time Status & Validation Hardening"
- Aksi: Menjembatani perubahan status koneksi dari halaman Settings ke global state secara real-time, memperbaiki validasi input, dan melengkapi field konfigurasi yang hilang.
- Perubahan teknis:
  - **Real-Time Status Propagation** (`SettingsContext.jsx`):
    - Menambahkan fungsi `updateServiceStatus(serviceId, status)` untuk memperbarui global state tanpa menunggu tombol Save.
    - `SettingsProvider` kini meng-expose `updateServiceStatus` melalui context value.
  - **Bidirectional Status Update** (`SettingsPage.jsx`):
    - `setServiceStatus()` kini memperbarui **dua target** sekaligus: `localSettings` (form) dan `settings` (global/topbar) melalui `updateServiceStatus()`.
    - Indikator topbar berubah **segera** saat test connection berhasil/gagal.
  - **Wazuh Indexer Credentials** (`SettingsPage.jsx`):
    - Menambahkan field **User** dan **Password** pada panel Indexer Data Node (sebelumnya hanya host/port).
    - Port input diubah ke `type="number"` dengan validasi `min=1 max=65535`.
  - **Pre-Test Validation Hardening** (`SettingsPage.jsx`):
    - Port: Validasi numerik range 1-65535 sebelum API call.
    - Telegram: Wajib `enabled=true`, `token ≥ 10 karakter`, dan `chatId` tidak kosong.
    - OpenCTI: URL wajib `http/https`, token ≥ 8 karakter dan bukan masked.
    - Wazuh: Host wajib ≥ 3 karakter.
  - **Dependency Chain Fix**: Menambahkan `updateServiceStatus` ke dependency array `useCallback` untuk stabilitas referensi.
- File kunci:
  - `src/context/SettingsContext.jsx` (+16 baris: `updateServiceStatus` + provider update)
  - `src/pages/SettingsPage.jsx` (~50 baris: real-time status, validasi, indexer fields)
- Status: Selesai (Completed).

### [2026-04-04 17:15] Release Version: v4.9.4 "Refine Demo Mode Obfuscation Logic"
- Aksi: Pemurnian strategi perlindungan mode demo dari efek CSS blur menjadi input masking berlevel konfigurasi rahasia.
- Perubahan teknis:
  - **SensitiveText Component**: Menghilangkan class CSS `blur-[4px]` dan pointer-events sehingga mock data pada alert tabel, dashboard list, dll. dapat terlihat dan bereaksi sewajarnya untuk presentasi demo.
  - **SettingsPage Config Obfuscation**: Area settings tidak lagi menggunakan efek blur secara masif melainkan mengalihkan *input form field* (Host, Port, User, URL, Chat ID, Token) ke format `password` yang menampilkan string bintang `********` untuk merahasiakan struktur konfigurasi sesungguhnya.
  - **Root Directory Cleanup**: Menghapus salinan sampah dokumentasi `manual_book.md` di level parrent branch serta menghapus rilis lama `scops-main.zip` secara langsung lewat shell Git.
  - **Documentation Alignment**: Pembaruan status rilis dan dokumentasi `README.md` mengenai model golden dataset yang tidak lagi diblur, tetapi menutupi (mask) password pada setingan layanannya saja untuk operational security.
- File kunci:
  - `src/components/common/SensitiveText.jsx`
  - `src/pages/SettingsPage.jsx`
  - `README.md`
- Status: Selesai (Completed).

### 15.11 Fase v5.x (2026-04-05) - Architecture Stability & Unified CLI
- [2026-04-05 10:15] v5.0.0 Wazuh Multi-Node Status Logic.
  - Memperbarui logika indikator status Wazuh di topbar agar mengecek subsistem secara independen (Manager API vs Indexer Data Node).
  - Indikator kini mendukung status `PARTIAL` (kuning) jika salah satu subsistem terputus.
- [2026-04-05 10:30] v5.0.1 BFF SyntaxError Resolution.
  - Menghapus duplikasi fungsi `resolveManagerConfig` dll. di `server/src/index.js` yang menyebabkan server gagal booting.
  - Mengonsolidasi logika pencarian URL (host:port) ke dalam layer service agar lebih robust dan mendukung default homelab.
- [2026-04-05 10:45] v5.0.2 Notification Service Data-Path Fix.
  - Memperbaiki kegagalan impor di `notificationService.js` pasca refactor index.js.
  - Memperbaiki bug akses properti `._source` pada data alert; sistem kini menggunakan properti hasil normalisasi (`ruleLevel`, `ruleDescription`) sehingga notifikasi Telegram terkirim akurat.
- [2026-04-05 11:30] v5.1.0 Unified Developer Experience (UX).
  - Menambahkan script `start` di `package.json` menggunakan `npx concurrently` untuk menjalankan Frontend & Backend dalam satu perintah.
  - Membuat skrip manajemen sistem `socops` yang tersedia secara global melalui alias PowerShell $PROFILE.
- [2026-04-05 11:45] v5.1.1 Process Lifecycle Management Hardening.
  - Memperbarui `Stop-ScopsServices` pada `scops.ps1` agar menggunakan `taskkill /F /T` untuk membersihkan seluruh process tree (mencegah proses zombie Node.js).
  - Memperbaiki konflik variabel sistem `$PID` di PowerShell dengan mengubahnya menjadi `$targetPid`.
  - Menghapus pengecekan integritas eksternal pada perintah `socops status` agar respon terminal instan dan hanya fokus pada layanan internal (BFF & UI).
- [2026-04-05 12:15] v5.1.2 Documentation Sync & Manual Book Update.
  - Sinkronisasi seluruh log aktivitas terbaru ke dalam `manual_book.md`.

**Status**: STABIL & OPTIMIZED (Unified CLI System Active) 🚀

### [2026-04-06 09:45] UI/UX Review & Application Assessment
- Aksi: Review menyeluruh aplikasi live di localhost:5173 untuk evaluasi logic, workflow, dan UX/UI.
- Perubahan teknis (Assessment):
  - **Scope Review**: Dashboard, Alerts Register, Triage Workspace, Reports Center, False Positive Archive, Inject Payload, About, Settings.
  - **Language**: Indonesia (ID), Role: Admin.
  - **Strengths**: Topbar connectivity indicators, glassmorphism dark theme, bilingual support, tooltip system, RBAC UI.
  - **Issues**: Empty states kurang informatif, integration error tanpa troubleshoot guide, bulk actions UX, mobile table overflow risk.
  - **Rekomendasi Prioritas**: Empty state enhancement, integration help guides, bulk action UX fix, mobile optimization, settings tabs.
- File review lengkap: `UI_REVIEW_2026-04-06.md`
- Status: Review Selesai — Rekomendasi untuk iterasi UX berikutnya.

### [2026-04-06 10:00] Elaborasi Komprehensif: Database Schema, UI/UX Mockups, Deployment Architecture
- Aksi: Membuat 3 dokumen detail elaborasi sebagai panduan lengkap untuk production deployment.
- Output Dokumen:
  1. **`DETAILED_SCHEMA_2026-04-06.md`** — PostgreSQL schema lengkap (6 tabel utama + supporting), Prisma ORM, migration script, RLS policies, backup strategy.
  2. **`EMPTY_STATE_MOCKUPS_2026-04-06.md`** — Empty state designs untuk Dashboard, Alerts, Triage, Integration Error Tooltips, Bulk Actions UX, Settings Tabs, Mobile Responsive. Includes JSX implementation examples.
  3. **`DEPLOYMENT_ARCHITECTURE_2026-04-06.md`** — Production deployment architecture dengan Docker Compose, Nginx reverse proxy, SSL/TLS, monitoring (Prometheus/Grafana), backup automation, CI/CD pipeline.
- Coverage Area:
  - **Database**: 6 core tables (users, cases, audit_logs, settings, integration_configs, alert_cache) dengan RLS, encryption at rest, full-text search.
  - **UI/UX**: 7 critical empty state scenarios, bulk action progressive UX, integration error troubleshooting flows, mobile-first responsive patterns.
  - **Deployment**: VPS architecture $40-65/bulan, Docker Compose stack, security hardening (fail2ban, rate limit, helmet), automated backup ke S3.
- Key Metrics:
  - Estimated Production Setup Time: 3-5 hari
  - Monthly VPS Cost: $48-65 (DigitalOcean/Linode)
  - Database Migration: localStorage → PostgreSQL (automated script provided)
  - Security Level: Production-ready dengan TLS 1.3, HttpOnly cookies, BCrypt hashing.
- Dokumen tersedia di workspace root untuk immediate implementation reference.
- Status: Elaborasi Selesai — Siap untuk sprint implementation.

---

### [2026-04-06 09:30] Code Review & Architecture Assessment by AI Assistant
- Aksi: Melakukan audit menyeluruh terhadap source code SOC OPS Dashboard untuk mengevaluasi kualitas kode, arsitektur, dan mengidentifikasi area pengembangan lanjutan.
- Perubahan teknis (Assessment Only):
  - **Architecture Analysis**: Review BFF pattern, RBAC implementation (6 roles + capability matrix), lazy loading strategy, Context pattern untuk state management.
  - **Security Review**: PBKDF2-SHA256 password hashing, JWT-ready strict mode, server-side RBAC enforcement, demo mode data isolation (gold_demo tagging).
  - **Performance Audit**: Route-level code splitting, bundle optimization, TanStack Virtual untuk large datasets, Framer Motion dengan reduced-motion support.
  - **Code Quality**: ESLint config modern (flat config), no TODO/FIXME ditemukan, ~40+ JS/JSX files dengan struktur modular.
- Saran strategis untuk pengembangan:
  1. **Testing Strategy**: Implementasi test suite (unit, integration, e2e) — currently no test files detected.
  2. **Type Safety**: Migrasi bertahap ke TypeScript atau JSDoc types untuk critical paths.
  3. **Performance**: Service worker untuk offline capability, manual chunking di Vite.
  4. **Observability**: Error tracking (Sentry), health check endpoint, analytics integration.
  5. **SOAR Playbooks**: Automation workflow untuk incident response (next major feature).
- File kunci yang direview:
  - `src/router/index.jsx` (lazy loading + code splitting)
  - `src/context/AuthContext.jsx` (RBAC capability matrix)
  - `src/services/api.js` (error handling + localization)
  - `server/src/index.js` (BFF middleware + RBAC enforcement)
  - `src/components/layout/DashboardLayout.jsx` (responsive + animation)
  - `src/App.jsx` (Framer Motion integration)
  - `package.json` (dependency audit)
- Status: Review Selesai — Semua saran didokumentasikan untuk roadmap pengembangan berikutnya.

**Kesimpulan Review**: Proyek dalam kondisi **production-ready** dengan arsitektur mature, security considerations solid, dan UX yang polished. Prioritas next step: testing coverage dan observability untuk enterprise deployment.

### [2026-04-07 13:45] Release Version: v5.3.1 "Footer Restoration & Visual Hardening"
- Aksi: Restorasi navigasi footer dan perbaikan bug visual kritis (white screen).
- Perubahan teknis:
  - Resolusi `SyntaxError` akibat import icon `Github` pada `lucide-react` (diganti ke `GitHub`).
  - Restorasi tumpukan Provider di `main.jsx` dan routing di `src/router/index.jsx`.
  - Penambahan kunci translasi footer (`securePlatform`, `documentation`, `support`, `privacy`) di `LanguageContext.jsx`.
  - Implementasi "Ultimate Clarity" (True Black typography) untuk light mode visibility.
- File kunci:
  - `src/context/LanguageContext.jsx`
  - `src/components/layout/AppFooter.jsx`
  - `src/main.jsx`
  - `src/App.jsx`
- Status: Completed.

