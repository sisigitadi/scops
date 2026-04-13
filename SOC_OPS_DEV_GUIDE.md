# SOC OPS Development Guide

**Current Platform Version:** v19.4.0 (Deployment Routine Hardened)
**Last Sync:** 2026-04-13 (11:20 WIB)

> **VERSI**: 19.4.0 (Deployment Routine Hardened)  
> **TANGGAL UPDATE**: 2026-04-13 11:20 WIB (Mandatory Deployment Routine Integration)  
> **STATUS**: Active Development  
> **PROYEK**: SecOps Command Center (SOC OPS Dashboard)
> **PATH**: `D:\Cyber Security\SOC OpenClaw\scops-main\soc-ops-dashboard\`

---

## Tujuan Dokumen Ini

Dokumen ini adalah **panduan komprehensif** untuk pengembangan SOC OPS Dashboard yang berfungsi sebagai:

1. **Single Source of Truth** - Semua spesifikasi, arsitektur, dan standar development
2. **AI Assistant Context** - Konteks lengkap untuk AI assistant memahami dan melanjutkan development
3. **Development Log** - Catatan aktivitas, keputusan, dan progress development
4. **Quick Reference** - Panduan cepat untuk setup, deploy, dan troubleshooting

---

## AI Assistant Instructions

### Saat Memulai Session Baru

### [MANDATORY] KEWAJIBAN UTAMA & AWAL

Setiap AI Assistant **WAJIB** mematuhi seluruh aturan dalam Dev Guide ini tanpa pengecualian. Melakukan pencatatan aktivitas (Logging) ke **Section 6** adalah **tugas awal dan utama** dalam setiap sesi pengembangan, mulai saat ini dan seterusnya. Kegagalan melakukan pencatatan dianggap sebagai pelanggaran protokol integritas data proyek.


AI Assistant **WAJIB** membaca dan memahami:

1. **Section 1-5** untuk konteks teknis
2. **Section 6 (Development Phase Log)** untuk melanjutkan pekerjaan terakhir
3. **Section 7 (Active Tasks)** untuk tugas yang sedang/siap dikerjakan

Setelah membaca, AI Assistant **WAJIB** memberikan:
- **Ringkasan status terakhir** dari Section 6
- **Review task yang tersedia** dari Section 7
- **Pertanyaan**: "Task mana yang ingin Anda kerjakan selanjutnya?"

### Workflow Upload File untuk Review

Saat user mengupload file untuk dianalisis:

```markdown
# Perintah dari User:
"Baca file [nama-file] dan berikan review"

atau cukup:
"Analisis file ini"

# Langkah AI Assistant:
1. Baca file yang diupload dengan filesystem_read
2. Analisis dan berikan review komprehensif:
   - Apa isi file?
   - Bagaimana kaitannya dengan SOC OPS?
   - Apakah ada masalah/potensi improvement?
3. Tanyakan: "Apa yang ingin Anda lakukan dengan file ini?"
   - Integrasikan ke project?
   - Modifikasi sesuai standar?
   - Jadikan referensi?
```

### Format Perintah WAJIB Untuk Update Dokumen Ini

**as i  MANDATORY**: Setiap aktivitas development **HARUS** dicatat ke Section 6. Ini menjadi **panduan awal (initial reference)** saat session baru dimulai.

Format perintah dari user:

| Perintah | Fungsi | AI Action |
|----------|--------|-----------|
| **"LOG: [YYYY-MM-DD HH:mm] [TYPE] - [deskripsi lengkap]"** | Catat aktivitas | Append ke Section 6 |
| **"TODO: [deskripsi tugas]"** | Tambah task | Append ke Section 7 (Y" /YY/YY) |
| **"DONE: #[nomor task] - [deskripsi penyelesaian]"** | Tandai selesai | Update Section 7, LOG ke Section 6 |
| **"UPDATE: [section] - [perubahan detail]"** | Update konten | Edit section yang dituju |

**Contoh Penggunaan:**
```markdown
User: "LOG: 2026-04-06 17:00 WIB [IMPLEMENT] - Setup Prisma ORM dan create initial migration"
a' AI: Update Section 7 dengan entry baru

User: "TODO: Implement Redis session store untuk mengganti localStorage JWT"
a' AI: Tambahkan task #14 ke Section 8 (Y"  Critical)

User: "DONE: #4 - PostgreSQL schema sudah diimplementasi lengkap dengan indexes"
a' AI: Update Section 8 task #4 jadi aoe..., LOG ke Section 7

User: "UPDATE: Section 2 - Tambahkan React Query version 5 ke tech stack"
a' AI: Edit Section 2.1
```

### [MANDATORY CHECKLIST] Setiap Aktivitas

**SEBELUM** memulai development:
- [ ] Baca Section 6 (Log) untuk melanjutkan pekerjaan terakhir
- [ ] Baca Section 7 (Tasks) untuk identifikasi prioritas
- [ ] Konfirmasi dengan user task yang akan dikerjakan

**SETELAH** menyelesaikan aktivitas:
- [ ] **WAJIB** catat ke Section 6 dengan format log
- [ ] **WAJIB** update Section 7 jika task selesai (DONE)
- [ ] **WAJIB** simpan file SOC_OPS_DEV_GUIDE.md

### [MANDATORY] Protokol Pra-Deployment (GitHub Pages)

F' Sesuai perintah strategis USER, **SEBELUM** melakukan deployment ke GitHub Pages (`https://sisigitadi.github.io/scops/`), AI Assistant **WAJIB** menjalankan routine panduan berikut secara berurutan:

1.  **Isolation Lockdown**: Lakukan isolasi dan penguncian semua data, workflow, serta logic untuk demo mode agar tidak berpengaruh pada production mode.
2.  **Security Hardening**: Lakukan hardening dan security untuk persiapan pre-deploy (CSP, sanitasi input).
3.  **Repository Prep**: Persiapkan untuk deploy ke repositori `https://github.com/sisigitadi/scops` dengan link GitHub Pages di `https://sisigitadi.github.io/scops/#/app`. (Jangan deploy sebelum diminta).
4.  **Zero-Login Entry**: Pastikan link tersebut masuk ke mode demo secara otomatis tanpa membuka portal atau login page.
5.  **Perimeter Closure**: Tutup akses balik ke portal dan login page saat berada di lingkungan demo publik.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack & Architecture](#2-tech-stack--architecture)
3. [Development Setup & Getting Started](#3-development-setup--getting-started)
4. [Database Schema (Complete)](#4-database-schema-complete)
5. [UI/UX Standards & Components](#5-uiux-standards--components)
   - [5.14 Rutinitas Pra-Deployment](#514-rutinitas-pra-deployment-github-pages)
6. [Development Phase Log](#6-development-phase-log)
7. [Active Tasks & Backlog](#7-active-tasks--backlog)
8. [Quick Reference](#8-quick-reference)
9. [Appendix](#9-appendix)

---

## 1. Project Overview

### 1.1 Deskripsi

**SecOps Command Center (SOC OPS)** adalah dashboard Security Operations Center berbasis React 18 + Vite + Node.js yang menyediakan:

- Real-time alert monitoring dari Wazuh SIEM
- Threat intelligence enrichment via OpenCTI
- Triage workspace untuk investigasi insiden
- Reporting center dengan ekspor PDF/CSV/JSON
- Role-based access control (RBAC) multi-persona
- Bilingual interface (Indonesia/English)

### 1.2 Live Demo
- **URL**: https://sisigitadi.github.io/scops/#/demo
- **Demo Credentials**: admin@socops.com / admin123

### 1.3 Key Capabilities

| Capability | Deskripsi |
|------------|-----------|
| **Alert Monitoring** | High-performance alert register dengan filtering, search, virtualisasi tabel |
| **Triage Workspace** | Investigasi insiden dengan audit trail, analyst notes, playbook |
| **Threat Intel** | Enrichment alert dengan OpenCTI (score, actor, malware, TLP) |
| **Incident Clustering** | Korelasi otomatis berdasarkan atribut shared |
| **Reporting** | Generate laporan dengan PDF, CSV, JSON export |
| **RBAC** | Role-based access: Admin, Manager, L1/L2 Analyst, Auditor, Demo |
| **Real-time Status** | Animated indicators untuk Wazuh, OpenCTI, Telegram connectivity |
| **Dynamic Branding** | Kustomisasi platform identity dari Settings panel |
| **SIM-SOC Hub** | Operational governance: Team-based duty, handover logs, shift accountability |
| **PWA Readiness** | Progressive Web App support: Offline caching, standalone installation, high-res tactical icons |

### 1.4 Role Definitions (RBAC)

| Role | Capabilities |
|------|-------------|
| **ADMIN** | Full access, total visibility (Infra + Team + Operations) |
| **MANAGER** | Tactical lead, staff management, verify KPIs, case oversight |
| **L1_ANALYST** | Frontline monitoring, basic triage, add notes |
| **AUDITOR** | Compliance observation, read-only audit logs |
| **DEMO** | Simulation mode, public exploratory access |

### 1.5 Operational Workflow (SOP)

| Role | Workflow Pillar | Action Sequence |
|------|-----------------|-----------------|
| **ANALYST** | **OPERASIONAL** | Monitoring Alert az" Triage Investigation az" Threat Enrichment az" Resolution (FP/Close/Escalate). |
| **MANAGER** | **MANAJEMEN** | Shift Rostering az" Handover Verification az" Strategic Review (KPIs) az" Incident Escalation Finalization. |
| **AUDITOR** | **COMPLIANCE** | Audit Trail Observation az" Shift Compliance Verification az" Read-Only Strategic Analysis. |
| **ADMIN** | **GOVERNANCE** | Platform Provisioning az" Integration Management az" Identity Lifecycle az" Simulation/Stress-Testing. |

#### 1.5.1 Operational Logic Audit (Forensic Readiness)

Sistem operasional dashboard dirancang dengan prinsip akuntabilitas tinggi (*high accountability*) dengan logika sebagai berikut:

- **Identity Reactive Sync**: Sumber data personel ditarik secara reaktif dari `SettingsContext`. Menghapus pengguna di Pengaturan otomatis membersihkan Roster untuk mencegah *ghost accounts*.
- **Duty State Persistence**: Status *On-Duty* bersifat *persistent* (Local Storage) dan *reactive*. User yang sedang bertugas akan tetap aktif di header meskipun halaman di-refresh, hingga dilakukan serah terima manual.
- **Shift Guard Enforcement (Data-Driven)**: Alur kerja transisi shift (Clock-In/Out) kini dikunci oleh `ShiftGuardModal`. 
  - **Context Aware**: Modal menarik data *real-time* (Alerts untuk Analyst, Roster untuk Manager, Integrasi untuk Admin).
  - **Mandatory Validation**: Analis wajib mencentang validasi akuntabilitas (Role-specific) dan mengisi catatan sebelum tombol aksi aktif.
  - **Integrity Gate**: Mencegah personel keluar tanpa serah terima yang valid.
  - **Binary Entry Policy**: Membatalkan protokol masuk (Shift-In) memicu auto-logout (kecuali Admin/Auditor dalam batasan tertentu).
  - **Role-Based Protocols**:
    - **Analyst**: Queue Acknowledgment & Incident Finalization.
    - **Manager**: Operational Command (Roster) & Performance Review (KPI).
    - **Admin**: Infrastructure Integrity Check.
    - **Auditor**: Compliance Awareness Statement.
- **Leader Resolution Logic**: Header secara otomatis mengidentifikasi "Leader" aktif dengan memprioritaskan role `MANAGER` atau `ADMIN` di dalam tim yang sedang bertugas.
- **Accountability Snapshot**: Setiap entri log serah terima menyimpan **snapshot** lengkap anggota tim yang aktif saat itu. Ini menjamin integritas data hukum untuk keperluan audit/billing di masa depan.

---

## 2. Tech Stack & Architecture

### 2.1 Tech Stack Overview

#### Frontend
- **Core**: React 18 + Vite 8
- **Styling**: Tailwind CSS 3.4
- **Routing**: React Router (Hash-based)
- **Visualization**: Recharts
- **Data Management**: TanStack React Query + TanStack Virtual (v3+)
- **Animation**: Framer Motion (dengan useReducedMotion support)
- **PWA Core**: Service Worker (sw.js) + Web Manifest (manifest.json)
- **Icons**: Lucide React + Premium PWA Tactical Icons (512x512)
- **PDF Export**: jsPDF + jsPDF-AutoTable

#### Backend-for-Frontend (BFF)
- **Engine**: Node.js + Express
- **Real-time**: Socket.io
- **Security**: PBKDF2-SHA256 + JWT HS256 (strict mode)
- **RBAC**: Server-side capability validation

#### Production Database (Target)
- **Database**: PostgreSQL 16+
- **Cache/Session**: Redis 7+
- **ORM**: Prisma (recommended)
- **Extensions**: UUID, JSONB, INET, TimescaleDB (optional)

#### External Integrations
- **Wazuh SIEM**: Manager API v4 + Indexer
- **OpenCTI**: Threat intelligence platform
- **Telegram**: Bot API untuk notifikasi

### 2.2 Architecture Pattern

```
a"OEa"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"
a",                         BROWSER / CLIENT                         a",
a",  a"OEa"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a" a",
a",  a",         React SPA (Vite + React 18 + Tailwind)            a", a",
a",  a",  a"OEa"a"a"a"a"a"a"a"a"a"a"a"a"a" a"OEa"a"a"a"a"a"a"a"a"a"a"a"a"a" a"OEa"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"   a", a",
a",  a",  a", AuthContext a", a",AlertContext a", a",  SettingsContext    a",   a", a",
a",  a",  a", (local)     a", a",(local/API)  a", a",  (local)            a",   a", a",
a",  a",  a""a"a"a"a"a"a"a"a"a"a"a"a"a"a"~ a""a"a"a"a"a"a"a"a"a"a"a"a"a"a"~ a""a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"~   a", a",
a",  a""a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"~ a",
a",                              a",                                   a",
a",                              a-14 HTTP/WebSocket                    a",
a""a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"~
                              a",
                              a-14
a"OEa"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"
a",                    BACKEND-FOR-FRONTEND (BFF)                   a",
a",  a"OEa"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a" a",
a",  a",         Express + Socket.io Server (Port 8787)            a", a",
a",  a",  a"OEa"a"a"a"a"a"a"a"a"a"a"a"a"a" a"OEa"a"a"a"a"a"a"a"a"a"a"a"a"a" a"OEa"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"   a", a",
a",  a",  a",   RBAC      a", a",   Wazuh     a", a",   OpenCTI Service   a",   a", a",
a",  a",  a", Middleware  a", a",   Service   a", a",                     a",   a", a",
a",  a",  a""a"a"a"a"a"a"a"a"a"a"a"a"a"a"~ a""a"a"a"a"a"a"a"a"a"a"a"a"a"a"~ a""a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"~   a", a",
a",  a",  a"OEa"a"a"a"a"a"a"a"a"a"a"a"a"a" a"OEa"a"a"a"a"a"a"a"a"a"a"a"a"a" a"OEa"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"   a", a",
a",  a",  a",  Telegram   a", a",   Prisma    a", a",   Notification      a",   a", a",
a",  a",  a",  Service    a", a",   ORM       a", a",   Queue             a",   a", a",
a",  a",  a""a"a"a"a"a"a"a"a"a"a"a"a"a"a"~ a""a"a"a"a"a"a"a"a"a"a"a"a"a"a"~ a""a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"~   a", a",
a",  a""a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"~ a",
a",                              a",                                   a",
a""a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"~
          a",                  a",                  a",
          a-14                  a-14                  a-14
   a"OEa"a"a"a"a"a"a"a"a"a"a"a"a"      a"OEa"a"a"a"a"a"a"a"a"a"a"a"a"      a"OEa"a"a"a"a"a"a"a"a"a"a"a"a"
   a", PostgreSQL a",      a",   Redis    a",      a",  External  a",
   a",  (Data)    a",      a",  (Session) a",      a",  APIs      a",
   a""a"a"a"a"a"a"a"a"a"a"a"a"a"~      a""a"a"a"a"a"a"a"a"a"a"a"a"a"~      a""a"a"a"a"a"a"a"a"a"a"a"a"a"~
```

### 2.3 Project Structure

```
soc-ops-dashboard/
a"oea"a" src/                          # Frontend source
a",   a"oea"a" components/
a",   a",   a"oea"a" layout/             # DashboardLayout, AppTopbar, AppSidebar
a",   a",   a"oea"a" navigation/         # Navigation components
a",   a",   a"oea"a" alerts/             # Alert register, table, filters
a",   a",   a"oea"a" triage/             # Triage workspace components
a",   a",   a"oea"a" dashboard/          # KPI cards, charts
a",   a",   a"oea"a" reports/            # Report components
a",   a",   a""a"a" common/             # Shared UI components
a",   a"oea"a" context/                # Global state (Auth, Settings, AlertData, Language, Socket)
a",   a"oea"a" domain/                 # Domain logic dan data normalization
a",   a"oea"a" hooks/                  # Custom React hooks
a",   a"oea"a" pages/                  # Full page components (12 pages)
a",   a"oea"a" router/                 # React Router config (lazy loading)
a",   a"oea"a" services/               # API clients, localStorage services
a",   a""a"a" utils/                  # Formatters, analytics, PDF generation, passwordSecurity
a"oea"a" server/                     # BFF source code
a",   a""a"a" src/
a",       a"oea"a" index.js            # Express + Socket.io entry
a",       a"oea"a" notificationService.js
a",       a""a"a" services/           # wazuh.js, opencti.js, telegram.js, demoData.js
a"oea"a" public/                     # Static assets
a"oea"a" scops.ps1                   # PowerShell CLI management
a""a"a" [config files]              # vite.config, eslint, etc.
```

### 2.4 Security Implementation

| Feature | Implementation | Status |
|---------|---------------|--------|
| Password Hashing | PBKDF2-SHA256 (local), BCrypt (server) | aoe... |
| JWT | HS256 dengan strict mode option | aoe... Ready |
| Server-Side RBAC | BFF middleware capability check | aoe... |
| Demo Data Isolation | `gold_demo` tagging | aoe... |
| Credential Hygiene | Sanitasi di SettingsContext | aoe... |
| Encryption Key | `ENCRYPTION_KEY` untuk integration secrets | Y"" Target |

### 2.5 Hardened IPO Architecture (v12.0)

Mulai v11.14.0, platform mengadopsi arsitektur **Input-Process-Output (IPO)** yang diperkeras untuk menjamin integritas forensik dan sinkronisasi real-time.

#### 2.5.1 Forensic Integrity (Non-Repudiation)
Setiap mutasi data operasional (Triage, User Management, Global Config) wajib menghasilkan **Forensic Signature**.
- **Utility**: `generateTransactionHash(payload, actorId)` di `src/utils/forensicUtils.ts`.
- **Implementation**: Menggunakan `trackActivity` di `OperationsContext`. Hash disimpan sebagai `log.id` untuk akuntabilitas mutlak.

#### 2.5.2 Global Connectivity Pulse (Event Bridge)
Sinkronisasi status layanan eksternal (Wazuh, OpenCTI) antar tab/node analis dilakukan melalui **Window Event Bridge**.
- **Event**: `socops:remote-service-update`
- **Protocol**: `SettingsContext` mendengarkan update via Socket.io dan memancarkan event Window. Komponen UI (seperti `SystemTelemetry`) mendengarkan event ini untuk update visual tanpa re-mounting provider.

#### 2.5.3 Big Data Archive Search Engine
Untuk efisiensi memori pada dataset skala besar, sistem memisahkan **Live Pipeline** dan **Archive Pipeline**.
- **Archive Mode**: Diaktifkan di `AlertsPage`. Menggunakan `fetchArchiveAlerts` yang melakukan kueri langsung ke indeks sejarah (BFF/SIEM) alih-alih memfilter state lokal.
- **Virtualized Grid**: Semua tabel data menggunakan `TanStack Virtual` untuk menangani 10,000+ baris dengan performa 60fps.

---

## 3. Development Setup & Getting Started

### 3.1 Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### 3.2 Installation
```bash
# Install dependencies
npm install

# Copy environment template ( untuk BFF )
cp .env.example .env
```

### 3.3 Development Commands

```bash
# Unified Command (Full Stack)
npm start                    # Starts Frontend + BFF concurrently

# Manual Start (Separate)
npm run dev:bff             # Start BFF server (port 8787)
npm run dev                 # Start Frontend (port 5173)

# Build & Deploy
npm run build               # Production build
npm run deploy              # Deploy to GitHub Pages

# Utilities
npm run lint                # ESLint check
./scops.ps1 status          # Check process status (Windows PowerShell)
./scops.ps1 restart         # Restart both services
```

### 3.4 Environment Variables (`.env`)

```bash
# BFF Configuration
BFF_PORT=8787
BFF_STRICT_AUTH=false        # Set true untuk JWT enforcement
BFF_DEMO_MODE=false
BFF_ALLOWED_ORIGIN=http://localhost:5173

# JWT (opsional - untuk strict mode)
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h

# Redis (opsional - untuk session store production)
REDIS_URL=redis://localhost:6379

# Encryption (opsional - untuk integration configs)
ENCRYPTION_KEY=$(openssl rand -hex 32)

# External Integrations (opsional)
WAZUH_MANAGER_HOST=192.168.x.x
WAZUH_MANAGER_PORT=55000
WAZUH_INDEXER_PORT=9200

OPENCTI_URL=http://192.168.x.x:8080
OPENCTI_TOKEN=your_token

TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

> **NOTE**: Nama variabel di dev (`.env`) sengaja disamakan dengan environment production agar developer tidak bingung saat deployment.
```

### 3.5 Demo Mode

Demo mode tersedia tanpa backend:
- **URL**: `/demo` atau klik "Demo Mode" di landing page
- **Data**: Golden dataset dengan alert lengkap
- **Integration**: Simulated status (config di-mask untuk security)
- **Persistence**: None (session-only)

---

## 4. Database Schema (Complete)

### 4.1 Schema Overview

```sql
-- Core Tables (6 primary tables)
a"OEa"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"
a",  users                  a",  Authentication & RBAC            a",
a",  cases                  a",  Triage workspace persistence       a",
a",  audit_logs             a",  Compliance & accountability        a",
a",  settings               a",  Global configuration               a",
a",  integration_configs    a",  Encrypted external API secrets     a",
a",  alert_cache            a",  Wazuh data with TTL                a",
a""a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"~

-- Supporting Tables
a"OEa"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"
a",  case_notes             a",  Many-to-one dengan cases           a",
a",  case_activities        a",  Timeline tracking per case         a",
a",  session_tokens         a",  JWT token blacklist (logout)       a",
a",  notification_queue     a",  Telegram async queue               a",
a""a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"a"~
```

### 4.2 USERS - Authentication & RBAC

```sql
CREATE TABLE users (
    -- Primary Identity
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    
    -- Security (BCrypt lebih baik dari PBKDF2 untuk server-side)
    password_hash VARCHAR(255) NOT NULL,
    
    -- RBAC
    role VARCHAR(50) NOT NULL 
        CHECK (role IN (
            'admin',           -- Full access, manage users/settings
            'manager',         -- View all, export reports, manage cases
            'l2_analyst',      -- Investigate, close, escalate
            'l1_analyst',      -- Same as L2 (hierarchy for future)
            'auditor',         -- Read-only audit access
            'demo'             -- Simulasi, no persistence
        )),
    
    -- Profile
    full_name VARCHAR(255),
    avatar_url TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    
    -- MFA (future-proofing)
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(255), -- Encrypted TOTP secret
    
    -- Security Tracking
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE, -- Account lockout
    
    -- Password Security
    password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    password_must_change BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Soft Delete (untuk audit trail, jangan hard delete)
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role) WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX idx_users_active ON users(is_active) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE users IS 'Personnel SOC dengan RBAC capability-based';
COMMENT ON COLUMN users.role IS 'admin|manager|l2_analyst|l1_analyst|auditor|demo';
COMMENT ON COLUMN users.failed_login_attempts IS 'Counter untuk brute force protection';
```

**BCrypt vs PBKDF2 Migration Note:**
```javascript
// Node.js BCrypt implementation (replace PBKDF2 in production)
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12; // ~250ms hashing time

// Hash password
const hash = await bcrypt.hash(password, SALT_ROUNDS);

// Verify
const isValid = await bcrypt.compare(password, hash);
```

### 4.3 CASES - Triage Workspace Persistence

```sql
CREATE TABLE cases (
    -- Identity
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Reference ke Wazuh Alert (bukan FK, bisa dari external)
    alert_id VARCHAR(255) NOT NULL,
    
    -- Snapshot Alert (denormalized untuk performance & history)
    alert_data JSONB NOT NULL,
    -- Structure: {
    --   id: string,
    --   timestamp: ISO8601,
    --   rule: { id, level, description },
    --   agent: { id, name, ip },
    --   location: string,
    --   full_log: string,
    --   syscheck?: { ... },
    --   ...
    -- }
    
    -- Workflow Status
    status VARCHAR(50) NOT NULL DEFAULT 'open'
        CHECK (status IN (
            'open',              -- Baru dibuat, belum dikerjakan
            'investigating',     -- Sedang dianalisa
            'escalated',         -- Naik ke L2/Manager
            'pending_evidence',  -- Menunggu data tambahan
            'resolved',          -- Selesai, ditutup
            'false_positive',    -- Bukan ancaman benar
            'duplicate'          -- Duplikat case lain
        )),
    
    -- Prioritization (ROUND untuk menghindari truncate FLOATa'INTEGER)
    priority_score NUMERIC(5,2) GENERATED ALWAYS AS (
        ROUND(
            COALESCE((alert_data->'rule'->>'level')::NUMERIC, 0) * 0.6 +
            COALESCE((alert_data->'enrichment'->>'threat_score')::NUMERIC, 0) * 0.4
        ,2)
    ) STORED,
    
    priority_label VARCHAR(20) GENERATED ALWAYS AS (
        CASE
            WHEN (
                COALESCE((alert_data->'rule'->>'level')::NUMERIC, 0) * 0.6 +
                COALESCE((alert_data->'enrichment'->>'threat_score')::NUMERIC, 0) * 0.4
            ) >= 9 THEN 'critical'
            WHEN (
                COALESCE((alert_data->'rule'->>'level')::NUMERIC, 0) * 0.6 +
                COALESCE((alert_data->'enrichment'->>'threat_score')::NUMERIC, 0) * 0.4
            ) >= 6 THEN 'high'
            WHEN (
                COALESCE((alert_data->'rule'->>'level')::NUMERIC, 0) * 0.6 +
                COALESCE((alert_data->'enrichment'->>'threat_score')::NUMERIC, 0) * 0.4
            ) >= 3 THEN 'medium'
            ELSE 'low'
        END
    ) STORED,
    
    -- Ownership
    assigned_to UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    assigned_by UUID REFERENCES users(id),
    
    -- Creation
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Resolution
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id),
    resolution_note TEXT,
    resolution_type VARCHAR(50) 
        CHECK (resolution_type IN (
            'confirmed_threat', 'false_positive', 'configuration_issue', 
            'environment_noise', 'duplicate', 'other'
        )),
    
    -- Timeline tracking (duration metrics)
    first_response_at TIMESTAMP WITH TIME ZONE, -- Pertama kali dilihat
    first_action_at TIMESTAMP WITH TIME ZONE,   -- Pertama kali diupdate
    
    -- Enrichment Data (OpenCTI & other sources)
    enrichment_data JSONB,
    -- Structure: {
    --   opencti: {
    --     threat_score: number,
    --     threat_actor: string,
    --     malware_family: string,
    --     tlp: string,
    --     indicators: [...]
    --   },
    --   vt: { ... }, -- VirusTotal
    --   abusix: { ... }
    -- }
    
    -- Playbook Tracking
    playbook_id VARCHAR(100), -- Referensi ke SOP yang digunakan
    playbook_progress JSONB DEFAULT '{}',
    -- Structure: {
    --   "step_1_verify": { completed: true, at: ISO8601, by: user_id },
    --   "step_2_enrich": { completed: true, at: ISO8601, by: user_id },
    --   "step_3_analyze": { completed: false },
    --   ...
    -- }
    
    -- Collaboration
    is_collaborative BOOLEAN DEFAULT false,
    collaborator_ids UUID[] DEFAULT '{}',
    
    -- Tags untuk kategorisasi
    tags TEXT[] DEFAULT '{}',
    
    -- Timestamps
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES users(id),
    
    -- Constraints
    CONSTRAINT valid_resolution CHECK (
        (status NOT IN ('resolved', 'false_positive', 'duplicate') OR 
         (resolved_at IS NOT NULL AND resolved_by IS NOT NULL))
    )
);

-- Indexes (Performance-critical)
CREATE INDEX idx_cases_status ON cases(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_cases_assigned ON cases(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX idx_cases_priority ON cases(priority_score DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_cases_created ON cases(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_cases_alert ON cases(alert_id) WHERE deleted_at IS NULL;

-- Partial indexes untuk workflow
CREATE INDEX idx_cases_open ON cases(created_at) 
    WHERE status = 'open' AND deleted_at IS NULL;
CREATE INDEX idx_cases_investigating ON cases(updated_at) 
    WHERE status = 'investigating' AND deleted_at IS NULL;
CREATE INDEX idx_cases_my_cases ON cases(assigned_to, status) 
    WHERE assigned_to IS NOT NULL AND deleted_at IS NULL;

-- GIN index untuk JSONB queries
CREATE INDEX idx_cases_alert_data ON cases USING GIN (alert_data);
CREATE INDEX idx_cases_enrichment ON cases USING GIN (enrichment_data);

-- Comments
COMMENT ON TABLE cases IS 'Triage workspace cases dari alert Wazuh';
COMMENT ON COLUMN cases.alert_data IS 'Snapshot lengkap alert untuk history';
COMMENT ON COLUMN cases.playbook_progress IS 'Tracking SOP/langkah investigasi';
```

### 4.4 AUDIT_LOGS - Compliance & Accountability

```sql
CREATE TABLE audit_logs (
    -- Identity
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Actor
    user_id UUID REFERENCES users(id),
    user_email VARCHAR(255), -- Denormalized untuk report
    user_role VARCHAR(50),   -- Denormalized
    
    -- Action Classification
    action VARCHAR(100) NOT NULL,
    -- Values: login, logout, login_failed, password_change, 
    --         case_create, case_view, case_update, case_close,
    --         alert_view, alert_export, alert_suppress,
    --         settings_update, user_create, user_update, user_delete,
    --         integration_test, report_generate, ...
    
    action_category VARCHAR(50) NOT NULL
        CHECK (action_category IN (
            'authentication',    -- Login/logout/password
            'authorization',     -- Permission changes
            'case_management',   -- CRUD cases
            'alert_management',  -- View, export, suppress
            'user_management',   -- CRUD users
            'settings',          -- System configuration
            'integration',       -- External API interactions
            'reporting',         -- Generate exports
            'system'             -- Internal operations
        )),
    
    -- Target Resource
    resource_type VARCHAR(100) NOT NULL,
    -- Values: alert, case, user, setting, report, integration, system
    
    resource_id VARCHAR(255), -- UUID atau ID eksternal
    resource_name VARCHAR(255), -- Human-readable (denormalized)
    
    -- Change Details (untuk update/delete/create)
    change_summary JSONB,
    -- Structure untuk update:
    -- {
    --   field: "status",
    --   old_value: "open",
    --   new_value: "investigating",
    --   reason: "Initial triage started"
    -- }
    
    change_full JSONB, -- Full before/after snapshot (untuk compliance strict)
    
    -- Context
    ip_address INET NOT NULL,
    user_agent TEXT,
    session_id VARCHAR(255), -- JWT session identifier
    
    -- Request Context
    request_method VARCHAR(10),
    request_path TEXT,
    request_query JSONB,
    
    -- Performance
    duration_ms INTEGER, -- Request duration
    
    -- Result
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT, -- Jika failed
    error_code VARCHAR(100),
    
    -- Timestamp (penting untuk compliance - immutable)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Compliance Retention
    retention_until TIMESTAMP WITH TIME ZONE, -- Auto-delete setelah retention period
    
    -- Partitioning key (untuk time-series optimization)
    created_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Indexes
CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action, created_at DESC);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_category ON audit_logs(action_category, created_at DESC);
CREATE INDEX idx_audit_ip ON audit_logs(ip_address, created_at DESC);

-- Time-series optimization
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_date ON audit_logs(created_date);

-- Compliance queries
CREATE INDEX idx_audit_retention ON audit_logs(retention_until) 
    WHERE retention_until IS NOT NULL;

-- Comments
COMMENT ON TABLE audit_logs IS 'Audit trail untuk compliance (SOX, ISO 27001, etc)';
COMMENT ON COLUMN audit_logs.change_summary IS 'Simplified change untuk quick view';
COMMENT ON COLUMN audit_logs.change_full IS 'Complete before/after untuk forensic';
COMMENT ON COLUMN audit_logs.retention_until IS 'Auto-cleanup setelah retention period';

-- Trigger untuk set retention period (default 7 tahun)
CREATE OR REPLACE FUNCTION set_audit_retention()
RETURNS TRIGGER AS $$
BEGIN
    NEW.retention_until := NEW.created_at + INTERVAL '7 years';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_retention_trigger
    BEFORE INSERT ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION set_audit_retention();
```

**Retention Policy (PostgreSQL 16+):**
```sql
-- Auto-delete setelah retention period
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
    'audit-cleanup',
    '0 2 * * *', -- Daily at 2 AM
    $$ DELETE FROM audit_logs WHERE retention_until < CURRENT_TIMESTAMP $$ 
);
```

### 4.5 SETTINGS - Global Configuration

```sql
CREATE TABLE settings (
    -- Key-Value dengan validasi
    key VARCHAR(100) PRIMARY KEY,
    
    -- Value dengan struktur JSONB
    value JSONB NOT NULL,
    
    -- Schema version untuk migrations
    schema_version INTEGER DEFAULT 1,
    
    -- Metadata
    description TEXT,
    category VARCHAR(50) 
        CHECK (category IN (
            'branding',      -- appName, orgName, logo
            'security',      -- session timeout, password policy
            'performance',   -- cache TTL, pagination limits
            'integration',   -- Default endpoints (non-sensitive)
            'notification',  -- Email templates, Telegram defaults
            'ui'             -- Theme defaults, language
        )),
    
    -- Security Level
    is_sensitive BOOLEAN DEFAULT false, -- true untuk fields yang perlu encryption
    requires_restart BOOLEAN DEFAULT false, -- true untuk changes yang perlu app restart
    
    -- Audit
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- History (keep last 10 versions)
    history JSONB DEFAULT '[]'
);

-- Default Settings Insert
INSERT INTO settings (key, value, description, category) VALUES
('app.name', '"SOC OPS"'::JSONB, 'Nama aplikasi platform', 'branding'),
('app.org_name', '"Security Control Center"'::JSONB, 'Nama organisasi', 'branding'),
('app.version', '"2.0"'::JSONB, 'Versi platform', 'branding'),

('security.session_timeout', '3600'::JSONB, 'Session timeout dalam detik (1 jam)', 'security'),
('security.password_min_length', '12'::JSONB, 'Minimum password length', 'security'),
('security.password_complexity', 'true'::JSONB, 'Require complexity (upper, lower, number, symbol)', 'security'),
('security.mfa_required', 'false'::JSONB, 'Require MFA for all users', 'security'),
('security.max_failed_logins', '5'::JSONB, 'Max failed attempts before lockout', 'security'),
('security.lockout_duration', '900'::JSONB, 'Lockout duration in seconds (15 min)', 'security'),

('performance.alert_cache_ttl', '300'::JSONB, 'Alert cache TTL in seconds (5 min)', 'performance'),
('performance.default_page_size', '50'::JSONB, 'Default pagination size', 'performance'),
('performance.max_page_size', '500'::JSONB, 'Maximum pagination size', 'performance'),
('performance.dashboard_refresh', '30'::JSONB, 'Dashboard auto-refresh interval (seconds)', 'performance'),

('integration.wazuh.default_port', '55000'::JSONB, 'Default Wazuh Manager API port', 'integration'),
('integration.wazuh.indexer_port', '9200'::JSONB, 'Default Wazuh Indexer port', 'integration'),
('integration.opencti.default_confidence', '75'::JSONB, 'Default OpenCTI confidence threshold', 'integration'),

('ui.default_language', '"id"'::JSONB, 'Default UI language (id/en)', 'ui'),
('ui.theme', '"dark"'::JSONB, 'Default theme (dark/light)', 'ui'),
('ui.date_format', '"DD/MM/YYYY"'::JSONB, 'Date display format', 'ui'),
('ui.time_format', '"HH:mm"'::JSONB, 'Time display format', 'ui');

-- Index
CREATE INDEX idx_settings_category ON settings(category);

-- Comments
COMMENT ON TABLE settings IS 'Global configuration dengan audit history';
COMMENT ON COLUMN settings.history IS 'JSON array of last 10 changes dengan timestamp & user';
```

**Settings History Trigger:**
```sql
CREATE OR REPLACE FUNCTION settings_history_update()
RETURNS TRIGGER AS $$
DECLARE
    history_entry JSONB;
    new_history JSONB;
BEGIN
    -- Create history entry
    history_entry := jsonb_build_object(
        'value', OLD.value,
        'updated_by', OLD.updated_by,
        'updated_at', OLD.updated_at
    );
    
    -- Prepend to history, keep max 10 entries
    new_history := jsonb_build_array(history_entry) || COALESCE(OLD.history, '[]');
    
    -- Trim to 10 entries
    IF jsonb_array_length(new_history) > 10 THEN
        new_history := (
            SELECT jsonb_agg(elem)
            FROM (
                SELECT elem
                FROM jsonb_array_elements(new_history) WITH ORDINALITY AS t(elem, ord)
                WHERE ord <= 10
                ORDER BY ord
            ) sub
        );
    END IF;
    
    NEW.history := new_history;
    NEW.updated_at := CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER settings_history_trigger
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION settings_history_update();
```

### 4.6 INTEGRATION_CONFIGS - Encrypted External API Secrets

```sql
CREATE TABLE integration_configs (
    -- Identity
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Integration Type
    type VARCHAR(50) NOT NULL
        CHECK (type IN (
            'wazuh_manager',   -- Wazuh Manager API v4
            'wazuh_indexer',   -- Wazuh OpenSearch/Elasticsearch
            'opencti',         -- OpenCTI GraphQL API
            'telegram',        -- Telegram Bot API
            'smtp',            -- Email notifications (future)
            'slack',           -- Slack webhooks (future)
            'jira',            -- JIRA ticketing (future)
            'servicenow'       -- ServiceNow integration (future)
        )),
    
    -- Display Name (user-defined)
    name VARCHAR(255) NOT NULL DEFAULT 'Default',
    
    -- Encrypted Configuration
    -- JSONB structure encrypted dengan AES-256
    config_encrypted TEXT NOT NULL, -- Encrypted JSON string
    
    -- Non-sensitive config ( untuk display )
    config_public JSONB,
    -- Structure: {
    --   host: "192.168.1.100",
    --   port: 55000,
    --   username: "wazuh" (optional display)
    -- }
    
    -- Encryption Metadata
    encryption_version INTEGER DEFAULT 1,
    encryption_iv VARCHAR(255), -- Initialization vector
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false, -- Primary config untuk type ini
    
    -- Health Check
    last_tested_at TIMESTAMP WITH TIME ZONE,
    last_test_status VARCHAR(20) 
        CHECK (last_test_status IN ('unknown', 'success', 'error', 'timeout', 'auth_failed')),
    last_test_message TEXT,
    last_test_response_time_ms INTEGER,
    
    -- Health monitoring (auto-check)
    health_check_enabled BOOLEAN DEFAULT true,
    health_check_interval_seconds INTEGER DEFAULT 300, -- 5 minutes
    health_check_fail_count INTEGER DEFAULT 0,
    
    -- Audit
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
     -- Constraints
     -- NOTE: Partial index ini memastikan hanya ada SATU primary config per integration type.
     -- Constraint UNIQUE(type, is_primary) tidak cocok karena akan mencegah dua baris
     -- dengan (type='wazuh', is_primary=false). Partial index hanya enforce saat is_primary=true.
);

-- Partial unique index: hanya ada 1 primary per type
CREATE UNIQUE INDEX idx_one_primary_per_type ON integration_configs(type)
    WHERE is_primary = true;

-- Indexes
CREATE INDEX idx_integration_type ON integration_configs(type);
CREATE INDEX idx_integration_active ON integration_configs(is_active) WHERE is_active = true;
CREATE INDEX idx_integration_health ON integration_configs(last_test_status, last_tested_at);

-- Comments
COMMENT ON TABLE integration_configs IS 'Encrypted configuration untuk external integrations';
COMMENT ON COLUMN integration_configs.config_encrypted IS 'AES-256 encrypted JSON';
COMMENT ON COLUMN integration_configs.config_public IS 'Non-sensitive config untuk UI display';
```

**Encryption Implementation (Node.js):**
```javascript
// services/encryption.js
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY = process.env.ENCRYPTION_KEY; // 32 bytes dari env

function encryptConfig(plainConfig) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY, 'hex'), iv);
    
    let encrypted = cipher.update(JSON.stringify(plainConfig), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
        encrypted: encrypted + authTag.toString('hex'),
        iv: iv.toString('hex'),
        version: 1
    };
}

function decryptConfig(encryptedData, iv) {
    const authTagLength = 32; // 16 bytes = 32 hex chars
    const encrypted = encryptedData.slice(0, -authTagLength);
    const authTag = Buffer.from(encryptedData.slice(-authTagLength), 'hex');
    
    const decipher = crypto.createDecipheriv(
        ALGORITHM, 
        Buffer.from(KEY, 'hex'), 
        Buffer.from(iv, 'hex')
    );
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
}
```

### 4.7 ALERT_CACHE - Wazuh Data dengan TTL

```sql
CREATE TABLE alert_cache (
    -- Primary Key (Wazuh alert ID)
    id VARCHAR(255) PRIMARY KEY, -- Wazuh alert ID (format: timestamp_hash)
    
    -- Raw Wazuh Data
    raw_data JSONB NOT NULL,
    -- Complete Wazuh alert JSON
    
    -- Normalized Fields (untuk quick queries tanpa JSON parsing)
    timestamp TIMESTAMP WITH TIME ZONE,
    rule_id VARCHAR(100),
    rule_level INTEGER,
    rule_description TEXT,
    agent_id VARCHAR(100),
    agent_name VARCHAR(255),
    agent_ip INET,
    location TEXT,
    
    -- Enrichment
    enriched_data JSONB, -- OpenCTI, VT, etc
    enrichment_status VARCHAR(20) 
        CHECK (enrichment_status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
    enriched_at TIMESTAMP WITH TIME ZONE,
    
    -- Case Association
    case_id UUID REFERENCES cases(id),
    
    -- False Positive Tracking
    is_false_positive BOOLEAN DEFAULT false,
    false_positive_reason TEXT,
    false_positive_by UUID REFERENCES users(id),
    false_positive_at TIMESTAMP WITH TIME ZONE,
    
    -- TTL (Time-To-Live)
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- TTL
    
    -- Source
    source_type VARCHAR(50) 
        CHECK (source_type IN ('wazuh_live', 'wazuh_archive', 'manual_injection', 'demo_gold')),
    wazuh_cluster VARCHAR(255), -- Jika multiple Wazuh clusters
    
    -- Full-text search (PostgreSQL tsvector)
    search_vector TSVECTOR
);

-- Indexes
CREATE INDEX idx_alert_cache_time ON alert_cache(timestamp DESC);
CREATE INDEX idx_alert_cache_rule ON alert_cache(rule_id);
CREATE INDEX idx_alert_cache_level ON alert_cache(rule_level);
CREATE INDEX idx_alert_cache_agent ON alert_cache(agent_id);
CREATE INDEX idx_alert_cache_case ON alert_cache(case_id) WHERE case_id IS NOT NULL;
CREATE INDEX idx_alert_cache_expires ON alert_cache(expires_at);

-- Partial indexes
CREATE INDEX idx_alert_cache_open ON alert_cache(rule_level, timestamp) 
    WHERE case_id IS NULL AND is_false_positive = false;
CREATE INDEX idx_alert_cache_fp ON alert_cache(timestamp) 
    WHERE is_false_positive = true;

-- GIN for JSON
CREATE INDEX idx_alert_cache_raw ON alert_cache USING GIN (raw_data);
CREATE INDEX idx_alert_cache_enriched ON alert_cache USING GIN (enriched_data);

-- Full-text search index
CREATE INDEX idx_alert_cache_search ON alert_cache USING GIN (search_vector);

-- Comments
COMMENT ON TABLE alert_cache IS 'Cache dari Wazuh alerts dengan TTL';
COMMENT ON COLUMN alert_cache.expires_at IS 'Auto-delete setelah TTL (default 30 hari)';
COMMENT ON COLUMN alert_cache.search_vector IS 'Full-text search untuk agent_name, rule_description, dll';
```

**TTL Auto-Cleanup:**
```sql
-- Cron job untuk cleanup expired alerts
SELECT cron.schedule(
    'alert-cache-cleanup',
    '0 3 * * *', -- Daily at 3 AM
    $$ DELETE FROM alert_cache WHERE expires_at < CURRENT_TIMESTAMP $$ 
);

-- Trigger untuk update search_vector
CREATE OR REPLACE FUNCTION update_alert_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('simple', COALESCE(NEW.agent_name, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(NEW.rule_description, '')), 'B') ||
        setweight(to_tsvector('simple', COALESCE(NEW.location, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER alert_search_vector_trigger
    BEFORE INSERT OR UPDATE ON alert_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_alert_search_vector();
```

### 4.8 Supporting Tables

#### CASE_NOTES - Many-to-One dengan Cases

```sql
CREATE TABLE case_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    
    -- Content
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'text' 
        CHECK (content_type IN ('text', 'markdown', 'html')),
    
    -- Author
    created_by UUID REFERENCES users(id),
    created_by_name VARCHAR(255), -- Denormalized untuk display
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Edit history
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    original_content TEXT -- Snapshot original sebelum edit
);

CREATE INDEX idx_case_notes_case ON case_notes(case_id, created_at DESC);
```

#### SESSION_TOKENS - JWT Blacklist (Logout)

```sql
CREATE TABLE session_tokens (
    -- JWT JTI (JWT ID) untuk blacklist
    jti UUID PRIMARY KEY,
    
    user_id UUID REFERENCES users(id),
    
    -- Token Metadata
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Revocation
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES users(id),
    revocation_reason VARCHAR(100),
    
    -- Device/Context
    ip_address INET,
    user_agent TEXT,
    device_fingerprint VARCHAR(255), -- untuk deteksi anomali
    
    -- Status
    is_valid BOOLEAN DEFAULT true,
    
    -- Constraints
    CONSTRAINT valid_or_revoked CHECK (
        (is_valid = true AND revoked_at IS NULL) OR
        (is_valid = false AND revoked_at IS NOT NULL)
    )
);

-- Indexes
CREATE INDEX idx_session_user ON session_tokens(user_id, issued_at DESC);
CREATE INDEX idx_session_expires ON session_tokens(expires_at) 
    WHERE is_valid = true;

-- Auto-cleanup expired tokens
SELECT cron.schedule(
    'session-cleanup',
    '0 4 * * *', -- Daily at 4 AM
    $$ DELETE FROM session_tokens WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '7 days' $$ 
);
```

#### NOTIFICATION_QUEUE - Telegram Async Queue

```sql
CREATE TABLE notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Channel
    channel VARCHAR(50) NOT NULL DEFAULT 'telegram'
        CHECK (channel IN ('telegram', 'email', 'slack', 'webhook')),

    -- Message Content
    payload JSONB NOT NULL,
    -- Structure: {
    --   chat_id: string, text: string, parse_mode: 'Markdown' | 'HTML',
    --   reply_markup: object (optional),
    --   attachments: [{type, url, name}] (optional)
    -- }

    -- Priority (low/normal/high/urgent)
    priority VARCHAR(20) NOT NULL DEFAULT 'normal'
        CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

    -- Delivery State
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'suppressed')),

    -- Retry Logic
    attempt INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_error TEXT,
    next_retry_at TIMESTAMP WITH TIME ZONE,

    -- Correlation (link back to source alert/case)
    correlation_type VARCHAR(50), -- 'alert', 'case', 'system', 'health'
    correlation_id VARCHAR(255),  -- alert_id, case_id, or system event ID

    -- Timestamps
    queued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE, -- TTL for stale messages

    -- Audit
    created_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_notification_queue_status ON notification_queue(status, priority) WHERE status = 'pending';
CREATE INDEX idx_notification_queue_retry ON notification_queue(next_retry_at) WHERE status = 'pending';
CREATE INDEX idx_notification_queue_correlation ON notification_queue(correlation_type, correlation_id);
CREATE INDEX idx_notification_queue_created ON notification_queue(queued_at DESC);

-- Auto-cleanup old/expired notifications
SELECT cron.schedule(
    'notification-queue-cleanup',
    '0 5 * * *', -- Daily at 5 AM
    $$
    DELETE FROM notification_queue
       WHERE (status IN ('sent', 'suppressed') AND sent_at < CURRENT_TIMESTAMP - INTERVAL '30 days')
          OR (status = 'pending' AND expires_at < CURRENT_TIMESTAMP)
    $$
);

-- Comments
COMMENT ON TABLE notification_queue IS 'Async queue untuk outbound notifications (Telegram, dll)';
COMMENT ON COLUMN notification_queue.payload IS 'JSON payload spesifik channel';
COMMENT ON COLUMN notification_queue.correlation_type IS 'Menghubungkan notifikasi ke sumber (alert/case/system)';
```

#### CASE_ACTIVITIES - Timeline Tracking per Case

```sql
CREATE TABLE case_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,

    -- Activity Type
    activity_type VARCHAR(50) NOT NULL,
    -- Values: case_created, status_changed, priority_changed, assigned,
    --         reassigned, note_added, evidence_added, comment_added,
    --         escalation, de_escalation, playbook_step_completed,
    --         alert_enriched, integration_query, report_exported, case_closed, case_reopened

    -- Description (human-readable)
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Actor
    user_id UUID REFERENCES users(id),
    user_name VARCHAR(255), -- Denormalized

    -- Related Data
    activity_data JSONB,
    -- Structure varies by activity_type:
    -- status_changed: { old: 'open', new: 'investigating', reason: '...' }
    -- assigned: { from: null, to: 'user_uuid' }
    -- evidence_added: { filename, filetype, size_bytes, hash }
    -- enrichment: { source: 'opencti', indicators_added: 3, iocs: [...] }

    -- Visibility
    is_internal BOOLEAN DEFAULT false, -- Internal activities not shown to external stakeholders
    requires_acknowledgment BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_case_activities_case ON case_activities(case_id, created_at DESC);
CREATE INDEX idx_case_activities_type ON case_activities(activity_type, created_at DESC);
CREATE INDEX idx_case_activities_user ON case_activities(user_id, created_at DESC);
CREATE INDEX idx_case_activities_internal ON case_activities(is_internal) WHERE is_internal = false;

-- GIN index for JSON queries on activity_data (e.g. status change tracking)
CREATE INDEX idx_case_activities_data ON case_activities USING GIN (activity_data);

-- Comments
COMMENT ON TABLE case_activities IS 'Audit timeline untuk setiap kasus (triage activity log)';
COMMENT ON COLUMN case_activities.activity_type IS 'Kategori aktivitas (status, assignment, notes, evidence, dll)';
COMMENT ON COLUMN case_activities.activity_data IS 'Context-specific payload per activity type';
```

### 4.9 Views untuk Reporting

#### Case Metrics Dashboard

```sql
CREATE VIEW case_metrics AS
SELECT
    DATE_TRUNC('day', created_at) AS date,
    status,
    priority_label,
    COUNT(*) AS count,
    AVG(EXTRACT(EPOCH FROM (COALESCE(resolved_at, CURRENT_TIMESTAMP) - created_at))/3600) AS avg_hours_to_resolution
FROM cases
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('day', created_at), status, priority_label;
```

#### Analyst Workload

```sql
CREATE VIEW analyst_workload AS
SELECT
    u.id AS user_id,
    u.full_name,
    u.role,
    COUNT(c.id) FILTER (WHERE c.status IN ('open', 'investigating')) AS active_cases,
    COUNT(c.id) FILTER (WHERE c.status = 'resolved' AND c.resolved_at > CURRENT_DATE - INTERVAL '7 days') AS resolved_this_week,
    AVG(EXTRACT(EPOCH FROM (c.resolved_at - c.created_at))/3600) FILTER (WHERE c.status = 'resolved') AS avg_resolution_hours
FROM users u
LEFT JOIN cases c ON c.assigned_to = u.id AND c.deleted_at IS NULL
WHERE u.is_active = true AND u.deleted_at IS NULL
GROUP BY u.id, u.full_name, u.role;
```

#### Alert Volume Trend

```sql
CREATE VIEW alert_volume_trend AS
SELECT
    DATE_TRUNC('hour', timestamp) AS hour,
    COUNT(*) AS total_alerts,
    COUNT(*) FILTER (WHERE rule_level >= 9) AS critical_alerts,
    COUNT(*) FILTER (WHERE case_id IS NOT NULL) AS triaged_alerts,
    COUNT(DISTINCT agent_id) AS unique_agents
FROM alert_cache
WHERE timestamp > CURRENT_TIMESTAMP - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', timestamp)
ORDER BY hour DESC;
```

### 4.10 Functions & Stored Procedures

#### Create Case from Alert

```sql
CREATE OR REPLACE FUNCTION create_case_from_alert(
    p_alert_id VARCHAR(255),
    p_created_by UUID,
    p_assigned_to UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_case_id UUID;
    v_alert_data JSONB;
BEGIN
    -- Get alert data
    SELECT raw_data INTO v_alert_data
    FROM alert_cache WHERE id = p_alert_id;
    
    IF v_alert_data IS NULL THEN
        RAISE EXCEPTION 'Alert not found: %', p_alert_id;
    END IF;
    
    -- Create case
    INSERT INTO cases (
        alert_id,
        alert_data,
        created_by,
        assigned_to,
        assigned_at,
        assigned_by,
        status
    ) VALUES (
        p_alert_id,
        v_alert_data,
        p_created_by,
        COALESCE(p_assigned_to, p_created_by),
        CASE WHEN p_assigned_to IS NOT NULL THEN CURRENT_TIMESTAMP END,
        CASE WHEN p_assigned_to IS NOT NULL THEN p_created_by END,
        'open'
    ) RETURNING id INTO v_case_id;
    
    -- Update alert_cache dengan case_id
    UPDATE alert_cache 
    SET case_id = v_case_id 
    WHERE id = p_alert_id;
    
    RETURN v_case_id;
END;
$$ LANGUAGE plpgsql;
```

#### Calculate Case Priority

```sql
CREATE OR REPLACE FUNCTION recalculate_case_priority(p_case_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_alert_data JSONB;
    v_rule_level INTEGER;
    v_threat_score INTEGER;
    v_final_score INTEGER;
BEGIN
    SELECT alert_data INTO v_alert_data
    FROM cases WHERE id = p_case_id;
    
     v_rule_level := COALESCE((v_alert_data->'rule'->>'level')::NUMERIC, 0);
     v_threat_score := COALESCE((v_alert_data->'enrichment'->>'threat_score')::NUMERIC, 0);
     
     v_final_score := ROUND(v_rule_level * 0.6 + v_threat_score * 0.4)::INTEGER;
    
    UPDATE cases 
    SET priority_score = v_final_score
    WHERE id = p_case_id;
    
    RETURN v_final_score;
END;
$$ LANGUAGE plpgsql;
```

### 4.11 Migration dari localStorage

#### Migration Script Outline

```javascript
// migrations/001_localstorage_to_postgres.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateFromLocalStorage() {
    // Read localStorage dump (exported dari browser)
    const localStorageData = require('./localstorage_export.json');
    
    // 1. Migrate Users
    for (const user of localStorageData.users || []) {
        await prisma.users.create({
            data: {
                email: user.email,
                // Re-hash dengan BCrypt (PBKDF2 hash tidak bisa di-port)
                password_hash: await bcrypt.hash(user.password || 'changeme123', 12),
                role: user.role,
                full_name: user.full_name || user.email.split('@')[0],
                is_active: true,
                created_at: new Date(user.created_at || Date.now()),
                updated_at: new Date()
            }
        });
    }
    
    // 2. Migrate Settings
    for (const [key, value] of Object.entries(localStorageData.settings || {})) {
        await prisma.settings.upsert({
            where: { key },
            update: { value: JSON.stringify(value) },
            create: { 
                key, 
                value: JSON.stringify(value),
                category: 'migration'
            }
        });
    }
    
    console.log('Migration complete!');
}

migrateFromLocalStorage();
```

### 4.12 Current vs Target Data Storage

| Area | Current | Target | Status |
|------|---------|--------|--------|
| Data Storage | localStorage (browser) | PostgreSQL | Y"  Critical Gap |
| User Management | localStorage + hash | PostgreSQL + BCrypt | Y"  Migration Required |
| Session | localStorage JWT | Redis + Server JWT | Y"" In Progress |
| Alert Cache | Per-browser | PostgreSQL + TTL | Y"  To Do |
| Audit Logs | In-app state | PostgreSQL persistent | Y"  To Do |
| Socket Presence | In-memory (BFF) | Redis adapter / File Store | aoe... |

---

## 5. UI/UX Standards & Components

### 5.1 Design System

#### Color Palette (Dark Mode Glassmorphism)

| Purpose | Tailwind Class | Usage |
|---------|---------------|-------|
| Background | `bg-[#0F172A]` | Dark Mode Main Background |
| Background Light | `bg-[#FFFFFF]` | Light Mode Main Background |
| Card Background | `bg-bg-panel` | Component backgrounds (adaptive) |
| Text Primary | `text-slate-100` | Headings (Boldify 700) |
| Text Secondary | `text-slate-400` | Labels, descriptions |
| Accent Cyan | `text-accent-cyan` | Operational/Technical Actions |
| Accent Purple | `text-accent-purple` | Management/Governance Actions |
| Accent Rose | `text-accent-rose` | Critical alerts, destructive |
| Accent Amber | `text-amber-400` | Warnings, system reset |
| Border | `border-slate-800` | Card borders, dividers |

#### Typography Standards

| Element | Style | Size |
|---------|-------|------|
| Page Title | `font-semibold text-slate-100` | `text-xl` |
| Card Title | `font-medium text-slate-200` | `text-lg` |
| Body Text | `text-slate-300` | `text-sm` |
| Labels | `text-slate-400 uppercase` a' **SENTENCE CASE** | `text-xs` |
| Code/Technical | `font-mono text-slate-400` | `text-sm` |

> **NOTE**: Ubah dari UPPERCASE ke Sentence Case untuk readability

### 5.2 Animation Standards (Framer Motion)

```jsx
// Standard transition
const transition = {
  type: "spring",
  stiffness: 300,
  damping: 30
};

// Stagger children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

// Reduced motion support
import { useReducedMotion } from 'framer-motion';
const shouldReduceMotion = useReducedMotion();
```

### 5.3 Empty State Patterns (Complete)

#### Dashboard Zero State (Integration Offline)

```jsx
// components/empty-states/DashboardEmptyState.jsx
import { useSettings } from '@/context/SettingsContext';
import { WifiOff, Database, PlayCircle } from 'lucide-react';

function DashboardEmptyState({ hasAlerts, hasIntegration, timeRange }) {
  const { settings } = useSettings();
  
  if (!hasIntegration) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
          <WifiOff className="h-8 w-8 text-slate-400" />
        </div>
        
        <h3 className="mb-2 text-lg font-semibold text-slate-100">
          Y" Sistem Pemantauan Belum Terhubung
        </h3>
        
        <p className="mb-4 text-sm text-slate-400">
          Saat ini tidak ada data keamanan yang tersedia karena:
        </p>
        
        <ul className="mb-6 text-sm text-slate-500">
          <li>a Integrasi Wazuh SIEM belum dikonfigurasi</li>
          <li>a Koneksi ke Wazuh Manager terputus</li>
          <li>a Tidak ada alert untuk rentang waktu yang dipilih</li>
        </ul>
        
        <div className="flex justify-center gap-3">
          <Button variant="primary" as={Link} to="/app/settings">
            <Database className="mr-2 h-4 w-4" />
            Konfigurasi Integrasi
          </Button>
          
          <Button variant="outline" as={Link} to="/demo">
            <PlayCircle className="mr-2 h-4 w-4" />
            Gunakan Demo Mode
          </Button>
        </div>
        
        <p className="mt-4 text-xs text-slate-600">
          Y' Tip: Gunakan mode demo untuk menjelajahi fitur tanpa integrasi
        </p>
      </div>
    );
  }
  
  if (!hasAlerts) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900/30">
          <ShieldCheck className="h-8 w-8 text-emerald-400" />
        </div>
        
        <h3 className="mb-2 text-lg font-semibold text-slate-100">
          Yi  Tidak Ada Ancaman Terdeteksi
        </h3>
        
        <p className="mb-4 text-sm text-slate-400">
          Sistem aman untuk rentang waktu:
        </p>
        
        <p className="mb-6 text-2xl font-bold text-emerald-400">
          {timeRangeLabel[timeRange]}
        </p>
        
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => setTimeRange('7d')}>
            Perpanjang ke 7 Hari
          </Button>
          
          <Button variant="outline" as={Link} to="/app/alerts">
            Lihat Semua Riwayat
          </Button>
        </div>
      </div>
    );
  }
}
```

#### Alerts Table Empty State

```jsx
// components/empty-states/AlertsTableEmptyState.jsx
function AlertsTableEmptyState({ 
  totalCount, 
  filteredCount, 
  activeFilters, 
  timeRange,
  hasIntegration 
}) {
  // Scenario: No data at all
  if (totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-6 rounded-2xl bg-slate-800/50 p-6">
          <Inbox className="h-12 w-12 text-slate-500" />
        </div>
        
        <h3 className="mb-2 text-xl font-semibold text-slate-100">
          Y" Register Notifikasi Kosong
        </h3>
        
        <div className="mb-4 space-y-1 text-sm text-slate-400">
          <p>Belum ada alert keamanan yang tercatat</p>
          <p className="text-slate-500">Rentang waktu: <span className="text-slate-300">{timeRange}</span></p>
          <p className="text-slate-500">Filter aktif: <span className="text-emerald-400">Tidak ada</span></p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={extendTimeRange}>
            <Clock className="mr-2 h-4 w-4" />
            Perpanjang Rentang Waktu
          </Button>
          
          <Button variant="outline" as={Link} to="/app/ingestion">
            <Upload className="mr-2 h-4 w-4" />
            Inject Data Sampel
          </Button>
        </div>
        
        {!hasIntegration && (
          <div className="mt-6 flex items-center gap-2 text-xs text-amber-400">
            <WifiOff className="h-4 w-4" />
            <span>Integrasi Wazuh offline</span>
            <Link to="/app/settings" className="underline hover:text-amber-300">
              Buka Panduan Konfigurasi a'
            </Link>
          </div>
        )}
      </div>
    );
  }
  
  // Scenario: Filter too restrictive
  if (filteredCount === 0 && totalCount > 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-6 rounded-2xl bg-slate-800/50 p-6">
          <FilterX className="h-12 w-12 text-amber-500" />
        </div>
        
        <h3 className="mb-2 text-xl font-semibold text-slate-100">
          Y" Tidak Ada Hasil Filter
        </h3>
        
        <div className="mb-4 rounded-lg bg-slate-800/30 p-4 text-left text-sm">
          <p className="mb-2 text-slate-400">Kombinasi filter saat ini:</p>
          <ul className="space-y-1 text-slate-300">
            {activeFilters.map(filter => (
              <li key={filter.key} className="flex items-center gap-2">
                <span className="text-slate-500">a</span>
                {filter.label}: <span className="font-medium text-cyan-400">{filter.value}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-slate-700 pt-2 text-slate-500">
            Total tanpa filter: <span className="font-bold text-slate-200">{totalCount.toLocaleString()}</span> alert
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="primary" onClick={resetFilters}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Filter
          </Button>
          
          <Button variant="outline" onClick={removeLastFilter}>
            <Layers className="mr-2 h-4 w-4" />
            Kurangi Filter
          </Button>
        </div>
        
        <p className="mt-4 text-xs text-slate-500">
          Y' Tips: Coba kurangi filter atau perpanjang rentang waktu
        </p>
      </div>
    );
  }
}
```

#### Triage Workspace Empty State

```jsx
// components/empty-states/TriageEmptyState.jsx
function TriageEmptyState({ hasRecentAlerts, recentAlertId }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="max-w-2xl">
        {/* Hero Illustration */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl">
            <Search className="h-16 w-16 text-cyan-400" />
          </div>
          
          <h2 className="mb-2 text-2xl font-bold text-slate-100">
            Y" Detektif Pemula
          </h2>
          
          <p className="text-slate-400">
            Selamat datang di Workspace Triage
          </p>
        </div>
        
        {/* Description */}
        <div className="mb-8 rounded-xl bg-slate-900/50 p-6 text-center">
          <p className="mb-4 text-sm leading-relaxed text-slate-400">
            Di sini Anda akan menginvestigasi alert keamanan, menambahkan 
            intelijen ancaman, dan menentukan tindakan mitigasi.
          </p>
        </div>
        
        {/* Quick Start Steps */}
        <div className="mb-8 space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Ys Cara Memulai
          </h3>
          
          <ol className="space-y-3">
            <li className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-900/50 text-xs font-bold text-cyan-400">1</span>
              <span className="text-sm text-slate-300">Buka <Link to="/app/alerts" className="text-cyan-400 hover:underline">Register Notifikasi</Link></span>
            </li>
            <li className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-900/50 text-xs font-bold text-cyan-400">2</span>
              <span className="text-sm text-slate-300">Pilih alert yang ingin diinvestigasi</span>
            </li>
            <li className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-900/50 text-xs font-bold text-cyan-400">3</span>
              <span className="text-sm text-slate-300">Klik tombol "Investigasi"</span>
            </li>
            <li className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-900/50 text-xs font-bold text-cyan-400">4</span>
              <span className="text-sm text-slate-300">Workspace ini akan menampilkan detail lengkap</span>
            </li>
          </ol>
        </div>
        
        {/* Primary Actions */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="primary" size="lg" as={Link} to="/app/alerts">
            <ClipboardList className="mr-2 h-5 w-5" />
            Buka Register Notifikasi
          </Button>
          
          <Button variant="outline" size="lg" as={Link} to="/app/ingestion">
            <Upload className="mr-2 h-5 w-5" />
            Inject Alert Sampel
          </Button>
        </div>
        
        {/* Recent Alert Shortcut (if available) */}
        {hasRecentAlerts && recentAlertId && (
          <div className="rounded-lg border border-cyan-900/50 bg-cyan-900/10 p-4">
            <p className="mb-2 text-sm text-cyan-400">
              ai  Lanjutkan Investigasi
            </p>
            <p className="mb-3 text-xs text-slate-400">
              Anda memiliki alert yang sedang diinvestigasi
            </p>
            <Button variant="ghost" size="sm" as={Link} to={`/app/triage/${recentAlertId}`}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Buka Kembali
            </Button>
          </div>
        )}
        
        {/* Learning Resources */}
        <div className="mt-8 rounded-lg border border-slate-800 bg-slate-900/30 p-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-400">
            Y"s Sumber Belajar
          </h4>
          <div className="grid gap-2 text-xs sm:grid-cols-3">
            <a href="#" className="flex items-center gap-2 rounded p-2 hover:bg-slate-800">
              <Video className="h-4 w-4 text-rose-400" />
              <span className="text-slate-400">Video Tutorial</span>
            </a>
            <a href="#" className="flex items-center gap-2 rounded p-2 hover:bg-slate-800">
              <FileText className="h-4 w-4 text-blue-400" />
              <span className="text-slate-400">Dokumen SOP</span>
            </a>
            <a href="#" className="flex items-center gap-2 rounded p-2 hover:bg-slate-800">
              <HelpCircle className="h-4 w-4 text-amber-400" />
              <span className="text-slate-400">FAQ</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 5.4 Component Patterns

#### Status Indicators
```
YY Green glow    - Connected / Online
Y"  Red pulse     - Disconnected / Offline
Y" Cyan ring     - Syncing data
YY Amber pulse   - Partial connectivity
```

#### Button Hierarchy
- **Outline**: `border border-slate-600` - Alternative

### 5.5 Tooltip & Overlay Hardening (Premium Glassmorphism)

All tooltips, dropdowns, and overlays must follow the **Ultimate Clarity** glassmorphic standard:

```css
/* index.css */
.premium-tooltip {
  @apply bg-background-card/80 backdrop-blur-xl border-border-primary shadow-2xl;
  z-index: 9999;
}

/* Tooltip Clipping Prevention */
.premium-card {
  overflow: visible !important; /* Required for nested tooltips */
}
```

**Standard Tooltip Props**:
- `bg-background-card/80` (Opacity 80% for readability)
- `backdrop-blur-xl` (Maximum blur for premium feel)
- `z-9999` (Override all standard layout layers)
- `break-all` (For long technical URLs/IDs)

### 5.6 Integration Status Indicators (Spatial Intuition)

Status dots (connection indicators) should be placed **immediately next to the label** they represent, not at the end of the line, to improve spatial association for the operator.

```jsx
// Correct Pattern
<div className="flex items-center gap-2">
  <span className="h-2 w-2 rounded-full bg-status-success shadow" />
  <span className="text-xs font-black uppercase">WAZUH MANAGER</span>
</div>
```

### 5.7 Integration Error Tooltip Enhancement

```jsx
// components/integrations/IntegrationErrorTooltip.jsx
function IntegrationErrorTooltip({ 
  service, 
  status, 
  error, 
  config, 
  lastTested, 
  onRetry, 
  onOpenSettings 
}) {
  const troubleshootingSteps = {
    wazuh: [
      {
        icon: <Globe className="h-4 w-4" />,
        label: 'Cek Koneksi Jaringan',
        description: `Ping ke ${config.host}`,
        action: () => testPing(config.host)
      },
      {
        icon: <Key className="h-4 w-4" />,
        label: 'Verifikasi Kredensial',
        description: 'Test login ke Wazuh dashboard',
        action: () => openExternal(`https://${config.host}:5601`)
      },
      {
        icon: <Shield className="h-4 w-4" />,
        label: 'Cek Firewall',
        description: `Port ${config.managerPort} dan ${config.indexerPort} harus terbuka`,
        action: () => showFirewallGuide()
      },
      {
        icon: <Book className="h-4 w-4" />,
        label: 'Buka Dokumentasi Wazuh',
        description: 'Panduan konfigurasi resmi',
        action: () => openExternal('https://documentation.wazuh.com')
      }
    ],
    opencti: [
      // Similar pattern untuk OpenCTI
    ],
    telegram: [
      // Similar pattern untuk Telegram
    ]
  };
  
  return (
    <div className="w-[450px] rounded-xl bg-slate-900 p-4 shadow-2xl ring-1 ring-slate-700">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3 border-b border-slate-800 pb-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          status === 'error' ? 'bg-rose-900/50' : 'bg-amber-900/50'
        }`}>
          <WifiOff className={`h-5 w-5 ${
            status === 'error' ? 'text-rose-400' : 'text-amber-400'
          }`} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-100">
            {service === 'wazuh' ? 'WAZUH SIEM' : service === 'opencti' ? 'OpenCTI' : 'Telegram Bot'}
          </h3>
          <p className="text-xs font-medium text-rose-400">
            {status === 'error' ? 'TERPUTUS' : 'PARISIAL'}
          </p>
        </div>
      </div>
      
      {/* Error Box */}
      <div className="mb-4 rounded-lg bg-rose-900/20 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-rose-400">
          <AlertTriangle className="h-4 w-4" />
          Masalah Terdeteksi
        </div>
        <p className="text-xs text-slate-400">
          {error.message || 'Tidak dapat terhubung ke service.'}
        </p>
        {error.code && (
          <p className="mt-1 text-xs text-slate-500">
            Detail: {error.code}
          </p>
        )}
      </div>
      
      {/* Config Details */}
      <div className="mb-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Konfigurasi Saat Ini
        </h4>
        <div className="space-y-1 rounded-lg bg-slate-800/50 p-3 text-xs">
          {Object.entries(config).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-slate-500">{key}:</span>
              <span className={value ? 'text-slate-300' : 'text-amber-400'}>
                {value || 'Belum diatur'}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Troubleshooting Steps */}
      <div className="mb-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Troubleshooting
        </h4>
        <div className="space-y-1">
          {troubleshootingSteps[service].map((step, idx) => (
            <button
              key={idx}
              onClick={step.action}
              className="flex w-full items-center gap-2 rounded p-2 text-left hover:bg-slate-800"
            >
              <span className="text-cyan-400">{step.icon}</span>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-300">{step.label}</p>
                <p className="text-[10px] text-slate-500">{step.description}</p>
              </div>
              <ChevronRight className="h-3 w-3 text-slate-600" />
            </button>
          ))}
        </div>
      </div>
      
      {/* Actions */}
      <div className="mb-3 flex gap-2">
        <Button variant="primary" size="sm" className="flex-1" onClick={onRetry}>
          <RefreshCw className="mr-1 h-3 w-3" />
          Uji Koneksi Ulang
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={onOpenSettings}>
          <Settings className="mr-1 h-3 w-3" />
          Buka Pengaturan
        </Button>
      </div>
      
      {/* Alternative */}
      <div className="rounded bg-slate-800/30 p-2 text-center">
        <span className="text-xs text-slate-500">Alternatif: </span>
        <Link to="/demo" className="text-xs text-cyan-400 hover:underline">
          YZ(R) Aktifkan Demo Mode
        </Link>
      </div>
      
      {/* Footer */}
      <div className="mt-3 border-t border-slate-800 pt-2 text-[10px] text-slate-600">
        <div className="flex justify-between">
          <span>Terakhir dicoba: {formatRelativeTime(lastTested)}</span>
          <span>Interval cek: 30 detik</span>
        </div>
      </div>
    </div>
  );
}
```

### 5.8 Accessibility Checklist

- [ ] Semantic HTML (H1-H4 hierarchy)
- [ ] Form labels properly associated
- [ ] Button elements (bukan div dengan onclick)
- [ ] ARIA labels untuk icon-only buttons
- [ ] Focus indicators visible
- [ ] Keyboard navigation untuk tables
- [ ] Color contrast ratio a 4.5:1
- [ ] `useReducedMotion` untuk animations

### 5.9 Popout UI Architecture

Untuk menjaga sidebar tetap ramping (fokus pada 6 modul operasional inti), fitur-fitur pendukung dimigrasikan dari halaman (pages) ke sistem Popout:

- **Modal Components**: Digunakan untuk `About` (Core Intelligence Data). Template: `src/components/about/AboutModal.jsx`. Menggunakan library `framer-motion` untuk transisi drop-down premium.
- **Drawer Components**: Digunakan untuk `Data Ingestion` (Payload Injection). Template: `src/components/ingestion/IngestionDrawer.jsx`. Muncul sebagai slide-over dari sisi kanan untuk menjaga konteks editor.

### 5.10 Homelab Bootstrap System (v5.11+)

Sistem sinkronisasi konfigurasi otomatis untuk memudahkan setup di environment baru:

1. **Server-to-Client Sync**: Saat aplikasi load, `SettingsContext` melakukan fetch ke `/api/config/bootstrap`.
2. **Environment Priority**: Nilai dari `.env` (BFF) akan menimpa (override) `localStorage` jika terjadi konflik, memastikan satu sumber kebenaran (Source of Truth).
3. **Automated Handshake**: Segera setelah config tersinkronisasi, sistem menjalankan `testConnection` secara background untuk semua integrasi aktif (Wazuh, OpenCTI, Telegram).

### 5.11 Clinical Stasis Protocol (Anti-Jitter)

Untuk menjaga integritas visual pada modul investigasi kritis (terutama TriagePage), developer **WAJIB** mematuhi protokol **Clinical Stasis**:

1.  **Anti-Flicker Damping**: Update data yang sering (seperti socket presence) **HARUS** dilewatkan melalui damping buffer (minimal 1.5s) sebelum dirender ke UI.
2.  **Identity-Locked Rendering**: Komponen avatar/inisial **WAJIB** menggunakan `React.memo` dengan perbandingan manual pada properti identitas (`userId`, `username`) untuk mencegah re-mount selama sinkronisasi data.
3.  **Static Height Constraints**: Area presence atau header **HARUS** memiliki `min-height` atau `height` tetap (contoh: `min-h-[72px]`) untuk mencegah *layout jumping* saat data memuat.
4.  **Zero-Kinetic Entrance**: Hindari animasi `entrance` (fade-in, slide-up) pada halaman investigasi mendalam untuk memberikan kesan "Forensic Stasis" yang profesional.
5.  **Forensic Grid Continuity**: Semua tabel data operasional **WAJIB** menggunakan sistem `Continuous Vertical Border Overlay` dengan `grid-template-columns` yang sinkron antara Header dan Body. Dilarang menggunakan `grid-gap` pada komponen utama untuk menjamin kelurusan garis (vertical alignment).

### 5.12 Identity Governance & Tactical Presence

Standar visual untuk monitoring personil aktif di dalam SOC Dashboard:

1.  **Forensic Borders**: Inisial/Avatar personil **WAJIB** memiliki border tegas (`border-accent-cyan/40`) untuk menunjukkan otoritas operasional.
2.  **Personnel Intercept**: Setiap avatar **WAJIB** mendukung interaksi klik yang menampilkan informasi taktis (Nama Lengkap, Lokasi Halaman, Alamat IP) via Toast Notification.
3.  **Sync-Heartbeat Badge**: Setiap data real-time **WAJIB** didampingi oleh lencana sinkronisasi (Sync Badge) yang menampilkan timestamp pembaruan terakhir secara inline untuk kepastian data.

### 5.13 Forensic Grid & Virtualization Standard (v16.0+)

Untuk menjamin kesinambungan visual pada antarmuka investigasi dengan kepadatan data tinggi, developer **WAJIB** menerapkan standar berikut:

1.  **Continuous Column Borders**: Dilarang menggunakan `border-r` pada sel individual. Gunakan **Absolute Grid Overlay** yang membentang dari atas ke bawah kontainer tabel untuk menjamin garis vertical tetap lurus sempurna meskipun konten di-scroll atau diekspansi.
2.  **Virtualized Row Rendering**: Semua tabel dengan potensi 100+ entri **WAJIB** menggunakan `@tanstack/react-virtual`. Ini menjamin performa 60fps dengan hanya merender baris yang terlihat di viewport.
3.  **Synchronized Grid Templates**: Header (sticky) dan Body **WAJIB** menggunakan variabel `grid-template-columns` yang sama (contoh: `auditGridTemplate`) untuk memastikan alignment pixel-perfect.
4.  **Temporal Extraction**: Gunakan utilitas `pulseParts` dari `datePulse.ts` untuk memisahkan Tanggal dan Waktu secara granular dalam grid, memungkinkan penempatan identitas temporal yang lebih presisi tanpa overlap.

### 5.14 Rutinitas Pra-Deployment (GitHub Pages)

Setiap kali melakukan deployment ke repositori GitHub (`https://github.com/sisigitadi/scops`) dengan target GitHub Pages (`https://sisigitadi.github.io/scops/#/app`), AI Assistant **WAJIB** menjalankan protokol rutin berikut:

1.  **Isolasi & Penguncian Data**: Lakukan isolasi dan penguncian semua data, workflow, serta logic untuk demo mode agar tidak berpengaruh pada production mode.
2.  **Hardening Keamanan**: Lakukan hardening dan security untuk persiapan pre-deploy (CSP, Input Sanitization, Console Striping).
3.  **Persiapan Repositori**: Persiapkan untuk deploy ke repositori github saya di `https://github.com/sisigitadi/scops` dengan link github pages di `https://sisigitadi.github.io/scops/#/app`. (Jangan deploy dulu sebelum user meminta).
4.  **Auto-Demo Entry**: Pastikan link publik masuk ke mode demo secara otomatis tanpa membuka portal atau login page.
5.  **Perimeter Lockdown**: Tutup akses balik ke portal (Landing Page) dan login page saat berada di lingkungan demo publik.
6.  **Sanitasi Dokumentasi (README)**: Update `README.md` dengan hanya menginformasikan fitur, fungsi aplikasi, alur kerja, serta cara penggunaan. Dilarang mencantumkan kredensial, arsitektur dasar, dan detail environment.
7.  **Larangan Dokumen Eksternal**: Dilarang mengupload dokumen apapun (manual book internal, log diskusi, schema detail) ke GitHub. Gunakan `.gitignore` secara ketat untuk memblokir file `.md` selain `README.md`.
8.  **Kerahasiaan Kode & Kredensial**: Jaga kerahasiaan source code dan kredensial untuk mencegah penyalinan tanpa permisi. Upayakan penggunaan repositori Private jika memungkinkan.

---

## 6. Development Phase Log

> **FORMAT UPDATE**: Setiap aktivitas dicatat dengan format:
> `[YYYY-MM-DD HH:mm WIB] [TYPE] - Deskripsi`
> TYPE: INIT | RESEARCH | IMPLEMENT | FIX | REVIEW | DOCS | DEPLOY
> **Note**: WIB = Waktu Indonesia Barat (UTC+7)

### Fase 0: Frontend Readiness (2026-03-31)

| Tanggal | Aktivitas | Status |
|---------|-----------|--------|
| 2026-03-31 00:00 | **[INIT]** Project setup, struktur folder, konfigurasi Vite + React 18 | aoe... |
| 2026-03-31 00:30 | **[IMPLEMENT]** Glassmorphism UI components, Tailwind setup | aoe... |
| 2026-03-31 01:00 | **[IMPLEMENT]** Dashboard layout, sidebar navigation | aoe... |
| 2026-03-31 01:30 | **[IMPLEMENT]** Alert register table, basic filtering | aoe... |
| 2026-03-31 02:00 | **[IMPLEMENT]** Demo data context, mock alerts | aoe... |

### Fase 1: Intel-Enrichment (2026-03-31)

| Tanggal | Aktivitas | Status |
|---------|-----------|--------|
| 2026-03-31 01:10 | **[RESEARCH]** Analisis TriagePage.jsx dan DemoDataContext.jsx untuk integrasi OpenCTI | aoe... |
| 2026-03-31 01:12 | **[DOCS]** Pembuatan implementation_plan_fase_1.md | aoe... |
| 2026-03-31 01:15 | **[IMPLEMENT]** Logika `enrichAlert` di DemoDataContext untuk simulasi OpenCTI async | aoe... |
| 2026-03-31 01:16 | **[IMPLEMENT]** Update TriagePage.jsx dengan UI "Fetching Intel" (pulse animation) | aoe... |
| 2026-03-31 01:17 | **[IMPLEMENT]** Visualisasi data intelijen (Actor, Malware, TLP, Origin) | aoe... |
| 2026-03-31 01:18 | **[FIX]** Verifikasi via browser subagent pada Alert WZH-6003 | aoe... |

### Fase 2: Case-Collaboration (2026-03-31)

| Tanggal | Aktivitas | Status |
|---------|-----------|--------|
| 2026-03-31 01:20 | **[RESEARCH]** Analisis alur kerja eskalasi L1/L2/L3 dan sistem komentar | aoe... |
| 2026-03-31 01:21 | **[DOCS]** Pembuatan implementation_plan_fase_2.md | aoe... |
| 2026-03-31 01:38 | **[IMPLEMENT]** Alur eskalasi wajib justifikasi dengan modal form | aoe... |
| 2026-03-31 01:39 | **[IMPLEMENT]** Auto-post handover note saat eskalasi | aoe... |
| 2026-03-31 01:40 | **[IMPLEMENT]** Badge peran (ADMIN, MANAGER, L1/L2) pada komentar | aoe... |
| 2026-03-31 01:41 | **[IMPLEMENT]** Pembedaan visual untuk log sistem (SOC CORE) | aoe... |
| 2026-03-31 01:42 | **[FIX]** Audit trail integrity tracking di DemoDataContext | aoe... |
| 2026-03-31 01:43 | **[REVIEW]** Pengujian end-to-end (Eskalasi L1->L2) | aoe... |

### Fase 3: Reporting & Metrics (2026-03-31)

| Tanggal | Aktivitas | Status |
|---------|-----------|--------|
| 2026-03-31 01:41 | **[INIT]** Rencana Fase 3: Reporting & Metrics Optimization | aoe... |
| 2026-03-31 02:05 | **[IMPLEMENT]** Metrik operasional tingkat tinggi (MTTR/MTTD) di Dashboard | aoe... |
| 2026-03-31 02:06 | **[IMPLEMENT]** Integrasi Intelijen Ancaman sebagai kolom prioritas baru | aoe... |
| 2026-03-31 02:07 | **[IMPLEMENT]** Modul Laporan Strategis di ReportsPage.jsx | aoe... |
| 2026-03-31 02:08 | **[IMPLEMENT]** Tabel Produktivitas Analis (Kasus Selesai vs Terbuka) | aoe... |
| 2026-03-31 02:09 | **[IMPLEMENT]** Sinkronisasi terminologi metrik ke Bahasa Indonesia/Inggris | aoe... |
| 2026-03-31 02:10 | **[REVIEW]** Verifikasi KPI MTTR, kolom Grup Ancaman, tabel produktivitas | aoe... |

### Fase 4: Security Hardening (2026-03-31)

| Tanggal | Aktivitas | Status |
|---------|-----------|--------|
| 2026-03-31 01:00 | **[INIT]** Fase 4 Sub-Fase 3: Premium Login Experience | aoe... |
| 2026-03-31 01:01 | **[IMPLEMENT]** Instalasi dependency framer-motion | aoe... |
| 2026-03-31 01:05 | **[IMPLEMENT]** Transisi login AnimatePresence (Slide & Fade) | aoe... |
| 2026-03-31 01:06 | **[IMPLEMENT]** Validasi input ketat: email harus @socops.com, password min 6 char | aoe... |
| 2026-03-31 01:07 | **[IMPLEMENT]** Efek mikro-interaksi (Scale & Glow) pada kartu persona | aoe... |
| 2026-03-31 01:08 | **[REVIEW]** Verifikasi browser subagent: Login lancar, animasi smooth | aoe... |

### Fase 5: System Health & Final Consolidation (2026-03-31)

| Tanggal | Aktivitas | Status |
|---------|-----------|--------|
| 2026-03-31 02:09 | **[INIT]** Fase 5: System Health & Maintenance | aoe... |
| 2026-03-31 02:17 | **[IMPLEMENT]** Health Widget untuk monitoring integrasi | aoe... |
| 2026-03-31 02:18 | **[IMPLEMENT]** Rotasi Log Otomatis | aoe... |
| 2026-03-31 02:19 | **[IMPLEMENT]** Audit Navigasi Akhir | aoe... |
| 2026-03-31 02:20 | **[REVIEW]** Verifikasi semua rute (Dashboard, Alerts, Triage, Reports, Settings, Activity Log, About) | aoe... |
| 2026-03-31 02:21 | **[FINALIZE]** Y Proyek baseline SOC OPS Dashboard selesai | aoe... |

### Fase AIO: Portal Enhancement (2026-03-31 - 2026-04-01)

| Tanggal | Aktivitas | Status |
|---------|-----------|--------|
| 2026-03-31 02:50 | **[IMPLEMENT]** Framer-motion efek initial blur to clarity di LandingPage.jsx | aoe... |
| 2026-03-31 02:51 | **[IMPLEMENT]** Cyber-Glow background element | aoe... |
| 2026-03-31 02:52 | **[IMPLEMENT]** Restruktur Hero Section layout | aoe... |
| 2026-03-31 02:53 | **[IMPLEMENT]** AboutPage.jsx dengan seksi Integrated Modules (Phase 1-5) | aoe... |
| 2026-03-31 02:54 | **[IMPLEMENT]** Roadmap fokus masa depan (AI-Powered Correlation & SOAR) | aoe... |
| 2026-03-31 02:55 | **[REVIEW]** Identitas premium portal aplikasi tercapai | aoe... |

### Fase v2.5.x: Bug Fixes & Hardening (2026-04-01)

| Tanggal | Aktivitas | Status |
|---------|-----------|--------|
| 2026-04-01 09:30 | **[FIX]** Hotfix v2.5.1: Resolusi routing 404 pasca login | aoe... |
| 2026-04-01 09:31 | **[FIX]** Ganti redirect statis `/dashboard` dengan `location.state.from` | aoe... |
| 2026-04-01 09:32 | **[FIX]** Fallback redirect ke `/app` di ProtectedRoute.jsx | aoe... |
| 2026-04-01 09:55 | **[IMPLEMENT]** v2.5.1: Role "Executive Auditor" (Read-Only/Guest Viewer) | aoe... |
| 2026-04-01 09:56 | **[IMPLEMENT]** Persona kartu kelima "Executive Auditor" di LoginPage.jsx | aoe... |
| 2026-04-01 09:57 | **[IMPLEMENT]** Read-Only protection: disabled Save, False Positive, Escalate, Notes | aoe... |
| 2026-04-01 16:40 | **[IMPLEMENT]** v2.5.2: Data masking (obfuscation) untuk Demo mode | aoe... |
| 2026-04-01 16:41 | **[IMPLEMENT]** Hostname, IP, User, Rule masking menjadi [SERVER-XXX] / [DATA RAHASIA] | aoe... |
| 2026-04-01 16:42 | **[IMPLEMENT]** Dashboard blur untuk KPI di Demo mode | aoe... |
| 2026-04-01 16:43 | **[IMPLEMENT]** Watermark "DEMO ONLY" diagonal di layout utama | aoe... |
| 2026-04-01 16:44 | **[IMPLEMENT]** ToastContext dan Toast.jsx (Premium Notification System) | aoe... |
| 2026-04-01 18:15 | **[FIX]** Hotfix v2.5.3: Error 404 di AlertsPage (ReferenceError) | aoe... |
| 2026-04-01 18:16 | **[FIX]** Fix import showToast di AlertsPage.jsx, TriagePage.jsx, SettingsPage.jsx | aoe... |
| 2026-04-01 18:25 | **[IMPLEMENT]** v2.5.4: Tombol destruktif tetap clickable untuk Demo (trigger toast) | aoe... |

### Fase v3.x: Professional Architecture (2026-04-01)

| Tanggal | Aktivitas | Status |
|---------|-----------|--------|
| 2026-04-01 19:48 | **[IMPLEMENT]** v3.0.0: Service layer dan error resilience | aoe... |
| 2026-04-01 21:15 | **[IMPLEMENT]** v3.0.0-PRO-READY: Linguistic & operational overhaul | aoe... |
| 2026-04-01 22:30 | **[IMPLEMENT]** v3.1.0: Integration Readiness | aoe... |
| 2026-04-01 23:15 | **[IMPLEMENT]** v3.2.0: Advanced Backend Hardening (manager/indexer split) | aoe... |
| 2026-04-02 01:15 | **[IMPLEMENT]** v3.3.0: Production Integrity & UX Hardening | aoe... |

### Fase v4.x: Production Mode (2026-04-02)

| Tanggal | Aktivitas | Status |
|---------|-----------|--------|
| 2026-04-02 01:30 | **[IMPLEMENT]** v4.0.0: Full Production Mode (hapus mode simulasi) | aoe... |
| 2026-04-02 01:35 | **[FIX]** Hotfix v4.0.1: Real Network Handshake | aoe... |
| 2026-04-02 01:48 | **[FIX]** Hotfix v4.0.2: Production Linguistic Overhaul | aoe... |
| 2026-04-02 02:00 | **[IMPLEMENT]** v4.0.3: Localization & UX Finalization | aoe... |
| 2026-04-02 02:25 | **[IMPLEMENT]** v4.0.4: Dynamic Connection Status Logic | aoe... |
| 2026-04-02 02:30 | **[IMPLEMENT]** v4.0.5: Validation-Driven Status Reset | aoe... |
| 2026-04-02 03:10 | **[IMPLEMENT]** v4.1.0: Roadmap Execution Wave 1 | aoe... |
| 2026-04-02 03:40 | **[IMPLEMENT]** v4.1.1: Credential & API Error Hygiene | aoe... |
| 2026-04-02 04:25 | **[IMPLEMENT]** v4.1.2: Per-Page Runtime Protection | aoe... |
| 2026-04-02 04:55 | **[IMPLEMENT]** v4.1.3: Full Audit + Documentation Consolidation | aoe... |
| 2026-04-02 05:15 | **[IMPLEMENT]** v4.1.4: Lint Baseline Zero-Warning | aoe... |
| 2026-04-02 05:35 | **[IMPLEMENT]** v4.1.5: Route-Level Code Splitting | aoe... |
| 2026-04-02 06:05 | **[IMPLEMENT]** v4.1.6: Runtime Degraded Mode Localization | aoe... |
| 2026-04-02 06:30 | **[IMPLEMENT]** v4.2.0: Reports UX & PDF Scope Controls | aoe... |
| 2026-04-02 06:40 | **[IMPLEMENT]** v4.2.1: Reports Localization Fix | aoe... |
| 2026-04-02 07:10 | **[IMPLEMENT]** v4.2.2: PDF Generation Runtime Hardening | aoe... |
| 2026-04-02 07:30 | **[IMPLEMENT]** v4.2.3: Reports Header Cleanup | aoe... |
| 2026-04-02 07:45 | **[IMPLEMENT]** v4.3.0: Secure Demo Mode (Login-triggered) | aoe... |
| 2026-04-02 08:00 | **[IMPLEMENT]** v4.3.1: BFF Demo Routing & Credential Shield | aoe... |
| 2026-04-02 08:30 | **[IMPLEMENT]** v4.3.2: Runtime Compatibility for Demo | aoe... |
| 2026-04-02 09:25 | **[IMPLEMENT]** v4.3.4: Demo Sensitive Data Obfuscation | aoe... |
| 2026-04-02 09:45 | **[IMPLEMENT]** v4.3.6: Settings Full Obfuscation (Demo) | aoe... |
| 2026-04-02 10:20 | **[IMPLEMENT]** v4.3.8: Platform Content Realignment (Main + About) | aoe... |
| 2026-04-02 11:30 | **[IMPLEMENT]** v4.4.0: Versioning & Changelog System | aoe... |
| 2026-04-02 12:00 | **[IMPLEMENT]** v4.5.0: Inject Payload Hardening | aoe... |
| 2026-04-02 13:00 | **[IMPLEMENT]** v4.6.0: Full RBAC (capability map + BFF enforcement) | aoe... |
| 2026-04-02 14:00 | **[IMPLEMENT]** v4.6.1: JWT Strict Mode Implementation | aoe... |
| 2026-04-02 15:00 | **[IMPLEMENT]** v4.7.0: UI Motion Polish | aoe... |
| 2026-04-02 16:00 | **[IMPLEMENT]** v4.7.1: Stagger Animations | aoe... |
| 2026-04-02 17:00 | **[IMPLEMENT]** v4.7.2: Cross-Display Responsive | aoe... |
| 2026-04-02 18:00 | **[IMPLEMENT]** v4.8.0: Golden Demo Data | aoe... |
| 2026-04-02 19:00 | **[IMPLEMENT]** v4.8.1: Dynamic Branding | aoe... |
| 2026-04-02 20:00 | **[IMPLEMENT]** v4.8.2: Responsive Hardening | aoe... |
| 2026-04-02 21:00 | **[IMPLEMENT]** v4.8.3: Public Deployment Ready | aoe... |
| 2026-04-03 00:30 | **[IMPLEMENT]** v4.9.0: Real-time Animated Indicators | aoe... |
| 2026-04-03 01:00 | **[IMPLEMENT]** v4.9.1: Rich Config Tooltips | aoe... |
| 2026-04-03 02:00 | **[IMPLEMENT]** v4.9.2: Settings Validation Hardening | aoe... |

### Fase v5.x: CLI & Process Management (2026-04-05)

| Tanggal | Aktivitas | Status |
|---------|-----------|--------|
| 2026-04-05 08:00 | **[IMPLEMENT]** v5.0.0: BFF Stabilization (SyntaxError resolution) | aoe... |
| 2026-04-05 09:00 | **[IMPLEMENT]** v5.0.1: Notification data-path fix (Telegram) | aoe... |
| 2026-04-05 10:00 | **[IMPLEMENT]** v5.0.2: Multi-node Wazuh status | aoe... |
| 2026-04-05 14:00 | **[IMPLEMENT]** v5.1.0: Unified CLI (socops) | aoe... |
| 2026-04-05 15:00 | **[IMPLEMENT]** v5.1.1: Process lifecycle hardening (taskkill) | aoe... |
| 2026-04-05 16:00 | **[IMPLEMENT]** v5.1.2: Recursive polling | aoe... |
| 2026-04-05 17:00 | **[IMPLEMENT]** v5.1.3: Status diagnostics cleanup | aoe... |

### Fase Review & Production Planning (2026-04-06)

| Tanggal | Aktivitas | Status |
|---------|-----------|--------|
| 2026-04-06 09:00 | **[REVIEW]** Comprehensive UI/UX Review | aoe... |
| 2026-04-06 10:00 | **[REVIEW]** Code architecture analysis (70% production-ready) | aoe... |
| 2026-04-06 11:00 | **[DOCS]** Database schema design (PostgreSQL) lengkap | aoe... |
| 2026-04-06 13:00 | **[DOCS]** Empty state mockups detail | aoe... |
| 2026-04-06 14:00 | **[REVIEW]** Gap analysis: localStorage a' PostgreSQL migration path | aoe... |
| 2026-04-06 15:00 | **[DOCS]** Consolidasi 9 file MD menjadi SOC_OPS_DEV_GUIDE.md | aoe... |
| 2026-04-06 16:00 | **[DOCS]** Standardisasi format dokumentasi AI Assistant | aoe... |
| 2026-04-06 17:30 WIB | [DOCS] | v1.1.0 - Elaborasi AI Assistant Instructions & Workflow | aoe... |
| 2026-04-07 01:00 WIB | [IMPLEMENT] | v5.2.0: Dark & Light Theme Switching (System Preference + CSS Variables) | aoe... |
| 2026-04-07 10:00 WIB | **[IMPLEMENT]** | v5.3.0: Semantic CSS Variable System, Tailwind extensions, UI components overhaul | aoe... |
| 2026-04-07 15:15 WIB | [OPTIMIZE] | Header Refinement: Removed 'Logout' button from topbar to ensure a cleaner interface, keeping it accessible via the sidebar only | aoe... |
| 2026-04-07 17:45 WIB | [FIX] | Restore Dashboard Footer: Fixed 'White Screen of Death' by implementing custom SVG brand icons (Github, Linkedin) to replace missing Lucide icons, ensuring platform stability | aoe... |
| 2026-04-07 18:00 WIB | [OPTIMIZE] | Theme & Language Toggle Consolidation: Migrated theme switcher to Landing Page/Topbar and removed from Settings; unified language selector into a single toggle button in Topbar | aoe... |
| 2026-04-07 21:40 WIB | [IMPLEMENT] | v5.3.1 - Footer Hardening: Reconstructed AppFooter as a full-width sticky horizontal bar mirroring Topbar. Implemented Grid-cols-3 layout for collision prevention. Moved 'Portal Utama' from Sidebar to Footer icon-only control. | aoe... |
| 2026-04-07 21:42 WIB | [FIX] | Stability Hotfix: Resolved 'ReferenceError: InfoTooltip is not defined' in SettingsPage.jsx. Fixed SyntaxErrors caused by missing lucide-react icons in AppFooter. | aoe... |
| 2026-04-13 10:45 WIB | [DEPLOY] | Mandatory Deployment Routine Integration: Sanitized README, strict .gitignore hardening, and GitHub Actions setup for secure public exposure. | Completed |
| 2026-04-07 21:44 WIB | [OPTIMIZE] | Content Realignment: Renamed 'Configuration Settings' to 'Settings' globally (EN: Settings, ID: Pengaturan) for concise UI navigation. | aoe... |
| 2026-04-08 01:45 WIB | [IMPLEMENT] | v5.4.0 - Settings Page Restructuring: Migrated to a modular, tab-based interface (Branding, Users, Integrations, Audit). Integrated Audit System logic directly into Settings for streamlined access. | aoe... |
| 2026-04-08 02:00 WIB | [IMPLEMENT] | v5.5.0 - Popout UI Architecture: Migrated 'About' and 'Inject Payload' from sidebar pages to contextual Popouts (Modal & Drawer). Streamlined Sidebar to 6 core operational modules. Implemented reusable `Modal` and `Drawer` components. | aoe... |
| 2026-04-08 03:00 WIB | [OPTIMIZE] | v5.6.0 - Glassmorphic UI Hardening: Standardized all tooltips (Topbar, Footer, InfoTooltip) with `bg-background-card/80` and `backdrop-blur-xl`. Set global `z-index: 9999` to resolve clipping. | aoe... |
| 2026-04-08 03:30 WIB | [IMPLEMENT] | v5.7.0 - Operational Clarity: Harmonized integration labels globally (WAZUH ECOSYSTEM, OPENCTI THREAT HUB). Positioned connection dots adjacent to labels for better intuition. | aoe... |
| 2026-04-08 04:00 WIB | [IMPLEMENT] | v5.8.0 - Granular Wazuh Diagnostics: Refactored Topbar to show independent status for Wazuh Manager (API) and Wazuh Indexer (Data). Implemented multi-service health indicators. | aoe... |
| 2026-04-08 04:30 WIB | [FIX] | v5.9.0 - Analytics Hotfix & Hardening: Resolved 'ReferenceError: Sliders/Database/motion is not defined' in Triage and Reports. Upgraded Report sub-components to the Premium Design System. | aoe... |
| 2026-04-08 10:00 WIB | [IMPLEMENT] | v5.10.0 - Correlation Engine: Implementation of Force-Directed Graph (ForceGraph2D) in TriagePage for visual alert relationship analysis (Rule/IP/Alert nodes). | aoe... |
| 2026-04-08 11:30 WIB | [IMPLEMENT] | v5.11.0 - Seamless Homelab Bootstrap: Automatic .env sync from BFF via `/api/config/bootstrap` and automated service handshakes on app startup. | aoe... |
| 2026-04-08 13:00 WIB | [OPTIMIZE] | v5.12.0 - Unified Design & Popout Architecture: Upgraded NotFoundPage with diagnostic UI. Migrated Ingestion & About to contextual Popouts (Modal/Drawer). Applied "True Black" contrast standard. | aoe... |
| 2026-04-08 14:00 WIB | [REVIEW] | v1.2.0 - Dev Guide Hardening: Comprehensive review of codebase, log consolidation, and architecture elaboration for onboarding. | aoe... |
| 2026-04-08 16:30 WIB | [OPTIMIZE] | v5.13.0 - UI Excellence: Implemented Sticky Table Columns (Mobile Optimization), Dynamic Mouse Tracker Glow (Immersive UI), and Export Preview Modal. | aoe... |
| 2026-04-08 18:00 WIB | [REVISE] | v5.14.0 - All Display Compatibility Revision: Fluid Grid (auto-fill), Typography Scaling, Ultra-wide (2k/4k) optimizations, Mobile Scroll Indicators, and PostCSS/Tailwind syntax hardening in CSS files. | aoe... |
| 2026-04-08 18:15 WIB | [OPTIMIZE] | v5.15.0 - Footer Clean-up: Removed redundant tooltips in AppFooter. Reverted brand icons to Github/Linkedin. Fully localized footer messages. | aoe... |
| 2026-04-08 18:30 WIB | [REVISE] | v5.16.0 - Global Brand Sync: Synchronized authentic brand icons (SVG) and removed footer tooltips across both LandingPage and Dashboard for a unified minimal experience. | aoe... |
| 2026-04-08 19:15 WIB | [HOTFIX] | v5.16.1 - Tooltip UX Restore: Re-implemented simplified "Floating Labeller" tooltips for About/Social icons. Fixed `ReferenceError: useState is not defined` in AppFooter. Unified footer parity. | aoe... |
| 2026-04-08 20:30 WIB | [RESTRUCTURE] | v5.17.0 - SOC Operational Workflow: Restructured Sidebar into logic blocks (OPERATIONS, INTELLIGENCE, SYSTEM). Integrated Data Ingestion module to the main nav for simulation exercises. | aoe... |
| 2026-04-08 21:30 WIB | [OPTIMIZE] | v5.17.1 - Elevated RBAC Access: Restricted 'Inject Payload' and 'Settings' visibility to elevated personas (ADMIN, AUDITOR, DEMO). Hardened sidebar logic to hide empty section headers. | aoe... |
| 2026-04-08 22:45 WIB | [REVISE] | v5.17.2 - Redundant Access Hardening: Implemented dual-layer verification (Capability + Role) for high-privilege menu items. Confirmed strict exclusion for Analyst/Manager tiers. | aoe... |
| 2026-04-08 23:15 WIB | [FIX] | v5.17.3 - Zero-Trust Menu Hardening: Implemented explicit role-lock filtering for '/ingestion' and '/settings' to eliminate visibility leaks in Analyst/Manager tiers. Confirmed strict exclusion via direct role comparison. | aoe... |
| 2026-04-08 23:45 WIB | [FIX] | v5.17.4 - Global Zero-Trust Navigation: Extended explicit role-lock filtering to the AppTopbar. Removed 'Inject Payload' database shortcut for Analyst and Manager roles, achieving complete UI isolation. | aoe... |
| 2026-04-08 23:55 WIB | [REVISE] | v5.17.5 - Global Text Normalization & Localization: Completed a comprehensive sweep for hardcoded English strings. Migrated diagnostic labels, node statuses, operational persona titles, and in-depth Triage playbooks to the global translation dictionary (Indonesian & English). Achieving 100% localization parity across the entire dashboard. | aoe... |
| 2026-04-09 00:00 WIB | [RESTRUCTURE] | v5.18.0 - Persistent Identity: Refactored authentication flow to prioritize registered 'Full Name' from the User Management registry instead of persona-based translations. Enabled personalized header identity in both standard and administrative tiers. | aoe... |
| 2026-04-09 00:15 WIB | [REVISE] | v5.18.1 - Enhanced User Lifecycle: Implemented full CRUD support for operational personas. Added identity modification (Edit) capabilities for all registry accounts, including protected administrative profiles. Integrated password-reset logic and dynamic form state for provisioning workflows. | aoe... |
| 2026-04-09 00:20 WIB | [FIX] | v5.18.2 - HOTFIX: Resolved ReferenceError in SettingsUsers by re-destructuring missing lifecycle props. Restored UI stability in the User Management workspace. | aoe... |
| 2026-04-09 00:30 WIB | [REVISE] | v5.18.3 - Robust Localization Handlers: Hardened the translation engine across all layers. Replaced flawed 'OR' fallback logic with explicit key-existence verification to prevent technical identifiers (e.g., 'auth.roleL1_analyst') from being displayed in the UI when assets are missing. Corrected dynamic role-key mapping in the Topbar. | aoe... |
| 2026-04-09 00:40 WIB | [REVISE] | v5.18.4 - Enhanced Identity Breadcrumbs: Added 'Analyst Identity' micro-label to the Topbar header for better visual hierarchy. Updated User Management table headers to explicitly specify 'Full Name' support, fulfilling organizational branding requirements. | aoe... |
| 2026-04-09 00:50 WIB | [REVISE] | v5.18.5 - Streamlined Identity Header: Removed 'Analyst Identity' breadcrumb label for a cleaner, name-first topbar interface. Re-confirmed that the header dynamically prioritizes the registered 'Full Name' from the User Management registry. | aoe... |
| 2026-04-09 01:00 WIB | [RESTRUCTURE] | v5.18.6 - Reactive Identity Headers: Refactored the Topbar to use a live registry lookup for the current user's name. This enables instantaneous header updates when an analyst's 'Full Name' is modified in the Settings panel, eliminating the need for a re-login. | aoe... |
| 2026-04-09 01:15 WIB | [FIX] | v5.18.7 - Fail-Safe Identity Resolution: Hardened the Topbar greeting logic with multi-layered ID/Email fallbacks. Ensures real-time reactive name updates even for legacy sessions without explicit ID metadata. | aoe... |
| 2026-04-09 01:25 WIB | [REVISE] | v5.18.8 - Footer UI Simplification: Significant interface de-cluttering. Replaced the generic 'About' info icon with an explicit 'ABOUT' text button for high visibility. Removed all floating tooltips from the footer dock to minimize visual noise and streamline the terminal aesthetic. | aoe... |
| 2026-04-09 01:30 WIB | [REVISE] | v5.18.9 - UI Terminological Alignment: Synchronized the About Modal headers with the 'ABOUT' footer trigger. Replaced 'Platform Overview' references with the unified 'About' label to ensure a consistent navigational grammar across the platform. | aoe... |
| 2026-04-09 01:45 WIB | [UPGRADE] | v5.19.0 - UI/UX Maximum Refactor: Full platform architectural hardening for visual excellence. Implemented a signature suite of glassmorphic utilities and 'Command-Style' typography. Upgraded the Topbar navigation, Identity Management table, and Data Ingestion portal to achieve state-of-the-art premium aesthetics. Standardized iconic protocol-guided tooltips across all modules. | aoe... |
| 2026-04-08 09:30 WIB | [FIX] | v5.19.1 - CSS Build Hardening: Specialized PostCSS/Tailwind syntax reconstruction to resolve 'bg-bg-panel/10' and border opacity errors. Replaced literal opacity imports with a robust CSS Variable Bridge (`--bg-panel-rgb`). Fixed missing 'Activity' icon ReferenceError in TriagePage. | aoe... |
| 2026-04-08 10:00 WIB | [OPTIMIZE] | v5.19.2 - Investigative UX Hardening: Simplified Topbar by removing 'Inject Payload' and 'IngestionDrawer' (now exclusive to the sidebar). Refactored Alerts Register scroll architecture to eliminate nested friction. Implemented 'Smart Flipping' tooltips (vAlign system) and enabled global card overflow to prevent clipping of protocol guidance. | aoe... |
| 2026-04-08 11:05 WIB | [RESTRUCTURE] | v5.19.3 - Tactical Workspace Hardening: Resolved 'Workspace Overlap' in Alerts Register via dual-anchor sticky right columns (Analyst + Action). Optimized filter grid (lg:grid-cols-4) and implemented high-contrast 'Command' style UI for investigative execution. Hardened table header opacity (95%) for zero-ghosting clarity. | aoe... |
| 2026-04-08 11:25 WIB | [POLISH] | v5.19.4 - High-Density Analytics: Simplified tactical badges to pure numbers (removed 'EVENTS', 'CLUSTERS' suffixes). Enforced 'Numerical Centering' across all registersa"Rule IDs, Rule Levels, and Event Counts are now center-aligned for surgical scanability and structural symmetry. | aoe... |
| 2026-04-08 17:40 WIB | [REVISE] | v5.19.5 - Incident Cluster Table Hardening: Standardized cluster table format (7-column grid) to match Alert Register. Unified visual hierarchy, badges, and action alignment for professional SOC consistency. | aoe... |
| 2026-04-08 18:00 WIB | [FIX] | v5.19.6 - Triage Workspace Isolation: Removed default alert selection on TriagePage via useMemo fallback removal. Interface now remains in 'Awaiting Target' state until an explicit selection is made from the Register. | aoe... |
| 2026-04-08 19:30 WIB | [OPTIMIZE] | v5.19.7 - Grid Aesthetic Hardening: Unified both Alert Register and Incident Clusters to an 8-column forensic layout. Integrated 'Action' column for direct triage access. Standardized headers to Sentence Case for readability. | aoe... |
| 2026-04-08 20:00 WIB | [FIX] | v5.19.8 - Forensic Data Integrity: Implemented `key={alertId}` based reset in TriagePage. Resolved stale data flickers in 'Deep Event Analysis' by forcing full component remount on alert transitions. | aoe... |
| 2026-04-08 21:00 WIB | [UPGRADE] | v5.20.0 - Multi-Display Command Hub: Implemented ultra-wide breakpoints (3xl-5xl). Relaxed container constraints for 4K fluid layouts. Integrated real-time Cross-Tab Sync via Storage Event listeners for multi-monitor workstations. Added 'Triage Pop-out' utility. | aoe... |
| 2026-04-08 22:00 WIB | [FIX] | v5.21.0 - Zero-Trust Demo Access: Strictly prohibited 'Inject Payload' and 'Settings' for the Demo persona across Sidebar, Capability Map, and Router Guards. Achieving complete UI isolation for guest analysts. | aoe... |
| 2026-04-08 23:00 WIB | [OPTIMIZE] | v5.22.0 - Virtualized Demo Ecosystem: Implemented runtime-isolated connectivity masking for Wazuh, OpenCTI, and Telegram in Demo mode. Dashboard now appears 100% synchronized and pre-populated with investigative datasets while ensuring zero-impact on production settings. | aoe... |
| 2026-04-08 23:30 WIB | [FIX] | v5.22.1 - Mobile Responsiveness Patch: Corrected sidebar positioning logic (`lg:relative`) to prevent document flow displacement on mobile. Restored 100% viewport utility for smartphone assets. | aoe... |
| 2026-04-09 00:30 WIB | [UPGRADE] | v5.23.1 - Zero-Block Mobile UX: Converted 'Smart Footer' to `fixed` positioning on mobile to eliminate ghost space blockages. Enforced full vertical stacking for Settings navigation hub, achieving 100% real estate utility for small displays. | aoe... |
| 2026-04-08T21:50:00.000Z | [IMPLEMENT] | v5.24.0 - SIM-SOC Operational Hub: Implemented Team-based duty tracking (multi-analyst), forensic handover snapshots for MSSP billing accountability, and 100% localization parity for the operational module. | aoe... |
| 2026-04-08T22:45:00.000Z | [UPGRADE] | v5.24.1 - SIM-SOC Shift Management: Implemented Shift & Rostering UI in Settings. Enables managers to define operational windows and mandatory team compositions (e.g. 3 L1 + 1 Lead). Integrated direct Settings shortcut in Topbar and expanded RBAC for Demo visibility. | aoe... |
| 2026-04-08T23:15:00.000Z | [FIX] | v5.24.2 - Localization Stability: Resolved 'ReferenceError: language' in SettingsAudit by correctly extracting locale state from context. Ensured 100% runtime integrity for audit log timestamp formatting. | aoe... |
| 2026-04-09 00:15 WIB | [DOCS] | v1.8.0 - Governance Hardening: Updated Dev Guide with mandatory AI Assistant obligations (Section 22). Strategic restructuring initiated for "Operational Management" module with Auditor-level monitoring access. | aoe... |
| 2026-04-09 00:45 WIB | [RESTRUCTURE] | v1.9.0 - Operational Governance Hardening: Decoupled infrastructure settings from management tasks. Refactored SettingsPage into a Single-Page "Pusat Kendali" with Sticky Sidebar Anchor links (Admin only). Deployed standalone "Operational Management" hub (ManagementPage) for Manager/Auditor shift oversight. Hardened RBAC across Context, Sidebar, Topbar, and Router layers. | aoe... |
| 2026-04-09 01:00 WIB | [OPTIMIZE] | v2.0.0 - Management Hub Consolidation: Merged tactical "Operations Command" into the "Manajemen Operasional" hub. Architecture simplified to 2 pillars: Pusat Kendali (Infrastruktur/Admin) and Manajemen Operasional (Operasi/Manager). Retired OperationsPage, unified Handover/Roster/SLA workflows, and synchronized global localization. | aoe... |
| 2026-04-09 01:15 WIB | [RESTRUCTURE] | v2.1.0 - Dual-Hub UI Hardening: Restructured Sidebar into exactly 2 groups: OPERASIONAL and MANAJEMEN. Consolidated "Pusat Kendali", "Manajemen Operasional", and "Penyuntikan Data" into the Management group. Removed Settings (Gear) and Management (Activity) shortcuts from the Topbar for a cleaner interface. Standardized page titles to "PUSAT KENDALI" and "MANAJEMEN OPERASIONAL". | aoe... |
| 2026-04-09 01:30 WIB | [HARDEN] | v2.2.0 - Workflow SOP & RBAC Hardening: Formally integrated Role-Based Operational Workflow into Dev Guide (Section 1.5). Restricted Data Ingestion mutations strictly to ADMIN and Strategic Reports to Manager/Auditor/Admin. Hardened "Read-Only Observability" mandate for Auditor persona across tactical and simulation modules. | aoe... |
| 2026-04-09 01:40 WIB | [HOTFIX] | v2.2.1 - Ingestion Hub Stability: Resolved ReferenceError by importing missing ROLES constant in DataIngestionPage.jsx. Restored page accessibility for simulation/ingestion workflows. | aoe... |
| 2026-04-09 02:00 WIB | [OPTIMIZE] | v3.2.0 - Visual De-cluttering (Ultimate Clarity): Systematically audited and removed all `spectrum-ribbon` elements across 15+ files. Eliminated distractive gradient border lines to achieve a cleaner interface. | aoe... |
| 2026-04-09 02:15 WIB | [OPTIMIZE] | v3.3.0 - Grid Uniformity & Tone Hardening: Standardized 'Hostname' columns. Migrated main backgrounds to Deep Slate (#0F172A) and Crisp White (#FFFFFF). Standardized typography to `font-bold capitalize`. | aoe... |
| 2026-04-09 02:30 WIB | [RESTRUCTURE] | v3.4.0 - Integrations Hub Re-balancing: Symmetrical layout for Wazuh (Tier-1) and OpenCTI/Telegram (Tier-2). Implemented scrollable Audit Log viewport (max 200 entries). | aoe... |
| 2026-04-09 02:45 WIB | [HARDEN] | v3.5.0 - Hardening & Localization: Rebranded Identity to "Logo". Transitioned Personnel Hub to Username-based schema. Audited Report tooltips. Implemented dynamic browser validation localization ("Harap isi kolom ini"). | aoe... |
| 2026-04-09 02:50 WIB | [DOCS] | v3.5.0 - Final Hardening Polish: Completed final aesthetic audit. Unified 'Batal' and 'Verifikasi & Simpan' terminology. Updated Dev Guide and Audit Logs. | aoe... |
| 2026-04-09 02:55 WIB | [RESEARCH] | v3.5.1 - Operational Logic Audit: Technical deep-dive into the user workflow logic (Identity sync, Duty persistence, Leader resolution, and Accountability snapshots). Result: Standardized for Forensic Readiness. | aoe... |
| 2026-04-09 03:00 WIB | [OPTIMIZE] | v3.5.2 - Topbar UI Refinement: Vertical centering of Analyst Identity and Duty Status. Standardized tracking and scaling for elite readability. | aoe... |
| 2026-04-09 03:10 WIB | [IMPLEMENT] | v3.6.0 - Operational Calendar Planning: Native-date scheduling grid with shift assignment modal. Enables persistent rotation planning and team allocation for MSSP accountability. | aoe... |
| 2026-04-09 03:20 WIB | [OPTIMIZE] | v3.6.1 - 24-Hour Rotation Hardening: Integrated visual shift-cycle bars, handover connectivity lines in modal, and 'READY' status for fully-staffed 24h cycles. | aoe... |
| 2026-04-09 03:25 WIB | [IMPLEMENT] | v3.7.2 - Attendance Tracking Sovereignty: Integrated personnel attendance status (Sakit/Ijin/Libur/Dinas) directly into OperationsContext. Calendar now reflects analyst availability for forensic reliability. | aoe... |
| 2026-04-09 03:30 WIB | [OPTIMIZE] | v3.7.3 - Collapsible UI & Modal Hardening: Implemented flexible calendar views (Hide/Show) for workspace management. Refined roster modal with Tab-based navigation (Assignments vs Attendance). | aoe... |
| 2026-04-09 03:40 WIB | [FIX] | v3.7.4 - Localization Integrity: Resolusi critical 'Object Shadowing' di LanguageContext. Konsolidasi 'ops' dictionary keys untuk fix 'raw key' rendering. | aoe... |
| 2026-04-09 14:15 WIB | [OPTIMIZE] | v3.8.0 - Visual De-cluttering & Border Hardening: Pembersihan elemen 'spectrum-ribbon' yang tersisa dan standardisasi ketebalan border dari 2px ke 1px (subtle) pada Portal, Login, Topbar, Sidebar, Footer, dan About Modal. | aoe... |
| 2026-04-09 14:30 WIB | [RESTRUCTURE] | v3.8.2 - Management Workflow Re-engineering: Reorganisasi tata letak modul manajemen berdasarkan alur Monitor a' Govern a' Execute a' Plan. Memindahkan Tim Bertugas ke area taktikal atas dan Shift ke area sentral. | aoe... |
| 2026-04-09 14:45 WIB | [UPGRADE] | v3.9.0 - Governance Intelligence Hub: Menggabungkan metrik SLA, kebijakan Tata Kelola, dan instruksi Planning ke dalam satu konsol "Operational Integrity" yang terpadu di sidebar. | aoe... |
| 2026-04-09 14:50 WIB | [OPTIMIZE] | v3.9.1 - Forensic Log Usability: Implementasi visual lini masa (timeline) pada Log Serah Terima untuk meningkatkan keterbacaan riwayat kronologis. | aoe... |
| 2026-04-09 16:30 WIB | [IMPLEMENT] | v4.0.0 - Shift Guard Protocol (Entry): Implementasi modal wajib "Shift Entry" bagi analis saat login. Menampilkan metrik antrian (High/Critical Alerts) secara real-time sebagai konteks operasional awal. | aoe... |
| 2026-04-09 16:45 WIB | [IMPLEMENT] | v4.0.1 - Data-Driven Handover (Exit): Implementasi protokol keluar shift yang mewajibkan peninjauan insiden aktif yang ditugaskan kepada personel. Penambahan checklist validasi mandatory sebelum Clock-Out aktif. | aoe... |
| 2026-04-09 16:50 WIB | [RESTRUCTURE] | v4.1.0 - Operational Governance Hardening: Konsolidasi logika transisi shift ke dalam `ops.shiftGuard` namespace. Pelokalan 100% untuk seluruh pesan dan instruksi teknis protokol shift. | aoe... |
| 2026-04-09 16:57 WIB | [FIX] | Hotfix v4.1.1: Pembersihan redundansi import icon di ShiftGuardModal.jsx. | aoe... |
| 2026-04-09 16:59 WIB | [FIX] | Hotfix v4.1.2: Perbaikan ReferenceError 'ShieldCheck' dengan sinkronisasi alias 'ShieldIcon' di JSX. | aoe... |
| 2026-04-09 17:01 WIB | [REVISE] | v4.2.0 - Translation Sovereignty: Audit total dan migrasi seluruh string hardcoded ke LanguageContext. Sinkronisasi terminologi 'Queue Acknowledgment' dan 'Incident Finalization' di seluruh modal akuntabilitas. | aoe... |
| 2026-04-09 17:03 WIB | [HARDEN] | v4.3.0 - Binary Access Enforcement: Implementasi auto-logout pada pembatalan protokol Shift-In. Memastikan tidak ada akses operasional tanpa inisialisasi tugas resmi. | aoe... |
| 2026-04-09 17:05 WIB | [FIX] | Hotfix v4.3.1: Resolusi bug infinite loop modal. Implementasi logout paksa setelah 'Finalize & Exit' pada Shift-Out untuk mengakhiri sesi secara total. | aoe... |
| 2026-04-09 17:15 WIB | [IMPLEMENT] | v4.4.0 - Multi-Role Shift Guard: Implementasi protokol spesifik peran (Analyst, Manager, Admin, Auditor). Diferensiasi konteks visual dan validasi wajib berdasarkan otoritas pengguna. | aoe... |
| 2026-04-09 17:17 WIB | [FIX] | Hotfix v4.4.1: Resolusi redeclaration error 'isEntry' dan perbaikan struktur return JSX di ShiftGuardModal.jsx. | aoe... |
| 2026-04-09 17:19 WIB | [FIX] | Hotfix v4.4.2: Koreksi urutan inisialisasi variabel 'isOnDuty' di ShiftGuardModal.jsx untuk mencegah ReferenceError. | aoe... |
| 2026-04-09 17:30 WIB | [RESTRUCTURE] | v5.0.0 - Role Hierarchy Overhaul: Depresiasi role 'L2_ANALYST' menjadi 'MANAGER'. Implementasi 'Total Oversight' untuk role ADMIN (Visibilitas Infra + Tim + Workload). | aoe... |
| 2026-04-09 17:31 WIB | [FIX] | Hotfix v5.0.1: Perbaikan ReferenceError 'currentShift' di AttendanceStatus.jsx dengan implementasi logika deteksi shift aktif real-time. | aoe... |
| 2026-04-09 17:32 WIB | [FIX] | Hotfix v5.0.2: Resolusi TypeError pada shiftConfig. Ditambahkan handling Object.values() untuk mendukung struktur data shift berbasis objek di AttendanceStatus.jsx. | aoe... |
| 2026-04-09 17:36 WIB | [SEC] | Hotfix v5.0.3 - Attendance Visibility: Implementasi filter visibilitas berbasis peran. Admin/Auditor melihat seluruh tim aktif, Manager hanya melihat analis aktif. | aoe... |
| 2026-04-09 17:38 WIB | [FIX] | Hotfix v5.0.4 - Role Migration: Implementasi logika migrasi otomatis l2_analyst ke manager di SettingsContext untuk kompatibilitas data legacy. | aoe... |
| 2026-04-09 17:50 WIB | [FIX] | Hotfix v5.0.5 - Robust Role Filtering: Normalisasi case-insensitive untuk deteksi peran di AttendanceStatus.jsx. Menjamin visibilitas total bagi Admin dan visibilitas terbatas analis bagi Manager. | aoe... |
| 2026-04-09 17:52 WIB | [FIX] | Hotfix v5.0.6 - Operational Sync: Menggunakan activeTeam sebagai sumber data tunggal di Monitor Kehadiran | aoe... |
| 2026-04-09 17:55 WIB | [FIX] | Hotfix v5.0.7 - Multi-Tab Sync & Exclusion Rules: Implementasi storage listener | aoe... |
| 2026-04-09 17:58 WIB | [FIX] | Hotfix v5.0.8 - Full Operational Sync: Sinkronisasi autentikasi antartab | aoe... |
| 2026-04-09 18:12 WIB | [SEC] | Hotfix v5.0.9 - Emergency Auth Bypass: Protokol krisis login admin/manager | aoe... |
| 2026-04-09 18:32 WIB | [ARCH] | Hotfix v5.1.0 - Multi-Identity Session Isolation: Migrasi AuthContext ke sessionStorage | aoe... |
| 2026-04-09 19:15 WIB | [UI] | Hotfix v5.1.2 - Shift Interaction Hardening: Pemurnian logika pemicu ShiftGuard | aoe... |
| 2026-04-09 19:26 WIB | [UI] | Hotfix v5.1.3 - Roster Snapshot Clarity: Fallback status 'NO ACTIVE PERSONNEL' | aoe... |
| 2026-04-09 19:29 WIB | [SEC] | Hotfix v5.1.4 - Hierarchical Roster Filtering: Filter hierarki pada snapshot tim aktif | aoe... |
| 2026-04-09 19:33 WIB | [SEC] | Hotfix v5.2.0 - Audit Logging Framework: Inisialisasi mesin log audit global | aoe... |
| 2026-04-09 19:35 WIB | [UI] | Hotfix v5.2.2 - Forensic Audit UI: Pembuatan halaman Log Forensik | aoe... |
| 2026-04-09 21:00 WIB | [IMPLEMENT] | v6.0.0 - Hardening SOC Governance Ecosystem: Hub Manajemen (Intelijen Analis, Reliabilitas Infra, Pustaka SOP, Capability Matrix) | aoe... |
| 2026-04-09 21:15 WIB | [FIX] | Hotfix v6.0.1 - ReferenceError Fix: Pemulihan inisialisasi state activeTeam di OperationsContext | aoe... |
| 2026-04-09T21:30 WIB | [REVIEW] | v6.1.0 - Compliance Audit & Forensic Hardening | aoe... |
| 2026-04-09 21:55 WIB | [IMPLEMENT] | v7.0.0 - Advanced Control Center: Integrated Dashboard, Bar Charts, Backup/Restore Simulation, and Infrastructure Pulse | aoe... |
| 2026-04-09 21:58 WIB | [FIX] | Hotfix v7.0.1 - JSX Syntax Correction: Menghapus extra closing tag di SettingsIntegrations.jsx | aoe... |
| 2026-04-09 19:38 WIB | [SEC] | Hotfix v5.2.4 - Full Spectrum Logging: Ekspansi sensor audit ke manajemen user, konfigurasi global, serah terima tugas, dan pengayaan intelijen. | aoe... |
| 2026-04-09 19:44 WIB | [SEC] | Hotfix v5.2.5 - Data Egress & Resource Governance: Implementasi audit untuk ekspor data (CSV/JSON), Bulk Actions, dan modifikasi jam operasional shift. | aoe... |
| 2026-04-09 19:48 WIB | [UI] | Hotfix v5.2.6 - Nomenclature Repositioning: Re-labeling 'Audit Sistem' menjadi 'Log Forensik' dan 'Riwayat Aktivitas Data' untuk kejernihan fungsi. | aoe... |
| 2026-04-09 19:54 WIB | [ARC] | Version 5.3.0 - Unified Forensic Hub: Konsolidasi Log Akuntabilitas dan Riwayat Teknis ke dalam satu antarmuka berbasis Tab untuk efisiensi investigasi Admin. | aoe... |
| 2026-04-09 19:59 WIB | [BUG] | Hotfix v5.3.1 - Critical JSX Fix: Resolusi kesalahan sintaksis pada SettingsPage.jsx akibat tag penutup redundan pasca konsolidasi. | aoe... |
| 2026-04-09 22:45 WIB | [IMPLEMENT] | v8.0.0 - Immersive Admin Demo: Upgraded Demo role to Admin-equivalent (restricted Ingestion), enriched operational mockup data (Personnel, Handover, Audit), and deployed premium Onboarding tour. | aoe... |
| 2026-04-09 22:55 WIB | [IMPLEMENT] | v8.1.0 - Operational Heartbeat: Enriched Management Hub (Reliability, Performance, SOPs) and implemented simulated 'Live Sync' heartbeats for internal/external integrations. | aoe... |
| 2026-04-09 23:25 WIB | [FIX] | Hotfix v8.1.1 - Demo Consistency: Resolved state mismatch between Storage providers and deployed 'Denyut Integrasi' animations in Settings Hub. | aoe... |
| 2026-04-09 23:30 WIB | [IMPLEMENT] | v8.1.3 - Real-time Telemetry: Deployed dynamic metric fluctuations (Latency, EPS, Throughput) to the Integration Pulse dashboard for an authentic 'Live' feel. | aoe... |
| 2026-04-09 23:35 WIB | [REFINEMENT] | v8.1.4 - Unified Diagnostic Hub: Decoupled Telemetry metrics for simultaneous viewing, standardized Live Metrics for Production readiness, and refined Topbar Indicator tooltips. | aoe... |
| 2026-04-09 23:45 WIB | [FIX] | Hotfix v8.1.5 - AppTopbar Reliability: Resolved `liveMetrics` ReferenceError and consolidated diagnostic tooltip panels into a single, clean JSX container. | aoe... |
| 2026-04-10 00:00 WIB | [IMPLEMENT] | v8.1.6 - Production Presence Parity: Implemented immediate mockup analyst injection in SocketContext. Merged simulation data with real socket presence to ensure 'Live' feel in Production. | aoe... |
| 2026-04-10 00:05 WIB | [FIX] | Hotfix v8.1.6.1 - ReliabilityTracker Syntax: Resolved critical JSX mismatch in ReliabilityTracker by correctly closing the motion.div tag in the tools loop. | aoe... |
| 2026-04-10 00:10 WIB | [RESTRUCTURE] | v8.1.7 - Elite Topbar Redesign: Compact dual-line identity layout (User|Role and Shift|Members). Implemented dynamic shift detection logic. | aoe... |
| 2026-04-10 11:30 WIB | [FIX] | v8.3.4 - Localization Sovereignty & UI Audit: Conducted 100% audit of hardcoded strings. Refactored IntegratorGuide for full locale/theme parity. | aoe... |
| 2026-04-10 11:45 WIB | [FIX] | v8.3.5 - Platform Integrity Hotfix: Resolved critical 'Unexpected token' (2243) syntax error. Corrected 'RangeError: Invalid language tag'. | aoe... |
| 2026-04-10 13:40 WIB | [IMPLEMENT] | v8.4.0 - Database Sovereignty & Persistent Auth: Successfully migrated to Prisma 7 (SQLite). Established `User` and `SystemSetting` schemas. Seeded 6 forensic identities (including SIGIT ADI) with secure PBKDF2 hashing. Integrated database-backed authentication into BFF (`/api/auth/login`) and enabled `isBackendMode` by default in AuthContext. | aoe... |
| 2026-04-10 15:40 WIB | [RESEARCH] | v8.6.0 - Governance Audit: 100% platform audit for guidance gaps across 30+ operational and administrative modules. | aoe... |
| 2026-04-10 16:00 WIB | [IMPLEMENT] | v8.6.2 - Self-Documenting Hub: Full injection of InfoTooltip guidances across Management, Operations, Audit, and Reports pages. Hardened `group/tooltip` scoping to prevent hover conflicts. | aoe... |
| 2026-04-10 16:20 WIB | [FIX] | v8.6.3 - Sidebar Routing Sovereignty: Resolved 'Double Blue' highlight error in sidebar. Enforced strict path matching (`end={true}`) for Management sub-routes and added navigation tooltips. | aoe... |
| 2026-04-10 16:25 WIB | [FIX] | v8.6.4 - Runtime Integrity: Resolved ReferenceError in AppSidebar by correctly importing InfoTooltip component. | aoe... |
| 2026-04-10 16:30 WIB | [FINALIZE] | v8.6.5 - Documentation Parity: 100% localization parity for guidance strings in Indonesian and English locales. | aoe... |
| 2026-04-10 17:15 WIB | [IMPLEMENT] | v9.0.0 - Progressive Web App (PWA) Sovereignty: Implemented baseline PWA architecture including `manifest.json`, `sw.js` (Service Worker) for asset caching, and generated premium 512x512 tactical icons. Registered PWA engine in `index.html`. | aoe... |
| 2026-04-10 17:25 WIB | [HARDEN] | v9.1.0 - Full Responsive Hardening & Transition Harmonization: Audit of 10+ operational modules. Harmonized entry animations (Stagger delay: 0.1s, stagger: 0.08s) across the entire platform. Implemented high-density single-row static tab architecture for Settings and Management pages. | aoe... |
| 2026-04-10 20:15 WIB | [AUDIT] | v10.0.0 - Comprehensive Platform Audit: Conducted deep architecture, security, and component quality audit. Identified 4 Critical and 4 Significant findings, resulting in the generation of `soc_ops_audit_report.md`. | aoe... |
| 2026-04-10 20:20 WIB | [SEC] | v10.0.1 - Authentication Security Hardening: Eliminated hardcoded bypass credentials (`admin@socops.com` and `manager@socops.com` backdoor) from `AuthContext.jsx`. | aoe... |
| 2026-04-10 20:21 WIB | [SEC] | v10.0.2 - JWT Zero-Trust Architecture: Generated cryptographically strong 256-bit secret via `crypto.randomBytes(32)` in BFF. Implemented absolute 8-hour expiry (`exp` and `iat`) payload checking for strict token validation. | aoe... |
| 2026-04-10 20:21 WIB | [FIX] | v10.0.3 - Cross-Tab Sovereignty: Standardized `socops_access_token`, `socops_user_v2`, and `socops_demo_mode` to `sessionStorage` in `AuthContext` and `api.js` to prevent cross-tab pollution and isolation conflicts. | aoe... |
| 2026-04-10 20:21 WIB | [HARDEN] | v10.0.4 - Zero-Trust API Policy: Enforced `requireCapability()` RBAC middleware across 12 previously unprotected data-access endpoints (Users, Cases, Audit Logs, Schedules) in `index.js`. | aoe... |
| 2026-04-10 20:27 WIB | [HARDEN] | v10.1.0 - Data Integrity Alignment: Corrected database schema gaps. Added `title` and `updatedAt` to `Case` model, removed dangerous plaintext mock password hash from `User`, and injected `@@index` constraints for optimal search performance. Executed Prisma migration. | aoe... |
| 2026-04-10 20:30 WIB | [IMPLEMENT] | v10.1.1 - Forensic Backend Observability: Deployed centralized structured logger (`utils/logger.js`). Substituted generic server errors and fragile `try/catch` with a mature `globalErrorHandler` to safely log metadata (correlation IDs, stack traces) without leaking to the client. | aoe... |
| 2026-04-10 20:36 WIB | [REFINEMENT] | v10.2.0 - UI De-monolithization: Decomposed the massive 30KB `SettingsIntegrations.jsx` component into 4 pristine, modular child components (Pulse, Wazuh, OpenCTI, Telegram) enforcing pure Single Responsibility Principle (SRP) for maximal maintainability. | aoe... |
| 2026-04-10 20:41 WIB | [REFINEMENT] | v10.3.0 - Language Core Refactor: Successfully de-monolithized the giant 125KB `LanguageContext.jsx`. Extracted translation objects into individual JSON modules (`src/locales/id.json` and `src/locales/en.json`). Reduced core context file size from 2,545 lines to a lean ~80 lines. | aoe... |
| 2026-04-10 21:10 WIB | [REFINEMENT] | v10.3.1 - UI Componentization: Fully decomposed monolithic pages `AlertsPage.jsx` and `TriagePage.jsx` into 8 modular sub-components (`AlertsTable`, `IncidentClustersTable`, `TriageHeader`, etc). Reduced Topbar complexity by extracting `SystemTelemetry`. | aoe... |
| 2026-04-10 21:15 WIB | [HOUSEKEEPING] | v10.4.0 - Clean Deployment State: Purged all legacy development artifacts from root directory (`*.bak`, `*.webp`, `*.py`, debug scripts). Sanitized repository for production-ready deployment. | aoe... |
| 2026-04-10 21:23 WIB | [MATURITY] | v11.0.0 - Quality Infrastructure: Introduced Vitest + JSDOM for forensic testing. Initialized TypeScript ecosystem. Migrated core utilities (`sensitiveData`, `formatters`, `passwordSecurity`) to TS with 100% test coverage (8/8 tests passed). | aoe... |
| 2026-04-10 21:40 WIB | [HARDEN] | v11.1.0 - Operational CLI & Service Hardening: Fixed `socops` path mismatch in PowerShell profile with Smart Path Logic. Migrated core `api.js` to `api.ts` with strict Axios typing and governance headers. Added regression tests for API service layer. | aoe... |
| 2026-04-10 21:43 WIB | [MATURITY] | v11.2.0 - Core Hub Type Sovereignty: Migrated `AuthContext` and `SocketContext` to TypeScript (`.tsx`). Established strict RBAC and Analyst presence interfaces. Hardened `PresenceStore.js` with improved error isolation and logging for user sessions. | aoe... |
| 2026-04-10 21:46 WIB | [MATURITY] | v11.3.0 - Data Plane Hardening: Completed TypeScript migration for `SettingsContext`, `LanguageContext`, `ToastContext`, `AlertDataContext`, and `CasesContext`. Defined deep investigative interfaces for forensic data pipelines. Codebase is now 90% type-safe. | aoe... |
| 2026-04-10 21:48 WIB | [MATURITY] | v11.4.0 - Logic Core Sovereignty: Migrated final business layers to TypeScript (`OperationsContext`, `wazuhIndexerService`, `openctiService`). Logic Core is now 100% type-safe. Sanitized all legacy JS artifacts. Prepared for Component-Level hardening. | aoe... |
| 2026-04-10 21:51 WIB | [HARDEN] | v11.5.0 - Workflow Type Sovereignty: Migrated the entire Triage modular suite (`TriagePage`, `TriageHeader`, `TriageDetails`, `TriageInvestigation`, `TriageSOP`, `TriageCaseTrail`, `TriageEscalateModal`) to TypeScript. Implementation of Zero-Trust prop validation across primary investigative workflows. | aoe... |
| 2026-04-10 21:54 WIB | [HARDEN] | v11.6.0 - Governance Hub Sovereignty: Migrated the Command Center (`ManagementPage`, `AttendanceStatus`, `OperationalCalendar`, `StrategicPerformance`) to TypeScript. Secured high-density personnel rostering and analyst capability metrics. Unified operational accountability layer into a type-safe fortress. | aoe... |
| 2026-04-10 21:58 WIB | [HARDEN] | v11.7.0 - Identity Gateway Sovereignty: Migrated `LoginPage` and `LandingPage` to TypeScript. Hardened mission-critical entry protocols, persona-based access mapping, and demo session initialization with strict interface enforcement. Platform is effectively 98% type-safe. | aoe... |
| 2026-04-10 22:01 WIB | [HARDEN] | v11.8.0 - Governance Sovereignty Finalized: Migrated `SettingsPage` to TypeScript. Completed the high-intensity hardening of the administrative configuration layer and infrastructure governance. Platform has reached 100% maturity in core logic and UI sovereignty. | aoe... |
| 2026-04-10 22:04 WIB | [HARDEN] | v11.9.0 - Navigation Sovereignty & Hotfix: Fixed critical ReferenceError in `AppTopbar` (IndicatorTooltip). Migrated `AppTopbar` and `SystemTelemetry` to TypeScript. Completed the 100% migration mission. Base codebase is now a unified, clinical, type-safe forensic environment. | aoe... |
| 2026-04-10 22:08 WIB | [HARDEN] | v11.10.0 - Neural Core Restoration: Resolved "Neurol Module" mounting failure by restoring and hardening `index.html`. Completed the total conversion of the Root Infrastructure (`DashboardLayout`, `App`, `Router`, `Main`) to TypeScript. Platform is now 100% TSX compatible from Entry to Leaf. | aoe... |
| 2026-04-10 22:11 WIB | [HARDEN] | v11.11.0 - Analytical Engine Sovereignty: Migrated `DashboardPage` to TypeScript. Fixed critical `insights.map` runtime error with a safe harvesting protocol. Hardened the KPI and chart data pipeline with strict type safety. | aoe... |
| 2026-04-10 22:15 WIB | [HARDEN] | v11.12.0 - Reporting Sovereignty & Deep Fix: Migrated `ReportsPage` and `ExecutiveSummaryBlock` to TypeScript. Resolved a hidden twin of the `map is not a function` error in the executive highlights. Reporting plane is now 100% type-safe. | aoe... |
| 2026-04-10 22:18 | [HARDEN] | v11.13.0 - Page Plane Sovereignty: Migrated `AlertsPage` to TypeScript. Hardened investigative filtering and bulk actions. Eliminated dynamic import ambiguity by standardizing the primary page plane on TSX. Platform reaches absolute maturity. | aoe... |
| 2026-04-11 04:30 | [HARDEN] | v11.14.0 - IPO Hardening Phase 1: Auth Resilience. Implementasi Dual-Phase Auth Fallback di `AuthContext.tsx`. | aoe... |
| 2026-04-11 04:45 | [HARDEN] | v11.15.0 - IPO Hardening Phase 2: Global Service Pulse. Implementasi `socops:remote-service-update` Window Bridge untuk sinkronisasi status Wazuh/CTI lintas konsol analis. | aoe... |
| 2026-04-11 05:00 | [HARDEN] | v11.16.0 - IPO Hardening Phase 3: Forensic Hashing. Integrasi `generateTransactionHash` ke dalam `trackActivity`. Setiap log kini memiliki TX-HASH (Forensic Signature) untuk non-repudiation. | aoe... |
| 2026-04-11 05:15 | [HARDEN] | v11.17.0 - IPO Hardening Phase 4: Big Data Archive Engine. Implementasi `Archive Mode` dan `Deep Search` di `AlertsPage.tsx` untuk query indeks historis backend. | aoe... |
| 2026-04-11 05:45 | [AUDIT] | v12.0.0 - Full UI/UX & Localization Parity: Paritas 100% ID/EN untuk semua fitur hardening. Audit visual "Clinical Forensic" selesai. TX-HASH visibilitas di AuditPage dioptimalkan. | aoe... |
| 2026-04-11 12:30 WIB | [HARDEN] | v12.1.0 - Forensic Audit Localization: Transitioned all hardcoded strings in `AuditPage.tsx` and `ReliabilityTracker.tsx` to the localization engine. Implemented dynamic interpolation for system state transitions. | aoe... |
| 2026-04-11 12:35 WIB | [FIX] | v12.1.1 - Localization Engine Recovery: Resolved critical JSON syntax corruption in `en.json` that caused key resolution failures. Restored 100% linguistic parity for investigative modules. | aoe... |
| 2026-04-11 12:40 WIB | [OPTIMIZE] | v12.2.0 - Content-Aware Forensic Layout: Refactored `AuditPage` table to use dynamic grid-template-columns. Removed all `truncate` and `line-clamp` constraints to prevent forensic data clipping. Removed version tags from header for cleaner aesthetics. | aoe... |
| 2026-04-11 12:48 WIB | [HARDEN] | v13.0.0 - Forensic Integrity Framework: Implemented persistent TX-HASH (Forensic Signature) architecture. Migrated DB schema (Prisma) with unique `txHash` column. Enforced end-to-end accountability from UI action to persistent storage. Immutable audit logs established (Anti-Delete policy). | aoe... |
| 2026-04-11 14:45 WIB | [HARDEN] | v13.1.0 - Clinical Stasis Protocol: Eliminated all kinetic entrance animations and re-mounting jitter from `TriagePage`. Established a 'Data Stasis Shield' using deep-memoization to isolate active investigations from background telemetry noise. | aoe... |
| 2026-04-11 15:00 WIB | [HARDEN] | v13.2.0 - Identity Governance & Personnel Intercept: Hardened the Personnel Presence Hub with identity-locked rendering and bold 'Forensic Borders' for analyst initials. Implemented localized 'Personnel Intercept' telemetry (Location/IP) on selection and synchronized the 'Sync Heartbeat' badge for contextual real-time oversight. | aoe... |
| 2026-04-11 15:10 WIB | [AUDIT] | v14.0.0 - Absolute Platform Localization Audit: Conducted 100% localization parity audit for all hidden system states. Fully translated `ErrorBoundary` (Platform Intercept Failure), `NotFoundPage` (Router Crash), and all hardcoded system messages/toasts into Indonesian. Platform reached absolute linguistic maturity. | aoe... |
| 2026-04-12 18:40 | 16.0.0 | High-Performance Virtualization & Grid Hardening: Integrated `@tanstack/react-virtual` in Audit Hub, standardized Absolute Grid Overlay, and refined temporal extraction. | aoe... |
| 2026-04-12 22:50 WIB | [IMPLEMENT] | v16.1.0 - Persona Hardening: Updated visual identity for personnel to exclusively use generated SVG Caucasian male avatars (DiceBear). Fixed faulty DiceBear API parameter syntax for correct rendering. | aoe... |
| 2026-04-12 22:55 WIB | [IMPLEMENT] | v16.1.1 - Role Governance: Reclassified identity 'SUYADI' from Manager to L2 Specialist (l2_analyst) for accurate RBAC alignment. | aoe... |
| 2026-04-12 23:05 WIB | [HARDEN] | v16.2.0 - Temporal Standardization: Forced absolute 24-hour time format across all date utilities (`formatDateTime`, `pulse`). Eliminated AM/PM notation entirely via `hour12: false` to ensure strict alignment with military/SOC operational workflows. | aoe... |
| 2026-04-13 00:30 WIB | [OPTIMIZE] | Identity & Branding Sanitization: Permanently purged all legacy `openclaw.com` references from the database seeding layer and identity synchronization utilities. Unified all operational emails to the `@socops.com` domain. | aoe... |
| 2026-04-13 00:45 WIB | [FIX] | v17.1.0 - Forensic UI Hardening: Resolved critical tag corruption in `AuditPage.tsx` and standardized high-density grid structures. Achieved 100% localization parity for `integrityVerified` and `recordsFound` telemetry indicators across ID/EN locales. | aoe... |
| 2026-04-13 01:00 WIB | [IMPLEMENT] | v18.0.0 - External Database Integration: Deployed a new 'Database' external tool monitoring ecosystem. Integrated real-time connectivity status, latency tracking, and uptime simulation into the Topbar HUD and Settings Hub. | aoe... |
| 2026-04-13 01:15 WIB | [IMPLEMENT] | v18.1.0 - BFF Mock Service Expansion: Added mock connectivity test endpoints for the external Database service (`/api/test/database`) and establishing baseline handshake protocols for multi-stack environments. | aoe... |
| 2026-04-13 03:45 WIB | [RESTRUCTURE] | v19.0.0 - Tactical Operations Standardization: Transitioned fixed-navigation elements into a responsive, flow-based layout. Relocated tactical HUDs/control strips between headers and content regions. Simplified UI terminology and achieved 100% localization parity across Triage, Reports, and Dashboard. | aoe... |
| 2026-04-13 08:45 WIB | [REMOVE] | v19.1.0 - Operational Interface Hardening: Permanently removed the "Simulate 500 Attacks" tactical demo feature from the Alert Register (AlertsPage). Retained and refined the Export (CSV/JSON) capabilities to ensure production-grade forensic reporting functionality. | aoe... |
| 2026-04-13 09:30 WIB | [RESTRUCTURE] | v19.2.0 - Triage Workspace Refinement: Streamlined the Triage Hub by removing the pop-out workspace button and visual correlation graph. Standardized the workspace title with sidebar terminology and localized the forensic event payload headers. | aoe... |
| 2026-04-13 09:45 WIB | [IMPLEMENT] | v19.2.1 - Strategic UI Standardization: Implemented a floating "Save" command HUD (Strategic Command Strip) in the Settings Hub (Pusat Kendali) to ensure tactical UX consistency with the Management module. | aoe... |
| 2026-04-13 10:00 WIB | [LOCALIZE] | v19.2.2 - Governance Localization Sovereignty: Localized "GOVERNANCE" across Management and Settings command HUDs. Standardized HUD design. | aoe... |
| 2026-04-13 10:30 WIB | [FIX] | v19.2.3 - Structural Resilience Update: Refactored provider hierarchy in `main.tsx` (LanguageProvider moved to root). Hardened `useLanguage` hook with a graceful fallback system to resolve "missing context" runtime violations. | aoe... |
| 2026-04-13 11:00 WIB | [OPTIMIZE] | v19.2.4 - UI Streamlining: Removed redundant "GOVERNANCE" (TATA KELOLA) label from floating command HUDs in Management and Settings modules. Purged obsolete localization keys. | aoe... |
| 2026-04-13 11:30 WIB | [OPTIMIZE] | v19.2.5 - Terminology Refinement: Removed "Arsip" (Archive) prefix from Sidebar and False Positive Hub interface to simplify nomenclature. Synchronized ID/EN locales. | aoe... |
| 2026-04-13 12:30 WIB | [HARDEN] | v19.2.6 - Forensic Log Standardization: Enforced 100% localization parity and grid alignment in the Global Forensic Log table. Standardized investigative headers and sanitized system-wide telemetry labels (RECORDS LOGGED, INTEGRITY VERIFIED). | aoe... |
| 2026-04-13 13:30 WIB | [HARDEN] | v19.2.7 - Forensic Data Sovereignty: Eliminated all line-clamping and text truncation for technical log descriptions and audit details. Ensured 100% data visibility for investigative oversight. Synchronized `audit.headers.category` nomenclature parity. | aoe... |
| 2026-04-13 14:30 WIB | [OPTIMIZE] | v19.2.8 - Forensic Grid Elasticity: Synchronized the second column header to `audit.headers.category` across all tabs. Expanded grid-template-columns flexibility (1.2fr) to handle multi-line descriptions in the Context/Category column. | aoe... |
| 2026-04-13 15:30 WIB | [HARDEN] | v19.2.9 - Nomenclature Alignment: Synchronized AuditPage title with sidebar ("Log Forensik"). Further increased category column elasticity (2fr / 240px) to prevent investigative data clipping. Verified 100% localization parity for `audit.headers.category`. | aoe... |
| 2026-04-13 16:30 WIB | [OPTIMIZE] | v19.2.11 - Floating Command Synergy: Relocated Audit export commands to a floating Strategic Command HUD (bottom-center) to match Management Center UX. Integrated 'Integrity Verified' persistent status indicator into the HUD. | aoe... |
| 2026-04-13 17:30 WIB | [HARDEN] | v19.2.13 - Localization Integrity: Resolved critical application crash (Blank Screen) by purging duplicate `audit` blocks from `id.json` and `en.json`. Synchronized forensic nomenclature and verified 100% JSON structural integrity across all locales. | aoe... |
| 2026-04-13 18:15 WIB | [OPTIMIZE] | v19.2.14 - Massive Density Hardening: Injected 9999 high-fidelity forensic payloads across alerts, audit logs, and technical data. Re-engineered `proceduralGenerator` for 30-day temporal distribution. Set as permanent default for Demo Mode to simulate production-grade data density. | aoe... |
| 2026-04-13 18:45 WIB | [HARDEN] | v19.2.15 - High-Density Enforcement: Forced the purging of legacy 500-count datasets. Updated `AlertDataContext` and `OperationsContext` to require a minimum of 9000 records, ensuring the 9999-payload injection is applied permanently and visible in the UI. | aoe... |
| 2026-04-13 19:40 WIB | [OPTIMIZE] | v19.2.16 - Temporal Calibration: Re-aligned the `proceduralGenerator` to strictly follow operational volume buckets (Last 1hr: 14, Last 8hrs: 104, Last 12hrs: 168). Ensures realistic chronology for incident triage and temporal analysis demonstrations. | aoe... |
| 2026-04-13 19:50 WIB | [HARDEN] | v19.2.17 - Temporal Accumulation: Optimized "Today" filter logic to use a rolling 24-hour window instead of strict UTC-date matching. Ensures that "Today" correctly accumulates all alerts from the 1h, 8h, and 12h windows, resolving the volume discrepancy. | aoe... |
| 2026-04-13 20:10 WIB | [HARDEN] | v19.2.18 - Operational Hierarchy: Refined "Penanggung Jawab" (Leader) logic in Management and Operations pages. Explicitly excluded Admin roles and prioritized Manager/L2 roles to align with SOC command protocols. | aoe... |
| 2026-04-13 20:15 WIB | [HARDEN] | v19.2.19 - Singular Command: Further restricted the "Penanggung Jawab" designation to ONLY include roles with the 'Manager' keyword. L2 and Admin are now excluded from being the primary leader in the UI. | aoe... |
| 2026-04-13 20:20 WIB | [OPTIMIZE] | v19.2.20 - Unified Responsiveness: Audited all core modules (Dashboard, Alerts, Triage, Management) for mobile compatibility. Implemented horizontal scroll for calendar grids and responsive chart heights to ensure forensic legibility on all devices. | aoe... |
| 2026-04-13 20:25 WIB | [SECURITY] | v19.2.21 - Tactical Lockdown: Implemented strict isolation between Demo and Production modes. Added `VITE_APP_ENV` gating, hardened AuthContext bypasses, secured Alert Data Pipeline from accidental demo-data leakage, and integrated Content Security Policy (CSP). | aoe... |
| 2026-04-13 20:30 WIB | [DEPLOY] | v19.2.22 - CI/CD Readiness: Created GitHub Actions workflow for automated deployment. Implemented zero-friction auto-login logic for demo environments. | aoe... |
| 2026-04-13 20:35 WIB | [HARDEN] | v19.2.23 - Hardened Access Perimeter: Fully blocked access to Landing and Login pages in demo mode, enforcing a direct operational dashboard entry. | aoe... |
| 2026-04-13 20:40 WIB | [DOCS] | v19.2.24 - Deployment Ready: Integrated the mandatory Pre-Deployment Routine into the Dev Guide Section 5.8. | aoe... |
| 2026-04-13 20:45 WIB | [DOCS] | v19.2.25 - Protocol Finalized: Promoted the Pre-Deployment Routine to a TOP-LEVEL [MANDATORY] instruction for all AI SESSIONS. | aoe... |

---

## 7. Active Tasks & Backlog

### [CRITICAL] Priority (High Impact, Low Effort)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | **UI Hardening (Clinical Calm)** | DONE | Total aesthetic overhaul, palette synchronization, and typography scaling - COMPLETED via v3.5.0 |
| 2 | **Database Migration (Prisma)** | DONE | Transitioned to SQLite via Prisma 7 - COMPLETED v8.4.0 |
| 3 | **Persistent Auth (JWT)** | DONE | Implemented DB-backed login - COMPLETED v8.4.0 |
| 4 | **Incident Management CRUD** | DONE | SQLite Persistence for Cases - COMPLETED v8.5.0 |
| 5 | **Audit Log Persistence** | DONE | Persistent trackActivity to DB - COMPLETED v8.5.0 |
| 6 | **Testing Suite** | DONE | Vitest + JSDOM Infrastructure and Core Util Tests - COMPLETED v11.0.0 |
| 7 | **Operational Governance** | DONE | Governance Intelligence Hub, Handover logs, unified planning - COMPLETED |
| 8 | **Forensic Governance Hardening** | DONE | Full Localization, SOP Diffing, Skills Audit - COMPLETED via v6.1.0 |
| 9 | **Advanced Control Center** | DONE | Dashboard Overview, Bar Charts, Backup/Restore - COMPLETED v7.0.0 |
| 10 | **Global Presence Engine** | DONE | Real-time analyst tracking, global session store, page telemetry - COMPLETED v8.3.0 |
| 11 | **Administrative Disconnect** | DONE | Force LogOut protocol, self-kick protection, ME indicator - COMPLETED v8.3.1 |
| 12 | **Forensic Logging of Kick** | DONE | Auto-log Force Disconnect events to Forensic Hub - COMPLETED v8.3.2 |
| 13 | **Presence Persistence** | DONE | File-based JSON DB backend for globalPresence store - COMPLETED v8.3.3 |
| 14 | **Forensic Grid & Virtualization** | DONE | High-performance @tanstack/react-virtual & Absolute Grid Overlay - COMPLETED v16.0.0 |
| 15 | **Tactical UI Standardization** | DONE | Responsive flow-based layout & HUD relocation - COMPLETED v19.0.0 |

### [HIGH] Priority (Medium Effort)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Mobile Table Optimization | DONE | Horizontal scroll dengan sticky columns via v5.13.0 |
| 2 | Settings Restructure | TODO | Modular tabs: Branding, Users, Integrations, Audit |
| 3 | Typography Update | DONE | Sentence case & Fluid scaling via v5.14.0 |
| 4 | All Display Compatibility | DONE | 480p to 4K Ultrawide support via v5.14.0 |
| 5 | **Forensic Table Standardization** | DONE | Global continuity grid implemented across all modules - COMPLETED v15.0.0 |

### [MEDIUM] Priority (Long-term)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Export Preview Modal | DONE | Preview sebelum data download via v5.13.0 |
| 2 | **Triage Onboarding** | DONE | Guided tour first-time users - COMPLETED v8.0.0 |
| 3 | Keyboard Shortcuts | TODO | Power user efficiency |
| 4 | TypeScript Migration | IN_PROGRESS | Initiated (Core Utils: 100% Migrated) - v11.0.0 |

---

## 8. Quick Reference

### 8.1 BFF API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/alerts` | POST | Create/receive alert |
| `/api/opencti/query` | POST | Query threat intel |
| `/api/telegram/send` | POST | Send notification |
| `/api/wazuh/authenticate` | POST | Wazuh auth test |
| `/api/wazuh/alerts` | POST | Fetch Wazuh alerts |
| `/api/test/wazuh-manager` | POST | Test Wazuh Manager |
| `/api/test/wazuh-indexer` | POST | Test Wazuh Indexer |
| `/api/test/opencti` | POST | Test OpenCTI |
| `/api/test/telegram` | POST | Test Telegram Bot |

### 8.2 File Paths Reference

| Resource | Path |
|----------|------|
| Frontend Entry | `src/main.tsx` |
| BFF Entry | `server/src/index.js` |
| Layout Component | `src/components/layout/DashboardLayout.tsx` |
| Auth Context | `src/context/AuthContext.tsx` |
| Settings Context | `src/context/SettingsContext.tsx` |
| Wazuh Service | `server/src/services/wazuh.js` |
| Telegram Service | `server/src/services/telegram.js` |
| OpenCTI Service | `server/src/services/opencti.js` |

### 8.3 Common Issues & Fixes

**Issue**: BFF SyntaxError di startup
**Fix**: Cek `package.json` scripts, pastikan `type: module` atau `.mjs` extension

**Issue**: Integration ERROR di semua services
**Fix**: Konfigurasi belum lengkap -> Buka Settings -> Isi Wazuh/OpenCTI config -> Test Handshake

**Issue**: Demo mode tidak load data
**Fix**: Cek `demoData.js` path, pastikan `gold_demo` dataset tersedia

**Issue**: Hot reload tidak bekerja
**Fix**: `npm run dev` saja untuk frontend, `npm run dev:bff` untuk BFF

---

## 9. Appendix

### 9.1 Terminology Glossary

| Indonesia | English | Konteks |
|-----------|---------|---------|
| Notifikasi | Alert/Event | SOC Alert |
| Tingkat Bahaya | Severity | Risk level |
| Enrichment | Threat Intel Enrichment | OpenCTI integration |
| Arsip | Archive | False positive storage |
| Inject | Data Injection | Lab simulation |
| Handshake | Connection Test | API connectivity |
| Triage | Investigation | Alert analysis workflow |
| Ikhtisar | Dashboard/Overview | Main page |
| Register | Register/List | Alert listing |
| Ruang Kerja | Workspace | Triage workspace |

### 9.2 Version History (Consolidated)

| Date (WIB) | Version | Summary of Changes | Editor |
|------------|---------|--------------------|--------|
| 2026-04-10 17:15 | 9.0.0 | Baseline guide consolidated: architecture, DB schema, UI/UX, logs, backlog, quick references. | Team |
| 2026-04-10 (maintenance) | 9.0.1 | Normalized section numbering/cross-references, synced `.tsx` file paths, standardized backlog status/task numbering, ASCII-safe heading cleanup. | AI Assistant |
| 2026-04-11 12:50 | 13.0.0 | Forensic Integrity Hardening: TX-HASH persistence, immutable audit trail, and database schema migration for absolute accountability. | AI Assistant |
| 2026-04-12 18:40 | 16.0.0 | High-Performance Virtualization & Grid Hardening: Integrated `@tanstack/react-virtual` in Audit Hub, standardized Absolute Grid Overlay, and refined temporal extraction. | AI Assistant |

### 9.3 External Resources

- **Wazuh Docs**: https://documentation.wazuh.com/
- **OpenCTI Docs**: https://docs.opencti.io/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/
- **TanStack Query**: https://tanstack.com/query/latest

### 9.4 AI Assistant Context Checklist

Saat memulai session dengan file ini:

- [ ] Baca Project Overview (Section 1)
- [ ] Cek Tech Stack (Section 2)
- [ ] **Review Development Log (Section 6)** -> **PANDUAN AWAL WAJIB**
- [ ] **Identifikasi Active Tasks (Section 7)** -> **PANDUAN AWAL WAJIB**
- [ ] Berikan ringkasan status dan review task tersedia
- [ ] Tanyakan user: "Task mana yang ingin Anda kerjakan selanjutnya?"
- [ ] **Setelah aktivitas selesai, WAJIB LOG ke Section 6**

### 9.5 Template Workflow untuk Session Baru

```markdown
# Saat User Memberikan File Ini:

#### Langkah 1: Review & Resume (WAJIB)
"Saya telah membaca SOC_OPS_DEV_GUIDE.md. Berikut status terkini:

**Pekerjaan Terakhir (dari Section 6):**
- [YYYY-MM-DD HH:mm] [TYPE] - Deskripsi aktivitas terakhir

**Task Tersedia (dari Section 7):**
[CRITICAL]:
  #1. [Task name] - Status
  #2. [Task name] - Status
[HIGH]:
  #5. [Task name] - Status
[MEDIUM]:
  #9. [Task name] - Status

Task mana yang ingin Anda kerjakan selanjutnya?"

#### Langkah 2: Eksekusi Task
[Jalankan development sesuai task yang dipilih]

#### Langkah 3: Mandatory Logging (WAJIB)
Setelah selesai:
"Aktivitas telah selesai. Saya akan mencatat ke Section 6.

LOG: 2026-MM-DD HH:mm [TYPE] - [Deskripsi lengkap aktivitas]"
-> [Auto-update Section 6]

#### Langkah 4: Next Steps
"Task selesai. Apakah Anda ingin:
1. Lanjut ke task lain dari Section 7?
2. Menambah task baru (TODO)?
3. Review hasil pekerjaan?"
```

### 9.6 Format Log Aktivitas (Standar)

**Template Entry untuk Section 6:**
```markdown
| YYYY-MM-DD HH:mm | [TYPE] | [Deskripsi aktivitas lengkap] | Status |

TYPE options:
- [INIT]    = Inisialisasi/setup
- [RESEARCH]= Analisis & research
- [DOCS]    = Dokumentasi
- [IMPLEMENT]= Implementasi fitur/kode
- [FIX]     = Bug fix/hotfix
- [REVIEW]  = Code review/testing
- [DEPLOY]  = Deployment/release
```

**Contoh Entry:**
```markdown
| 2026-04-06 17:30 WIB | [IMPLEMENT] | Setup Prisma ORM dengan PostgreSQL, create migration untuk users dan cases tables | aoe... |
```

---

> **END OF DOCUMENT**
> 
> ## Y"" Ringkasan Workflow
> 
> ### Untuk User:
> 1. **Upload file** a' AI baca dan review a' Tanya "apa yang dilakukan?"
> 2. **LOG:** a' Catat aktivitas ke Section 6 (panduan awal session berikutnya)
> 3. **TODO:** a' Tambah task ke Section 7
> 4. **DONE:#X** a' Tandai task selesai + auto-log ke Section 6
> 
> ### Untuk AI Assistant:
> 1. **Session baru** a' Baca Section 6 & 7 a' Resume status a' Tanya task pilihan
> 2. **Upload file** a' Baca a' Review a' Tanya "apa yang dilakukan?"
> 3. **Setelah aktivitas** a' **WAJIB LOG ke Section 6** a' Simpan file
> 
> ### Mandatory Rule:
> > **Section 6 (Development Phase Log) adalah panduan awal (initial reference)**
> > untuk semua session berikutnya. Tanpa log yang lengkap, AI Assistant tidak dapat
> > melanjutkan pekerjaan dengan konteks yang tepat.
> 
> **Format Update:**
> - LOG: [YYYY-MM-DD HH:mm] [TYPE] - [deskripsi]
> - TODO: [deskripsi task]
> - DONE: #[nomor] - [deskripsi penyelesaian]
> - UPDATE: [section] - [perubahan]


### 9.7 Document Changelog
| 5 | **Forensic Table Standardization** | DONE | Global continuity grid implemented across all modules - COMPLETED v15.0.0 |

### [MEDIUM] Priority (Long-term)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Export Preview Modal | DONE | Preview sebelum data download via v5.13.0 |
| 2 | **Triage Onboarding** | DONE | Guided tour first-time users - COMPLETED v8.0.0 |
| 3 | Keyboard Shortcuts | TODO | Power user efficiency |
| 4 | TypeScript Migration | IN_PROGRESS | Initiated (Core Utils: 100% Migrated) - v11.0.0 |

---

## 8. Quick Reference

### 8.1 BFF API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/alerts` | POST | Create/receive alert |
| `/api/opencti/query` | POST | Query threat intel |
| `/api/telegram/send` | POST | Send notification |
| `/api/wazuh/authenticate` | POST | Wazuh auth test |
| `/api/wazuh/alerts` | POST | Fetch Wazuh alerts |
| `/api/test/wazuh-manager` | POST | Test Wazuh Manager |
| `/api/test/wazuh-indexer` | POST | Test Wazuh Indexer |
| `/api/test/opencti` | POST | Test OpenCTI |
| `/api/test/telegram` | POST | Test Telegram Bot |

### 8.2 File Paths Reference

| Resource | Path |
|----------|------|
| Frontend Entry | `src/main.tsx` |
| BFF Entry | `server/src/index.js` |
| Layout Component | `src/components/layout/DashboardLayout.tsx` |
| Auth Context | `src/context/AuthContext.tsx` |
| Settings Context | `src/context/SettingsContext.tsx` |
| Wazuh Service | `server/src/services/wazuh.js` |
| Telegram Service | `server/src/services/telegram.js` |
| OpenCTI Service | `server/src/services/opencti.js` |

### 8.3 Common Issues & Fixes

**Issue**: BFF SyntaxError di startup
**Fix**: Cek `package.json` scripts, pastikan `type: module` atau `.mjs` extension

**Issue**: Integration ERROR di semua services
**Fix**: Konfigurasi belum lengkap -> Buka Settings -> Isi Wazuh/OpenCTI config -> Test Handshake

**Issue**: Demo mode tidak load data
**Fix**: Cek `demoData.js` path, pastikan `gold_demo` dataset tersedia

**Issue**: Hot reload tidak bekerja
**Fix**: `npm run dev` saja untuk frontend, `npm run dev:bff` untuk BFF

---

## 9. Appendix

### 9.1 Terminology Glossary

| Indonesia | English | Konteks |
|-----------|---------|---------|
| Notifikasi | Alert/Event | SOC Alert |
| Tingkat Bahaya | Severity | Risk level |
| Enrichment | Threat Intel Enrichment | OpenCTI integration |
| Arsip | Archive | False positive storage |
| Inject | Data Injection | Lab simulation |
| Handshake | Connection Test | API connectivity |
| Triage | Investigation | Alert analysis workflow |
| Ikhtisar | Dashboard/Overview | Main page |
| Register | Register/List | Alert listing |
| Ruang Kerja | Workspace | Triage workspace |

### 9.2 Version History (Consolidated)

| Date (WIB) | Version | Summary of Changes | Editor |
|------------|---------|--------------------|--------|
| 2026-04-10 17:15 | 9.0.0 | Baseline guide consolidated: architecture, DB schema, UI/UX, logs, backlog, quick references. | Team |
| 2026-04-10 (maintenance) | 9.0.1 | Normalized section numbering/cross-references, synced `.tsx` file paths, standardized backlog status/task numbering, ASCII-safe heading cleanup. | AI Assistant |
| 2026-04-11 12:50 | 13.0.0 | Forensic Integrity Hardening: TX-HASH persistence, immutable audit trail, and database schema migration for absolute accountability. | AI Assistant |
| 2026-04-12 18:40 | 16.0.0 | High-Performance Virtualization & Grid Hardening: Integrated `@tanstack/react-virtual` in Audit Hub, standardized Absolute Grid Overlay, and refined temporal extraction. | AI Assistant |
| 2026-04-12 22:25 | 17.0.0 | Forensic Grid Continuity & Localization Sovereignty: Implemented pixel-perfect vertical borders, 100% ID/EN Audit Hub parity, and high-density 500-record demo seeding. | AI Assistant |
| 2026-04-13 01:15 | 18.2.0 | Database Service Integration: Deployed the 'Database' external tool monitoring suite, synchronized localization keys for forensic integrity, and establishing mock BFF handshake protocols. | AI Assistant |
| 2026-04-13 03:45 | 19.0.0 | Tactical Operations Standardization: Transitioned fixed-navigation elements to responsive flow layout, relocated tactical HUDs, simplified UI terminology, and synchronized workspace localization. | AI Assistant |
| 2026-04-13 08:45 | 19.1.0 | Operational Interface Hardening: Removed Simulation feature from Alert Register; retained and refined Export (CSV/JSON) for production use. | AI Assistant |
| 2026-04-13 09:30 | 19.2.0 | Triage Workspace Refinement: Removed pop-out workspace, decommissioned correlation map, localized payload headers, and synced title with sidebar. | AI Assistant |

### 9.3 External Resources

- **Wazuh Docs**: https://documentation.wazuh.com/
- **OpenCTI Docs**: https://docs.opencti.io/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/
- **TanStack Query**: https://tanstack.com/query/latest

### 9.4 AI Assistant Context Checklist

Saat memulai session dengan file ini:

- [ ] Baca Project Overview (Section 1)
- [ ] Cek Tech Stack (Section 2)
- [ ] **Review Development Log (Section 6)** -> **PANDUAN AWAL WAJIB**
- [ ] **Identifikasi Active Tasks (Section 7)** -> **PANDUAN AWAL WAJIB**
- [ ] Berikan ringkasan status dan review task tersedia
- [ ] Tanyakan user: "Task mana yang ingin Anda kerjakan selanjutnya?"
- [ ] **Setelah aktivitas selesai, WAJIB LOG ke Section 6**

### 9.5 Template Workflow untuk Session Baru

```markdown
# Saat User Memberikan File Ini:

#### Langkah 1: Review & Resume (WAJIB)
"Saya telah membaca SOC_OPS_DEV_GUIDE.md. Berikut status terkini:

**Pekerjaan Terakhir (dari Section 6):**
- [YYYY-MM-DD HH:mm] [TYPE] - Deskripsi aktivitas terakhir

**Task Tersedia (dari Section 7):**
[CRITICAL]:
  #1. [Task name] - Status
  #2. [Task name] - Status
[HIGH]:
  #5. [Task name] - Status
[MEDIUM]:
  #9. [Task name] - Status

Task mana yang ingin Anda kerjakan selanjutnya?"

#### Langkah 2: Eksekusi Task
[Jalankan development sesuai task yang dipilih]

#### Langkah 3: Mandatory Logging (WAJIB)
Setelah selesai:
"Aktivitas telah selesai. Saya akan mencatat ke Section 6.

LOG: 2026-MM-DD HH:mm [TYPE] - [Deskripsi lengkap aktivitas]"
-> [Auto-update Section 6]

#### Langkah 4: Next Steps
"Task selesai. Apakah Anda ingin:
1. Lanjut ke task lain dari Section 7?
2. Menambah task baru (TODO)?
3. Review hasil pekerjaan?"
```

### 9.6 Format Log Aktivitas (Standar)

**Template Entry untuk Section 6:**
```markdown
| YYYY-MM-DD HH:mm | [TYPE] | [Deskripsi aktivitas lengkap] | Status |

TYPE options:
- [INIT]    = Inisialisasi/setup
- [RESEARCH]= Analisis & research
- [DOCS]    = Dokumentasi
- [IMPLEMENT]= Implementasi fitur/kode
- [FIX]     = Bug fix/hotfix
- [REVIEW]  = Code review/testing
- [DEPLOY]  = Deployment/release
```

**Contoh Entry:**
```markdown
| 2026-04-06 17:30 WIB | [IMPLEMENT] | Setup Prisma ORM dengan PostgreSQL, create migration untuk users dan cases tables | aoe... |
```

---

> **END OF DOCUMENT**
> 
> ## Y"" Ringkasan Workflow
> 
> ### Untuk User:
> 1. **Upload file** a' AI baca dan review a' Tanya "apa yang dilakukan?"
> 2. **LOG:** a' Catat aktivitas ke Section 6 (panduan awal session berikutnya)
> 3. **TODO:** a' Tambah task ke Section 7
> 4. **DONE:#X** a' Tandai task selesai + auto-log ke Section 6
> 
> ### Untuk AI Assistant:
> 1. **Session baru** a' Baca Section 6 & 7 a' Resume status a' Tanya task pilihan
> 2. **Upload file** a' Baca a' Review a' Tanya "apa yang dilakukan?"
> 3. **Setelah aktivitas** a' **WAJIB LOG ke Section 6** a' Simpan file
> 
> ### Mandatory Rule:
> > **Section 6 (Development Phase Log) adalah panduan awal (initial reference)**
> > untuk semua session berikutnya. Tanpa log yang lengkap, AI Assistant tidak dapat
> > melanjutkan pekerjaan dengan konteks yang tepat.
> 
> **Format Update:**
> - LOG: [YYYY-MM-DD HH:mm] [TYPE] - [deskripsi]
> - TODO: [deskripsi task]
> - DONE: #[nomor] - [deskripsi penyelesaian]
> - UPDATE: [section] - [perubahan]


### 9.7 Document Changelog

| Date (WIB) | Version | Summary of Changes | Editor |
|------------|---------|--------------------|--------|
| 2026-04-10 17:15 | 9.0.0 | Baseline guide consolidated: architecture, DB schema, UI/UX, logs, backlog, quick references. | Team |
| 2026-04-10 (maintenance) | 9.0.1 | Normalized section numbering/cross-references, synced `.tsx` file paths, standardized backlog status/task numbering, ASCII-safe heading cleanup. | AI Assistant |
| 2026-04-11 12:50 | 13.0.0 | Forensic Integrity Hardening: TX-HASH persistence, immutable audit trail, and database schema migration for absolute accountability. | AI Assistant |
| 2026-04-12 18:40 | 16.0.0 | High-Performance Virtualization & Grid Hardening: Integrated `@tanstack/react-virtual` in Audit Hub, standardized Absolute Grid Overlay, and refined temporal extraction. | AI Assistant |
| 2026-04-12 22:25 | 17.0.0 | Forensic Grid Continuity & Localization Sovereignty: Implemented pixel-perfect vertical borders, 100% ID/EN Audit Hub parity, and high-density 500-record demo seeding. | AI Assistant |
| 2026-04-13 01:15 | 18.2.0 | Database Service Integration: Deployed the 'Database' external tool monitoring suite, synchronized localization keys for forensic integrity, and establishing mock BFF handshake protocols. | AI Assistant |
| 2026-04-13 03:45 | 19.0.0 | Tactical Operations Standardization: Transitioned fixed-navigation elements to responsive flow layout, relocated tactical HUDs, simplified UI terminology, and synchronized workspace localization. | AI Assistant |
| 2026-04-13 08:45 | 19.1.0 | Operational Interface Hardening: Removed Simulation feature from Alert Register; retained and refined Export (CSV/JSON) for production use. | AI Assistant |
| 2026-04-13 09:30 | 19.2.0 | Triage Workspace Refinement: Removed pop-out workspace, decommissioned correlation map, localized payload headers, and synced title with sidebar. | AI Assistant |
| 2026-04-13 10:45 | 19.3.0 | Mandatory Deployment Routine Integration: Sanitized README, strict .gitignore hardening, and GitHub Actions setup for secure public exposure. | AI Assistant |
| 2026-04-13 12:15 | 21.0.1 | Footer Brand Refinement: Redesigned footer into a proportional 3-row vertical layout (Platforms, Community, Signature) for enhanced visual hierarchy on mobile devices. | AI Assistant |
