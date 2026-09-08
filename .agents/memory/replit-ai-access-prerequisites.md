---
name: Replit AI access prerequisites
description: Account and workspace prerequisites for Replit-managed AI Integrations
---

Replit-managed AI Integrations require a paid Replit plan; Starter/free workspaces have managed AI integrations disabled. Pro and Enterprise workspaces may also require an organization administrator to enable AI Integrations.

**Why:** A configured `AI_INTEGRATIONS_ANTHROPIC_*` environment pair can still receive provider-side authorization rejection when the account or workspace is not eligible.

**How to apply:** For `ApiKeyNotApproved` from the managed Anthropic proxy, check plan and organization-level AI Integrations access before changing application code, secrets, deployment, or OAuth connections.