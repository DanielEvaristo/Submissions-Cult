# Implementation Plan: Premium PR Refactor & Report a Bug Feature

The goal is to implement two major changes:
1. **Premium PR Request Flow:** Change the Premium PR (Article/Interview) feature from an upfront add-on available to everyone in the public form to a gated request that requires approval and is paid post-approval.
2. **Report a Bug:** Allow users to report bugs from anywhere in the app, and allow admins to review these reports.

## User Review Required

> [!IMPORTANT]
> Please review the open questions below. I need your confirmation on how we should handle the "Industry" user accounts for the Premium PR flow before I start modifying the database.

## Open Questions

1.  **Industry Users (Premium PR)**: Currently, Industry users automatically qualify for Premium PR options regardless of their follower counts. Should this remain true, or do the artists they represent (Managed Artists) also need to meet the 10k follower/listener requirement? (Assuming auto-qualify for now).
2.  **Dashboard Form (Premium PR)**: The `SubmitFlowV2` component is used for both the public `/submit-now` page and the dashboard `/portal/submit` page. Should the follower checks be based on the logged-in User's profile, or on Spotify/Instagram API data fetched dynamically? (Assuming it uses the user's saved profile data: `monthlyListeners` and `instagramFollowers`).
3.  **Bug Reports**: Should Bug Reports be restricted to logged-in users, or can anyone (including anonymous users on the landing page) report a bug? (Assuming logged-in users only for now, to prevent spam).

## Proposed Changes

### Feature 1: Premium PR Refactor

#### [MODIFY] schema.prisma
- Add a new enum `PremiumPrStatus`: `NONE`, `REQUESTED`, `APPROVED`, `PAID`, `REJECTED`.
- Add `premiumPrStatus PremiumPrStatus @default(NONE)` to the `Submission` model.
- Add `premiumPaymentLink String?` to the `Submission` model.

#### [MODIFY] `src/app/api/submissions/route.ts` & `src/app/api/submissions/anonymous/route.ts`
- Ensure that `premiumServices` are ignored or reset if the user doesn't meet the criteria (or if they are anonymous).
- If `premiumServices` array is not empty, set `premiumPrStatus` to `REQUESTED`.

#### [MODIFY] `src/app/api/checkout/route.ts`
- Remove the logic that adds the $30 (Interview) and $25 (Article) to the initial Stripe checkout.

#### [NEW] `src/app/api/admin/premium-pr/[id]/route.ts`
- Endpoint for Admins/Master Curators to approve/reject a Premium PR request.
- Generate a Stripe Payment Link when approved. Update `premiumPrStatus` to `APPROVED`.

#### [MODIFY] `src/app/api/webhooks/stripe/route.ts`
- Handle successful payments for Premium PR requests, updating status to `PAID`.

#### [MODIFY] `src/components/submit/SubmitFlowV2.tsx`
- Only show Step 5 (Premium Services) if user is logged in AND meets the 10k criteria.
- Update descriptive text: Clarify it's a request, cost is for labor/time ("mano de obra"), not payola, and payment is due if approved.
- Remove dollar amounts from Checkout Summary, replace with "(To be paid if approved)".

#### [MODIFY] `src/app/[locale]/portal/submissions/page.tsx`
- Display Premium PR status. Show a "Pay" button if `APPROVED`.

#### [MODIFY] Admin & Curator Submissions Views
- Add visual indicators for requested Premium PRs.
- Add UI buttons to "Approve" or "Reject" the request.

---

### Feature 2: Report a Bug

#### [MODIFY] schema.prisma
- Add `BugReport` model:
  ```prisma
  model BugReport {
    id          String   @id @default(cuid())
    userId      String?
    user        User?    @relation(fields: [userId], references: [id])
    description String   @db.Text
    url         String?  // The URL where the bug occurred
    status      String   @default("OPEN") // OPEN, IN_PROGRESS, RESOLVED, CLOSED
    createdAt   DateTime @default(now())
    adminNotes  String?  @db.Text
  }
  ```

#### [NEW] `src/app/api/bugs/route.ts`
- `POST`: Create a new bug report.
- `GET` (Admin only): Fetch bug reports.

#### [NEW] `src/app/api/admin/bugs/[id]/route.ts`
- `PATCH`: Update bug report status or add admin notes.

#### [NEW] `src/components/ui/BugReportModal.tsx`
- A floating "Report a Bug" button (e.g., in the portal layout or a fixed bottom-right button) that opens a modal.
- The modal allows the user to describe the issue.

#### [NEW] `src/app/[locale]/admin/bugs/page.tsx`
- An admin dashboard view to list all reported bugs, view details, and change their status.

#### [MODIFY] `src/components/admin/AdminNav.tsx` & `src/components/curator/CuratorNav.tsx`
- Add "Bug Reports" link to the sidebar navigation.

## Verification Plan

### Manual Verification
1.  Verify the Premium PR flow works as defined (request -> approve -> pay).
2.  Verify the "Report a Bug" modal opens and successfully submits a bug.
3.  Verify the Admin can see the submitted bugs in the new `/admin/bugs` page.
