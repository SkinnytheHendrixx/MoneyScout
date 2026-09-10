# Money Scout Product Principles

These are non-negotiable product invariants. Code, prompts, workers, UI, and future milestones should preserve them unless the owner explicitly changes the product thesis.

## 1. Money Scout is an internal operating system, not a SaaS product

Money Scout exists to autonomously create and operate businesses for its owner. It is not primarily a product to sell, a subscription app, a generic CRM, or a public AI assistant.

The product is the autonomous portfolio engine itself.

## 2. The objective is return on capital and autonomous capacity

Optimize for economic return on deployed resources, not for:

- number of ideas discovered;
- number of AI calls;
- number of workflows completed;
- number of Assets launched;
- model confidence alone; or
- feature breadth.

Cash, paid APIs, compute, agent time, build time, maintenance burden, support burden, and human approvals all consume capital.

## 3. Autonomy is the default

Money Scout should advance machine-executable work without waiting for the owner between steps.

A workflow may legitimately stop only when it has:

- succeeded;
- failed conclusively;
- entered an explicit WATCH state for a future condition; or
- reached a true human-only boundary.

Routine research, debugging, testing, retries that are provably safe, evidence normalization, code changes, and operational maintenance are not human-only boundaries.

## 4. Human Action is a last-mile authority mechanism, not a substitute for reasoning

The owner should be asked to act only when the system requires something AI cannot legitimately provide, such as:

- identity/KYC/legal ownership;
- account creation or credential granting;
- explicit spending authority;
- irreversible external side-effect authority;
- contractual/legal acceptance;
- true judgment after internal resolution is exhausted.

"I cannot access this directly" does not mean "ask the human." Exhaust public evidence, proxies, connected capabilities, economic inference, adversarial review, safe experiments, and WATCH when applicable.

## 5. Unknown is not zero and absence is not failure

Never convert missing evidence into a negative fact.

Examples:

- no observed revenue without complete telemetry coverage != $0 revenue;
- no exact competitor price != no willingness to pay;
- unavailable provider != failed business thesis;
- no candidate in one bounded Discovery slice != no opportunity in the market;
- missing support telemetry != zero support burden.

Preserve uncertainty explicitly.

## 6. Provenance matters

When the system records economic or market claims, preserve provenance:

- `FACT`
- `CLAIM`
- `INFERENCE`
- `UNKNOWN`

Only authoritative `FACT` observations should affect observed revenue/cost/transaction aggregates.

Never fabricate market size, revenue, customers, pricing, retention, CAC, margins, conversion rates, probability, or provider outcomes.

## 7. Usage is not monetization proof

Traffic, clicks, signups, usage, compliments, demo completion, waitlist entries, and technical success are not proof of willingness to pay.

A real commercial commitment and authoritative payment evidence are different evidence classes from product engagement.

## 8. Pricing may be bounded, but not invented

The system should prefer direct observed pricing evidence. When direct pricing is unavailable, it may derive a defensible range or bounded test hypothesis from:

- paid substitutes;
- buyer budgets;
- labor displacement;
- economic value;
- unit economics;
- procurement behavior; and
- marketplace norms.

Do not invent a precise numeric price simply to unblock a workflow.

Pricing confidence states remain separate from the numeric offer itself.

## 9. Fatal risks are not averaged away

Fatal kill signals should remain separate from factor averages. A strong overall score does not override affirmative evidence of illegality, inaccessible distribution, impossible economics, or other truly fatal blockers.

Likewise, a weak nonfatal factor should not automatically kill an otherwise viable, reversible Bet.

## 10. Prefer falsification over confirmation

Research and Validation should seek the cheapest evidence capable of disproving the thesis, not merely gather supportive evidence.

When uncertainty remains, ask: what is the cheapest reversible experiment that would materially change the decision?

## 11. Authority is granular

No authority silently implies another.

In particular:

- public release != charging;
- merchant capability != charging authority;
- production credentials != charging authority;
- charging != outbound;
- charging != advertising;
- charging != domain purchase;
- charging != external spend;
- a database budget != provider-enforced cost protection.

Authority must be explicit, scoped, durable, and auditable.

## 12. Capability is more than account existence

An account can exist while automation capability is missing, expired, incomplete, unverified, or insufficiently scoped.

Capabilities should capture provider, access level, verification method, status, and expiry/revocation where relevant.

## 13. No blind paid retries

A provider timeout, ambiguous response, runtime restart, or transport error does not authorize Money Scout to repeat a potentially billable action.

Reconcile durable state first. Reuse provider run IDs/idempotency keys. Retry only when the action is provably safe or the provider contract itself guarantees idempotency and cost bounds.

## 14. Hard spend protection must be real

A database field saying `$10 max` does not protect against a provider call that can actually charge $100.

Where external spend is possible, the adapter/provider contract should enforce hard per-call or per-run ceilings. If it cannot, fail closed or use a zero-cash path.

## 15. Independent verification is required for consequential code changes

Builder success is not acceptance.

The intended engineering chain is:

Build -> independent QA -> defects -> targeted repair -> fresh independent retest -> controlled release -> live verification.

Production maintenance should preserve the same principle.

## 16. A live Asset is not automatically a commercially active Asset

An Asset may be publicly reachable but have charging disabled, merchant capability missing, pricing unresolved, or credentials unverified.

That state is valid and should not be mislabeled as business failure.

Commercial activation is a separate lifecycle with separate authority.

## 17. Economic truth should remain append-only and auditable

Authoritative provider events should be persisted idempotently. Later refunds, reversals, disputes, fees, or adjustments should create new factual observations rather than rewriting history to make prior events disappear.

Derived aggregates may change as new facts arrive; source facts remain auditable.

## 18. Maintenance should preserve scope

Autonomous remediation of an existing Asset may repair the approved product within the existing surface and authority contract. It may not use an outage as permission to:

- migrate providers silently;
- launch a new public surface;
- enable charging;
- expand outbound;
- start advertising;
- buy a domain; or
- spend new money.

## 19. The UI is a control center, not a data dump

The default operator view should answer quickly:

- what is this;
- why might it make money;
- what state is it in;
- what is Money Scout doing now;
- what are the measured economics;
- what is the biggest risk/blocker;
- what changed; and
- what happens next.

Deep research, evidence, audit history, and diagnostics belong behind drill-down.

## 20. The portfolio eventually closes the learning loop

Money Scout is incomplete if it can only launch businesses.

Real post-launch outcomes should eventually update:

- whether to continue/improve/scale/pause/kill an Asset;
- how much capital to allocate next;
- which opportunity patterns deserve higher/lower priority;
- which evidence signals are actually predictive; and
- which build/distribution/monetization patterns work repeatedly.

The end state is an autonomous capital-allocation system, not an autonomous app factory.
