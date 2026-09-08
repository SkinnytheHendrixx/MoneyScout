---
name: Money Scout auth allowlist
description: The private app separates verified Replit identity from explicit access approval.
---

Money Scout must use Replit Auth for identity and sessions, then authorize with a separate allowlist of stable authenticated user IDs. Missing or empty allowlists fail closed; email and profile fields are not authorization keys.

**Why:** The app is private, and provider profile fields can change or be absent while the verified subject identifier remains stable.

**How to apply:** Keep `MONEY_SCOUT_ALLOWED_USER_IDS` outside source control through environment configuration or Secrets. Return `401` without a session and `403` for an authenticated user who is not allowlisted.