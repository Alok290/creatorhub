# CreatorHub — Two-Sided Creator & Brand Collaboration Marketplace

Full-stack influencer marketing and brand collaboration platform connecting local/digital **Creators** with **Merchants/Brands**.

> 💡 **For AI Agents & Developers**: See [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) for the complete master architectural brief, design decisions, data models, Meta OAuth details, solved pitfalls, and the active task roadmap.

## Tech Stack
- **Backend**: Spring Boot 3.2.5, Java 21, Spring Security (JWT + RBAC), Spring Data JPA, Hibernate, H2 (local file DB) / MySQL 8 (production)
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Auth & Social Sync**: JWT phone/email auth + Meta / Instagram API with Unified Login (`config_id` & Graph API profile sync)
- **Deployment**: Docker & Docker Compose (Nginx frontend + Spring Boot backend + MySQL 8)

## Quick Start (Local Development)

### 1. Backend (Spring Boot — port `8080`)
```bash
cd backend
./mvnw spring-boot:run
```
On Windows:
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

### 2. Frontend (React + Vite — port `5173`)
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Configuration
Copy `.env.example` to `.env` (or pass environment variables) to configure MySQL, JWT secrets, and Meta/Instagram OAuth credentials:
- `INSTAGRAM_CLIENT_ID` — Meta App ID
- `INSTAGRAM_CLIENT_SECRET` — Meta App Secret
- `INSTAGRAM_CONFIG_ID` — Unified Login Configuration ID (from Meta Developer Dashboard -> Instagram API -> API setup with Unified login)
- `INSTAGRAM_REDIRECT_URI` — Registered OAuth callback URL

## Docker Compose
```bash
docker compose up --build
```

