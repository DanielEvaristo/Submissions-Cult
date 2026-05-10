# Cult Machine - Submissions Portal

Welcome to the Cult Machine Submissions Portal. This application is completely independent of the main WordPress site and is designed to handle music submissions from artists and industry agencies.

## Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Prisma ORM)
- **Auth**: NextAuth.js (Credentials + JWT)
- **i18n**: next-intl (English, Spanish, French)

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
- Node.js 18+
- Docker (for PostgreSQL)

### Local Development
1. Start the database:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```
2. Apply migrations:
   ```bash
   npm run db:push
   ```
   *(Note: if `npm run db:push` fails, run `$env:DATABASE_URL="postgresql://cm_user:devpassword@localhost:5432/cm_submissions"; npx prisma db push`)*
3. Run the development server:
   ```bash
   npm run dev
   ```

### Default Accounts
*(These can be changed in the DB, but usually we register from the UI)*
- Go to `/en/register` to create a new Artist or Industry account.
- To create an Admin, register an account, then manually set `isAdmin: true` in your database.
- Once you are Admin, go to `/en/admin/staff` to create Curator and Master Curator accounts.

---

## 🌐 Localization
The portal fully supports English (`/en`), Spanish (`/es`), and French (`/fr`). All routing requires the locale prefix. Translations are stored in `src/messages/`.
