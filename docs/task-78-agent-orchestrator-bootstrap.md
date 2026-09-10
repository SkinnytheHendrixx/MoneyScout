# Milestone #78: Agent Orchestrator Bootstrap

## Objective

Remove the repository owner from routine AI-to-AI engineering relay by making GitHub the durable communication surface between Money Scout engineering agents.

This milestone dogfoods the future Asset Factory operating model on Money Scout itself.

## Phase A: protocol

Completed by the provider-neutral Agent Coordination Protocol:

- GitHub Work Items are durable task contracts.
- Agent handoffs are explicit and machine-readable.
- Exact SHAs, state versions, authority, acceptance, and stop conditions are part of the contract.
- Machine-fixable work returns directly to the relevant machine actor.
- The owner is not a transport layer.

## Phase B: Claude Git executor bootstrap

This milestone adds a bootstrap executor for `builder.claude` / `reviewer.claude` using Anthropic's maintained Claude Code GitHub Action.

Repository-level `CLAUDE.md` instructs Claude to:

- obey `AGENTS.md` and the coordination protocol;
- verify the live task/handoff before acting;
- inspect repository truth;
- implement on short-lived branches rather than `main`;
- run executable verification;
- create/update PRs;
- write `MS_AGENT_MESSAGE v1` handoffs directly to GitHub;
- route implementation-ready work to `reviewer.chatgpt` unless the Work Item says otherwise;
- route bounded repair findings directly to the builder;
- stop for the owner only at a genuine human boundary.

The workflow is intentionally mention-triggered (`@claude`) for bootstrap safety. Ordinary repository activity does not invoke the provider.

## Authentication boundary

Provider credentials are not committed to the repository. The workflow accepts either:

- GitHub Actions secret `ANTHROPIC_API_KEY`; or
- GitHub Actions secret `CLAUDE_CODE_OAUTH_TOKEN`.

Provisioning provider authentication is an inherently human account/credential boundary. Missing auth must fail closed. No credential value may be written to an issue, PR, commit, log, or Agent Work Item.

## Bootstrap acceptance test

After this workflow is merged and provider auth is available:

1. Create an Agent Work Item addressed to `builder.claude` with an exact `main` base SHA and zero external-side-effect authority.
2. Include an `@claude` dispatch instruction in the issue.
3. Claude acquires the work from GitHub without the owner copying a prompt into Claude.
4. Claude inspects the repo, creates a short-lived branch, implements the bounded task, runs verification, and opens a PR.
5. Claude writes an `MS_AGENT_MESSAGE v1` handoff to `reviewer.chatgpt` with the exact head SHA.
6. ChatGPT reads the PR directly from GitHub and reviews it without the owner copying Claude's output.
7. Review defects, if any, are written directly to the PR/issue and routed back to Claude.
8. CI gates acceptance.
9. The owner is contacted only if a genuine human-only boundary is reached.

## Phase C: Money Scout-native orchestration

The GitHub Action is bootstrap transport, not the final architecture.

The target Money Scout-native Agent Orchestrator will:

- observe durable Work Item state/events;
- acquire work idempotently;
- resolve logical actors to provider executors;
- bind execution to state version and exact repository SHA;
- use Money Scout's existing money-safety/provider-run primitives for any metered execution;
- suppress duplicates and stale events;
- persist provider execution identity and reconciliation state;
- route successful results and machine-fixable failures automatically;
- enforce transition/retry ceilings;
- terminate only at DONE, terminal failure, a defined external watch, or a genuine human-only boundary.

The logical protocol must survive replacement of Claude Code Action, OpenAI/Codex, Replit, or any other provider integration.

## Non-goals

- No direct push to `main` by an AI agent.
- No autonomous release, customer charging, advertising, outbound, domain purchase, or other external business authority is granted here.
- No assumption that a database budget or owner subscription makes a metered provider call zero-cost.
- No background invocation of the interactive ChatGPT conversation. The eventual unattended OpenAI role must use an API/repo-native agent executor while preserving the same logical role contract.
