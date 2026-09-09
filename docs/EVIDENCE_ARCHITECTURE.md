# Money Scout Evidence Architecture

Status: canonical architecture after Task #46. This is an architecture contract, not empirical calibration.

## Objective

Money Scout buys capital-efficient experiments, not narratives. Keep three questions distinct:

1. **Opportunity quality:** is there credible demand, monetization, competitive vulnerability, distribution access, adoption feasibility, and enough reachable economic headroom?
2. **Bet economics:** what build, operating, unit-economic, and capital exposure must be accepted before useful evidence arrives?
3. **Uncertainty resolution:** how cheaply and quickly can the thesis be falsified or confirmed?

A candidate can be a good opportunity but a poor bet. A modest opportunity can be an excellent bet when it is cheap, fast, reversible, and informative.

## Canonical decision sequence

`DISCOVERY -> TRIAGE -> KILL_SCREEN -> INVESTIGATION -> UNDERWRITING -> EXPERIMENT -> BUILD_READY | WATCH | REJECT`

The product states do not have to mirror every responsibility above.

## Discovery and triage

Discovery finds quantitative smoke. It must not treat usage as willingness to pay. Partial observed slices remain explicitly scoped and cannot be promoted into whole-market claims.

Before deeper paid research, triage likely artifacts such as free/subsidized or official distribution, tiny-base growth, temporary spikes, seasonality, testing traffic, or other observable confounds.

## Fatal kill screen

Fatal risks are vetoes, not weighted factors:

- `NO_MONETIZATION_PATH`
- `PLATFORM_OWNER_THREAT`
- `LEGAL_OR_COMPLIANCE_BLOCK`
- `UNSTABLE_DEPENDENCY_MAINTENANCE_SINK`
- `ECONOMICALLY_INACCESSIBLE_DISTRIBUTION`
- `NETWORK_EFFECT_LOCK_IN`

A confirmed fatal kill cannot be averaged away by strengths elsewhere. `policyStatus=GREEN` covers only the scope evaluated by Policy Check and is not equivalent to a complete kill-screen pass.

## Evidence ladder

Evidence must never be promoted above what it proves:

1. attention
2. interest
3. usage
4. repeat usage
5. pain/problem evidence
6. unmet demand
7. purchase intent
8. willingness-to-pay evidence
9. actual spending on our product
10. retention
11. attractive unit economics
12. sustainable profitability

Public usage is not willingness to pay. Surviving paid supply and paid substitutes are stronger public monetary evidence. Actual payment to us is stronger still.

## Canonical underwriting factors

### Opportunity quality

1. **Buyer & Budget Clarity**: who experiences the problem, who pays, and what economic motive or budget supports purchase?
2. **Problem Intensity & Recurrence**: is the problem painful and frequent enough to sustain continuing demand?
3. **Demand Trajectory & Durability**: is demand persistent or improving rather than a temporary spike, tiny-base artifact, subsidy, seasonality, or platform event?
4. **Monetization Proof & Price Tolerance**: what source-backed evidence shows buyers exchange money for solving this problem, and at what plausible price range?
5. **Competitive Beatability & Gap Quality**: why can an entrant win, and why does the apparent gap exist? Low competition alone is not positive evidence.
6. **Distribution Accessibility & Acquisition Economics**: can buyers be reached repeatedly through a realistic channel at economically plausible acquisition cost?
7. **Adoption & Switching Friction**: how difficult is onboarding, migration, procurement, trust formation, integration, data portability, workflow change, or multihoming?
8. **Economic Headroom**: how much realistic dollar opportunity can flow through the reachable wedge? Do not substitute broad TAM narratives.

### Bet economics

9. **Build Complexity & Technical Uncertainty**: how difficult is a credible minimum product, including integrations, dependencies, testing, reliability, and unknowns?
10. **Operating & Maintenance Burden**: what ongoing breakage, support, intervention, refresh, moderation, incident, or dependency burden follows launch?
11. **Unit Economics & Pricing Power**: at plausible prices, do variable costs, platform fees, support, refunds, and acquisition economics leave attractive contribution economics?
12. **Capital at Risk & Reversibility**: how much capital and effort are committed before useful evidence arrives, and how much can be recovered or reused if the thesis fails?

### Uncertainty resolution

13. **Falsifiability & Feedback Velocity**: how cheaply and quickly can reality prove the thesis wrong or right?

`automation_fit` is deliberately not a standalone factor. Automation matters through build complexity, ongoing operating burden, unit economics, and required human intervention. A highly automated fragile product can be a poor bet; a lightly manual high-margin product can be an excellent one.

## Evidence quality overlay

Every factor carries evidence quality independently from its economic strength. Do not blend the two into one number.

At minimum record:

- confidence
- directness
- source authority
- source independence
- recency
- sample adequacy
- consistency/contradiction
- strongest classification: `FACT`, `CLAIM`, `INFERENCE`, or `UNKNOWN`
- evidence count

This allows states such as `STRONG thesis / LOW evidence confidence`, which means the economics would be attractive if the supporting evidence were trustworthy, but more validation is required.

## Decision contract

The underwriting engine does not average the thirteen factors.

1. Fatal gates are evaluated first and cannot be offset.
2. Research prerequisites must be satisfied before underwriting can yield `BUILD_READY`.
3. Missing or `UNKNOWN` factors produce `NEEDS_MORE_VALIDATION`, not zero scores.
4. Low/unknown-confidence evidence produces `NEEDS_MORE_VALIDATION` rather than false precision.
5. A source-backed `BLOCKING` factor produces `REJECT`.
6. A source-backed `WEAK` factor produces `WATCH` when no fatal blocker exists.
7. `BUILD_READY` requires every factor to be at least `ADEQUATE` on medium-or-higher-confidence evidence and the fatal kill screen to be `CLEAR`.
8. No single additive score is the sole build decision.
9. Portfolio ranking happens only after an individual bet clears its evidence hurdle.

These are structural rules, not empirically calibrated monetary thresholds.

## Investigation priorities

Buy the highest-information evidence that could change the decision, cheapest first. Useful evidence families include:

- surviving paid competitors, actual published prices, and customer/payment signals
- paid human/manual substitutes, budgeted jobs, freelancer gigs, and agency services
- recurring demand evidence and trajectory
- complaints, reviews, issues, incumbent reliability and freshness
- distribution accessibility and switching friction
- platform/dependency durability
- technical build dependencies and maintenance burden
- variable costs, platform fees, support burden, and plausible pricing
- the cheapest falsifying experiment, expected cost, time-to-feedback, and reversibility

Every material evidence record should carry source/provenance, observation vs inference, confidence, timestamp/freshness where relevant, and the decisions it can change.

## CARE and experiment economics

`CARE` means capital at risk until evidence. The concept is useful and should remain legible, but fixed CARE dollar tiers are not production truth until Money Scout has enough portfolio history to calibrate them.

Likewise, fake-door conversion thresholds, assumed success probabilities, Kelly allocation, multiplicative BetScores, fixed maintenance assumptions, and public-usage-derived revenue estimates must not be hard-coded merely because an external framework proposes them.

## What the implementation already gets right

- Discovery is separated from business validation.
- Partial-slice safeguards prevent unsupported whole-market claims.
- Research is bounded by external-service cost ceilings.
- Policy, Demand, and fatal kill-risk collection run in a bounded sequence.
- Ambiguous evidence does not trigger indefinite paid retry loops.
- Fatal risks are vetoes rather than weighted scores.
- Evidence workers preserve `UNKNOWN` instead of converting missing evidence into a pass.
- Validation requires prior Research clearance and a clear kill screen.

## Next implementation task

Build validation evidence collectors against these thirteen factors and the evidence-quality overlay. Collect evidence families first, then map source-backed evidence into factor assessments. Do not ask an LLM to manufacture thirteen scores from prose, and do not implement autonomous product building or uncalibrated portfolio allocation yet.
