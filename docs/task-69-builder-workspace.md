# Task #69 — Builder Workspace + Coding-Agent Adapter

Status: implementation branch

## Goal
Turn a durable `build_jobs.status = READY_FOR_BUILDER` record into an isolated, durable builder workspace and dispatch the exact persisted Build Contract to an interchangeable coding-agent backend without requiring the owner to press “next.”

## Core invariants

- Money Scout remains provider-agnostic. The application talks to a small Builder Adapter contract rather than hard-coding a specific coding vendor.
- Builder dispatch is idempotent. A crash/restart cannot create multiple coding runs for the same build job.
- A builder workspace is durable and auditable before any external dispatch occurs.
- The persisted Build Contract is the source of truth. The adapter may implement it, but may not expand scope beyond acceptance criteria/non-goals.
- A builder with nonzero external cash cost may not be dispatched while the Build Job external-spend ceiling is zero.
- Missing builder infrastructure becomes a structured company capability blocker, not an ambiguous dead end.
- External publishing, customer charging, domains, production credentials, ads, outreach, and other launch-side effects remain forbidden.
- The adapter reports progress/status back into Money Scout. Builder completion is not product acceptance; it hands into the future QA/debug gate.

## Adapter protocol

Configured by environment. Money Scout sends a normalized `POST /v1/builds` request containing the workspace identity, idempotency key, builder profile, product shape, persisted Build Contract, and autonomy restrictions. The adapter returns a provider run ID and optional repository/workspace metadata. Money Scout polls `GET /v1/builds/{providerRunId}` for progress.

This protocol is intentionally generic so a self-hosted OpenHands bridge, Codex bridge, Replit bridge, or another coding backend can be substituted without changing the Build Orchestrator.

## Task boundary

Task #69 provisions/dispatches and monitors the coding run. It does not decide that generated software is acceptable, publish externally, or run customer-facing launch actions. A successful builder run ends at `QA_PENDING`, which Task #70 will consume.
