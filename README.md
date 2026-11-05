# Go Creators (GOCRATERS)

**Go Creators** is a high-performance, fault-tolerant networking and talent-hiring platform designed for cinema and short-form content creators (short films, shorts, reels). It streamlines crew discovery while ensuring strict user privacy and automated moderation.

---

## 🚀 Key Features & Implementation

### 1. Role-Based User Registration & Profiles
- **Categorised Cinema Profiles**: Registration under specific industry roles:
  - `Cinematographer`, `Actor`, `Director`, `Scriptwriter`, `Sound Mixer`, `Editor`, `Producer`, `Art Director`, `Lighting / Gaffer`, `VFX Artist`.
- **Portfolio Showcase**: Upload showreels (MP4), production frames, and screenplay excerpts.
- **Backend Optimization Pipeline**: Built using `sharp` to automatically compress image uploads into WebP format and generate lightweight responsive thumbnails (max 360px) to guarantee **zero dashboard lag**. Hard 15MB file constraint enforced.

### 2. Privacy & Connection Mechanics (Conditional Visibility)
- **Data Masking by Default**: Sensitive data—specifically personal **phone numbers** and **profile photos**—is completely hidden/masked by default (`+• ••• •••-••••` and blurred/shielded avatars).
- **Conditional Visibility**: Sensitive details are strictly withheld by both the backend API and frontend until a candidate **explicitly accepts a connection request**.
- **Mutual Unmasking**: Once accepted, crisp HD profile photos, phone numbers, and direct chat channels unlock immediately.

### 3. Advanced Search & Filtering
- **One-Click Category Filtering**: Primary dashboard filter buttons for instant switching between Cinematographers, Actors, Directors, Writers, Editors, etc.
- **Un-Lagged Discovery**: Instantaneous MongoDB queries leveraging single and compound indexes on `{ category: 1, reports: 1, isBlocked: 1 }`.

### 4. Intelligent Guidance (GoCreators AI Assistant)
- **Crew Guide AI Copilot**: Embedded conversational assistant matching the reference mockup.
- Provides visual lighting concepts (e.g., *Cinematic Noir*, *Saturated 70s Retro*, *Naturalistic Minimalism*), crew recommendations by camera equipment (RED V-Raptor, Sony FX3, Arri Alexa), and project guidance.

### 5. Automated Moderation & Security
- **Strict Report Threshold (15-Report Ban Rule)**:
  - Users can flag suspicious or abusive profiles with categorized violation reasons.
  - Any account accumulating **more than 15 reports** is **instantly and automatically suspended** (`isBlocked: true`).
  - Suspended accounts are immediately hidden from crew discovery, their sessions are revoked, and login attempts are rejected with `HTTP 403 Forbidden`.
- **Secure Gateways (AuthN / AuthZ)**: JWT-based authentication with bcrypt password hashing and protected API routes.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, responsive studio layout mirroring the reference desktop UI.
- **Backend**: Node.js & Express.js with centralized fault-tolerant error handling, rate limiting, and Sharp image pipeline.
- **Database**: MongoDB v8.2 with Mongoose models, compound indexing on `category` and `reports`.

---

## ⚡ Quick Start

### 1. Start MongoDB & Backend Server
```bash
# In the project root:
npm start
```
The server will start at `http://localhost:5000` and automatically serve both the API and the compiled React frontend!

### 2. (Optional) Run Vite Dev Server for Frontend Development
```bash
npm run client
```
Runs the Vite dev server at `http://localhost:5173` with proxy configured to `http://localhost:5000`.

### 3. Re-seed Demo Data
```bash
npm run seed
```

---

## 👤 Pre-Configured Demo Accounts (Password: `password123`)

| Name | Role | Email | Status |
| :--- | :--- | :--- | :--- |
| **Jane Reynolds** | Director | `jane@gocreators.io` | **Default Logged-in Director** |
| **Mark Davis** | Cinematographer | `mark@gocreators.io` | **Connected to Jane** (Unmasked) |
| **Ava Sterling** | Actor | `ava@gocreators.io` | **Pending Invitation** (Accept in Inbox) |
| **Elena Rostova** | Cinematographer | `elena@gocreators.io` | **Unconnected** (Masked phone & photo) |
| **Warning Test User** | Cinematographer | `warning@gocreators.io` | **14 Reports** (1 away from 15 auto-ban) |
| **Suspended Creator** | Actor | `flagged@gocreators.io` | **16 Reports** (Auto-suspended) |

