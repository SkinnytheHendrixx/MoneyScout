---
name: Agent Work Item
about: Durable autonomous work contract for Money Scout agents
title: "[AGENT] "
labels: []
assignees: []
---

## Agent Work Envelope

- work_id: pending-issue-number
- kind: implementation
- requested_by: owner.jesse
- current_actor: architect.chatgpt
- status: READY
- state_version: 1
- base_sha: <exact-main-sha>
- head_sha: null
- authority: repository-analysis-only
- cash_ceiling: 0

## Objective

State the observable outcome this work item must produce.

## Context

Link the relevant product definition, milestone docs, architecture, prior issues/PRs, and implementation evidence.

## Acceptance

- [ ] Observable criterion 1
- [ ] Observable criterion 2
- [ ] Required tests/CI are green
- [ ] Documentation/state is updated when architecture or live behavior changed

## Constraints

List authority, product, capital, security, compatibility, and scope constraints that must not be silently widened.

## Stop Conditions

Only genuine human-only boundaries, terminal failure conditions, or explicitly defined external waits belong here.

## Handoff History

Append agent handoffs as comments using `MS_AGENT_MESSAGE v1`. Do not use the owner as a transport layer between agents.
