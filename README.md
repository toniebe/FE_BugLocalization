# Easyfix Web App (Next.js)

Frontend untuk **Easyfix**, platform **bug resolution assistant** yang membantu developer mencari dan menyelesaikan bug lebih cepat dengan:

- Backend **FastAPI** (API bug localization / Bug Knowledge Graph)
- **Firebase Authentication** (Email/Password)
- **Firestore** (data organization & project)
- Visualisasi graph hubungan **query → bug → developer**

Aplikasi ini dibangun dengan **Next.js App Router** dan **Tailwind CSS**.

---

## 🚀 Cara Menjalankan Project

### 1. Prasyarat

Pastikan sudah terinstall:

- **Node.js** `>= 18`
- **npm** / **yarn** / **pnpm**
- Backend FastAPI kamu sudah jalan (misal di `http://127.0.0.1:8000`)
  - Endpoint login: `POST /auth/login`
  - Sudah terhubung ke Firebase Auth & Firestore di sisi backend.

### 2. Clone repository

```bash
git clone <URL_REPO_KAMU>
cd <nama-folder-repo>

# dengan npm
npm install

# atau dengan yarn
yarn

# atau dengan pnpm
pnpm install

```

# 3. Setup ENV
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000

# 4. menjalankan
```bash

# npm
npm run dev

# atau yarn
yarn dev

# atau pnpm
pnpm dev
```

# Easyfix Web App (Next.js)

Aplikasi frontend untuk **Easyfix**, platform bug resolution assistant yang terintegrasi dengan:
- **Backend FastAPI** (API bug localization)
- **Firebase Authentication** (Email/Password)
- **Firestore** (data organisasi & project)

Aplikasi ini dibangun dengan **Next.js (App Router)** dan Tailwind CSS.

---

## ✨ Fitur Utama

### 1. Authentication (Login)

- Login menggunakan **email & password** via Firebase Auth.
- Frontend memanggil backend FastAPI lewat endpoint:
  - `POST /api/auth/login` (Next.js → FastAPI `/auth/login`)
- Response login menyimpan:
  - `id_token` (JWT Firebase) → disimpan sebagai cookie `id_token`
  - `refresh_token` → disimpan di cookie `refresh_token`
  - `expires_in`, `local_id`, `email`
  - `organization_name`, `project_name` (jika sudah terhubung di Firestore)

### 2. Onboarding Flow

Setelah login:

- Jika `project_name === null` → user **diarahkan ke halaman `/onboarding`**.
- Jika `project_name` tersedia → user **langsung diarahkan ke `/home`**.

Halaman onboarding berisi beberapa step:

1. **Add Project**  
   User mengisi:
   - Organization Name
   - Project Name  
   (nama project akan jadi basis penamaan database/slug di backend)

2. **Setup Bug Data**  
   - Tombol *Check Data* untuk mengecek apakah environment bug data sudah disetup admin.
   - Jika “Ready” → tombol *Save and Continue* akan mengarahkan ke `/home`.

3. (Opsional) **Start Using Easyfix**  
   - Informasi bahwa admin sedang menyiapkan data bug (waiting 2x24 jam).
   - Tombol *Continue* → `/home`.

### 3. Home & Graph Bug Knowledge

- Halaman `/home` (belum dijelaskan detail di README ini, tapi umumnya berisi dashboard).
- Ada komponen **graph** (mis. `EasyfixBugGraph`) yang menampilkan:
  - Node **query**
  - Node **bug**
  - Node **developer**
  - Edge `query -> bug` (relasi "matches")
  - Edge `dev -> bug` (relasi "assigned_to")
- Graph di-render menggunakan Cytoscape (atau library graph lain) dan diatur ulang posisinya (layout concentric + custom positioning dev node di sekitar bug).

---

## 🏗️ Tech Stack

- **Next.js** (App Router, `app/` directory)
- **React** (Client Components dengan `"use client"`)
- **Tailwind CSS** (utility-first styling)
- **Next.js Route Handlers** untuk API:
  - `app/api/auth/login/route.js` → proxy ke backend FastAPI
- **FastAPI backend** (di luar repo ini, tapi digunakan sebagai API utama)
- **Firebase Authentication** (Email/Password)
- **Firestore** (organizations, projects, dsb.)

---

## 📁 Struktur Proyek (Ringkas)

Struktur kemungkinan (sesuaikan dengan repo kamu):

```bash
.
├─ app/
│  ├─ layout.jsx
│  ├─ page.jsx                 # landing / home (opsional)
│  ├─ login/
│  │  └─ page.jsx             # halaman login
│  ├─ onboarding/
│  │  └─ page.jsx             # halaman onboarding multi-step
│  ├─ home/
│  │  └─ page.jsx             # halaman home/dashboard
│  └─ api/
│     └─ auth/
│        └─ login/
│           └─ route.js       # Next.js API, proxy ke FastAPI /auth/login
│
├─ components/
│  ├─ OnboardingLayout.js     # layout sidebar + timeline step onboarding
│  └─ EasyfixBugGraph.jsx     # komponen graph bug-query-developer (opsional)
│
├─ app/_lib/
│  ├─ auth-client.js          # helper login() untuk FE
│  └─ fetcher.js              # apiFetch untuk call ke FastAPI
│
├─ styles/
│  └─ globals.css
│
├─ tailwind.config.js
├─ postcss.config.js
├─ next.config.js
├─ package.json
└─ README.md
