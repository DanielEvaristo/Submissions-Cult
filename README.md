# Cult Machine - Submissions Portal

Welcome to the Cult Machine Submissions Portal. This application is completely independent of the main WordPress site and is designed to handle music submissions from artists and industry agencies.

## Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Prisma ORM)
- **Auth**: NextAuth.js (Credentials + JWT)
- **i18n**: next-intl (English, Spanish, French)
- **Package manager**: [pnpm](https://pnpm.io/) 10.x (lockfile: `pnpm-lock.yaml`)

---

## Package manager: pnpm (team checklist)

The portal was migrated from **npm** to **pnpm**. Everyone should follow this so installs stay reproducible.

| Do | Avoid |
|----|--------|
| From the **`portal/`** folder, run **`pnpm install`** after clone or `git pull` | **`npm install`** — it can create `package-lock.json` and a different dependency tree than the rest of the team |
| Commit **`pnpm-lock.yaml`** when dependencies change | Removing `pnpm-lock.yaml` without a good reason |

**Pinned toolchain:** `package.json` has `"packageManager": "pnpm@10.33.4"`. Use [Corepack](https://nodejs.org/api/corepack.html) (`corepack enable`, then `corepack prepare` if needed) so your machine respects that version. On Windows, if Corepack fails with permission errors, use the **`npx --yes pnpm@10.33.4 …`** commands shown in **Local Development** below.

**Common commands:** `pnpm dev`, `pnpm run build`, `pnpm run lint`, `pnpm run db:push` (same ideas as npm; often you can use `pnpm <script>` instead of `pnpm run <script>`).

**Docker:** `Dockerfile` and `Dockerfile.dev` already install with pnpm (`--frozen-lockfile` in production); teammates do not need npm inside the image.

---

## 🎭 Roles & Navigation

The portal has a strict, role-based architecture. Depending on the account type you log in with, the system will automatically route you to your dedicated workspace.

### 1. Artist (`ARTIST`)
- **Login Flow**: If an artist hasn't completed their profile (no genre set), they are redirected to `/[locale]/portal/onboarding`.
- **Workspace**: `/[locale]/portal`
- **Features**: 
  - Submit music with automatic Spotify/Deezer metadata scraping.
  - View submission status (Pending, In Review, Accepted, Rejected).
  - Manage their artist profile.

### 2. Industry / Agency (`INDUSTRY`)
- **Login Flow**: Requires Admin verification. If they log in before verification, they are locked in `/[locale]/pending`.
- **Workspace**: `/[locale]/industry`
- **Features**: 
  - Register multiple sub-artists under their agency.
  - Submit music on behalf of those artists.
  - Track all agency submissions from a centralized dashboard.

### 3. Admin (`ADMIN`)
- **Workspace**: `/[locale]/admin`
- **Features**: 
  - View global stats (total submissions, top genres, user counts).
  - Verify Industry accounts.
  - Manage all submissions.
  - **Staff Management**: Create accounts for Curators (Level 1) and Master Curators (Level 2).

### 4. Curator Level 1 (`CURATOR`)
- **Workspace**: `/[locale]/curator`
- **Workflow (Auto-Assignment)**: 
  - When an artist submits a track, the system looks at the track's genre.
  - It finds all Level 1 Curators assigned to that genre (or Generalists who handle all genres).
  - It automatically assigns the track to the Curator with the **least amount of pending work** (Least-Loaded Round-Robin strategy).
  - The Curator logs in, sees their specific queue (`My Queue`), listens to the track, gives it a 1-5 star rating, adds internal notes, and clicks **Approve to Master** or **Reject**.

### 5. Master Curator Level 2 (`MASTER_CURATOR`)
- **Workspace**: `/[locale]/curator/master` (plus they can see the L1 Inbox if they want).
- **Workflow**: 
  - Master Curators only review tracks that were approved by Level 1 Curators.
  - They read the internal notes and star rating left by L1.
  - They make the final decision: **Accept** (with a specific placement like "Spotify Playlist", "Blog Post") or **Final Reject**.

---

## 🛠 Setup & Commands

### Prerequisites
- Node.js 20+ (recomendado; alineado con Docker)
- [pnpm](https://pnpm.io/) 10.x: idealmente `corepack enable` (puede requerir terminal **como administrador** en Windows si falla con *EPERM*). Si `pnpm` no se reconoce en la consola, usa los comandos con `npx` de abajo.
- Docker (for PostgreSQL)

### Local Development
Abre la terminal en la carpeta **`portal/`** del repo (donde está `package.json`).

1. Start the database:
   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```
   *(Si tu Docker es antiguo y no tiene el plugin Compose V2, prueba `docker-compose` en lugar de `docker compose`.)*
2. Apply migrations:
   ```bash
   pnpm run db:push
   ```
   Si Windows dice que **`pnpm` no se reconoce**, usa la misma versión que el proyecto:
   ```bash
   npx --yes pnpm@10.33.4 run db:push
   ```
   *(PowerShell — si falla por `DATABASE_URL`, ejecuta en una sola línea: `$env:DATABASE_URL="postgresql://cm_user:devpassword@localhost:5432/cm_submissions"; npx --yes pnpm@10.33.4 exec prisma db push`)*
3. Run the development server:
   ```bash
   pnpm dev
   ```
   Sin `pnpm` en el PATH: `npx --yes pnpm@10.33.4 dev`

### Default Accounts
*(These can be changed in the DB, but usually we register from the UI)*
- Go to `/en/register` to create a new Artist or Industry account.
- To create an Admin, register an account, then manually set `isAdmin: true` in your database.
- Once you are Admin, go to `/en/admin/staff` to create Curator and Master Curator accounts.

---

## 🌐 Localization
The portal fully supports English (`/en`), Spanish (`/es`), and French (`/fr`). All routing requires the locale prefix. Translations are stored in `src/messages/`.
