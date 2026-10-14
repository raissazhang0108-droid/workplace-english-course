# Email Accounts and Homepage Polish

## Goal

Make the global-workplace homepage title more prominent, slightly increase the interview/meeting card color panels, and let learners optionally create an email-and-password account to sync quiz history and course completion across devices.

## Approved UX

- Increase “科技大厂全球化职场英语实战” from 24px to 29px.
- Increase the interview and meeting colored preview areas from 132px to 150px.
- Replace the static top-right learner badge with a “登录 / 注册” entry. Open one modal with Login and Register tabs; successful authentication returns to the same page.
- Keep all learning available to guests.
- Do not add email verification or password recovery in this release because no mail service is configured.

## Backend and Data

Use the existing FastAPI and SQLite backend. Add normalized, case-insensitive unique email accounts; require passwords of at least eight characters and hash them with salted PBKDF2-HMAC-SHA256 using at least 600,000 iterations. Issue random opaque sessions in `HttpOnly`, `SameSite=Lax` cookies, with `Secure` enabled in production and a fixed 14-day expiration. Store only a digest of each session token. Provide register, login, current-user, logout, quiz-history, and course-completion operations.

Authenticated APIs derive the owner from the validated session, never from a client-supplied user ID. Preserve guest access and existing anonymous quiz history. On first registration/login, claim only the current browser's random anonymous learner ID and merge its quiz attempts and local completed-course flags into account progress. Make the claim idempotent; retain the existing latest-ten quiz-history limit. Merge completion flags without clearing completed work. Logout returns the learner to guest behavior without deleting local progress.

Validate same-origin requests for cookie-authenticated mutations to prevent cross-site request forgery. Return generic credential errors on login, explicit email conflict and input-validation errors on registration, and a clear unauthenticated response for expired or missing sessions. Do not expose password hashes or session tokens in responses. No password reset is provided until an email delivery service is configured.

## Verification

- Backend tests cover registration, normalized duplicate emails, password hashing, login failure, session cookie flags/expiry, current-user and logout behavior, account isolation, quiz-history ownership, and idempotent migration of anonymous data.
- Frontend tests cover the larger title and color panels, modal login/register switching, validation/error/success states, guest access, logout, and cross-device account progress loading.
- Run the full frontend and backend test suites and production frontend build.
