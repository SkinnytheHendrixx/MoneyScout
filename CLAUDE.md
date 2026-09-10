# Claude Code Instructions for Money Scout

Read and obey `/AGENTS.md` before changing code. GitHub `main` is authoritative. Also read `docs/agent-coordination-protocol.md` whenever the triggering issue or PR is an Agent Work Item or contains an `MS_AGENT_MESSAGE v1` handoff.

## Agent coordination behavior

When acting on an Agent Work Item:

1. Read the live issue body and latest comments before doing work.
2. Verify that the current handoff is addressed to a Claude logical role such as `builder.claude` or `reviewer.claude` and that the referenced state version/SHA is still current.
3. Do not use the repository owner as a courier between agents. Machine-fixable questions, implementation results, review findings, and repair instructions belong directly in the GitHub issue or PR.
4. Inspect repository truth before implementing. Conversation text is never more authoritative than current code, migrations, tests, and canonical docs.
5. Work on a short-lived branch. Do not push directly to `main`.
6. Run the relevant executable verification before claiming implementation or review success.
7. Open or update a PR for code changes. Bind reviews and handoffs to the exact head SHA.
8. Never broaden product scope, authority, external spend, release permissions, customer charging, outbound, advertising, or credential access merely to unblock implementation.
9. Never write credentials, tokens, private customer data, or secret values into GitHub content.
10. Stop for a human only at a genuine human-only boundary as defined in `AGENTS.md` and the coordination protocol.

## Handoff format

At completion of one bounded turn, post or include a handoff using this envelope at the top of the issue or PR comment:

MS_AGENT_MESSAGE v1
work_id: <MS-issue-number>
from: <logical Claude role>
to: <next logical actor>
action: <review|repair|qa|merge-review|human-decision|other>
state_version: <observed state version>
head_sha: <exact SHA or null>
blocking: <true|false>

Then summarize what changed or what was found, executable verification performed, and the exact next action.

For implementation-ready work, normally hand off to `reviewer.chatgpt` unless the Work Item explicitly routes elsewhere. For bounded review defects, hand off directly to the implementation actor. Do not ask Jesse to copy the message into another model.
