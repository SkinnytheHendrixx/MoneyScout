# Money Scout Evidence Architecture

Status: canonical architecture alignment after Task #40. This document maps the implemented pipeline to the evidence Money Scout needs before adding validation evidence workers. It is an architecture contract, not empirical calibration.

## Objective

Money Scout buys capital-efficient experiments, not narratives. The pipeline must keep three questions distinct:

1. **Opportunity quality:** Is there credible demand, monetization, competitive vulnerability, distribution access, and durability?
2. **Bet economics:** What capital and operating exposure must be risked before useful evidence arrives?
3. **Uncertainty resolution:** How cheaply and quickly can the thesis be falsified, and how reversible is the bet?

A candidate may be a good opportunity but a poor bet. A modest opportunity may be an excellent bet when it is cheap, fast, reversible, and informative.

## Canonical decision sequence

`DISCOVERY -> TRIAGE -> KILL_SCREEN -> INVESTIGATION -> UNDERWRITING -> EXPERIMENT -> BUILD_READY | WATCH | REJECT`

The existing product states remain valid. These names describe decision responsibilities rather than requiring a database-state migration.

### Discovery

Implemented Discovery telemetry finds quantitative smoke. It must not treat usage as proof of willingness to pay. Partial observed slices must remain explicitly scoped and must not be promoted to whole-market claims.

### Triage

Before paid research, test whether the signal is an artifact: free/subsidized or official distribution, tiny-base growth, temporary spikes, testing usage, or other observable confounds. Triage should use existing evidence first and spend nothing externally where possible.

### Kill screen

Fatal risks must be evaluated before expensive investigation. Canonical kill classes:

- `NO_MONETIZATION_PATH`
- `PLATFORM_OWNER_THREAT`
- `LEGAL_OR_COMPLIANCE_BLOCK`
- `UNSTABLE_DEPENDENCY_MAINTENANCE_SINK`
- `ECONOMICALLY_INACCESSIBLE_DISTRIBUTION`
- `NETWORK_EFFECT_LOCK_IN`

A confirmed fatal kill cannot be offset by high scores elsewhere.

The existing Policy Check covers part of legal/platform policy risk, but it does not by itself cover all six kill classes. Do not interpret `policyStatus=GREEN` as a complete kill-screen pass.

### Investigation

Buy the highest-information evidence that could change the decision, cheapest first. Priority evidence families:

- surviving paid competitors and actual published prices
- paid human/manual substitutes, job postings, freelancer gigs, agency services
- recurring demand evidence and demand trajectory
- complaints, reviews, issues, incumbent reliability/freshness
- distribution accessibility and switching friction
- platform/dependency durability

The existing Demand Check is useful but is not synonymous with complete investigation or willingness-to-pay validation.

### Underwriting

Keep opportunity quality separate from bet economics and uncertainty resolution. Underwriting must eventually record:

- validation cost
- estimated build cost
- expected operating/maintenance exposure until useful evidence
- shutdown/irreversibility cost
- time to launch
- expected time to first usage signal
- expected time to first monetary signal
- reversibility
- reusable infrastructure/learning value

`CARE` (capital at risk until evidence) is a useful legible quantity, but its formula and tier thresholds are not calibrated production truth yet.

### Experiment

Choose the cheapest falsifying action that can plausibly change build/no-build. Examples include competitor-pricing inspection, complaint analysis, a fake door, a narrow paid beta, or publishing a minimal Actor. Numerical go/no-go thresholds must be calibrated from Money Scout's own experiments before becoming canonical.

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

Important invariant: public usage is not willingness to pay. Surviving paid supply and paid substitutes are stronger public monetary evidence; actual payment to us is stronger still.

## Validation evidence profile

Task #40's eight dimensions remain useful but are not the whole architecture. They map as follows:

| Existing dimension | Canonical interpretation | Required additions / caution |
| --- | --- | --- |
| `buyer_clarity` | Opportunity quality | identify reachable buyer, not merely persona prose |
| `problem_strength` | Opportunity quality | distinguish pain from attention/usage |
| `willingness_to_pay` | Opportunity quality | require monetary-rung evidence; usage alone is invalid |
| `distribution` | Opportunity quality + kill screen | include realistic reach/CAC and switching friction |
| `competitive_gap` | Opportunity quality | explain why gap exists; low competition alone is not positive |
| `build_feasibility` | Bet economics | include dependency/technical uncertainty |
| `unit_economics` | Bet economics | include platform fees and operating exposure; estimates stay labeled |
| `automation_fit` | Bet economics | include ongoing human/support burden, not just build automation |

Cross-cutting evidence that must be explicit rather than hidden inside an additive score:

- demand trajectory / recurrence
- platform-owner threat
- legal/compliance block
- maintenance/dependency exposure
- monetization-path evidence quality
- distribution accessibility
- time-to-feedback
- cost-to-falsify
- reversibility
- evidence confidence/provenance

## Scoring contract

Task #40's numeric thresholds are provisional guardrails, not empirically validated economics. Evidence workers must not make them appear more certain than they are.

Future decision logic should preserve these invariants:

1. Fatal kill gates are conditional vetoes and cannot be averaged away.
2. Opportunity quality, bet economics, and uncertainty resolution remain separately legible.
3. Confidence/provenance attaches to every material inference.
4. Unknown is not zero and is not evidence against a thesis.
5. Estimates are labeled as estimates.
6. No inferred revenue, paid-customer count, retention, churn, or profitability is stored as observed fact.
7. A single additive score must not be the sole build decision.
8. Portfolio ranking happens only after an individual bet clears its required evidence hurdle.

## What the current implementation already gets right

- Discovery is separated from deeper research and does not equate a candidate with a business.
- Partial-slice safeguards prevent unsupported whole-market claims.
- Research is bounded by external-service cost ceilings.
- Policy runs before Demand, reducing spend on obviously blocked opportunities.
- Ambiguous policy and weak/unknown demand do not trigger automatic paid retry loops.
- Validation requires prior `TEST`, GREEN policy, and SUPPORTED demand.
- Validation tracks missing evidence and contradictions rather than allowing incomplete evidence to become `BUILD_READY`.

## Gaps to fill next

Task #42 evidence workers should be designed around evidence families, not around generating prose for eight score fields. At minimum they must be able to produce structured, sourced evidence for:

1. monetary evidence: paid competitors/prices and paid human/manual substitutes
2. demand quality: recurrence, trajectory, pain, and false-positive checks
3. competitive beatability: incumbent quality, reliability, freshness, switching friction, and why the gap exists
4. kill risks: all six canonical kill classes
5. distribution: where buyers are reached and whether acquisition is economically plausible
6. build/operations: technical complexity, external dependencies, maintenance/support burden
7. economics: platform fees, variable costs, plausible price range, margin uncertainty
8. uncertainty resolution: cheapest falsifying test, cost, time-to-feedback, reversibility

Every evidence record should carry source/provenance, observation vs inference, confidence, timestamp/freshness where relevant, and the decision(s) it can change.

## Deliberately not canonical yet

Do not hard-code the following solely from external research:

- fixed CARE dollar tiers
- fake-door percentage thresholds
- assumed probability of success
- a Kelly allocation formula
- a multiplicative BetScore formula
- revenue estimates from public usage
- fixed maintenance-cost assumptions
- fixed evidence-count thresholds as economic truth

These are hypotheses to calibrate using Money Scout's own portfolio history.

## Next implementation task

**Task #42: Evidence Workers.** Build structured evidence collectors/evaluators against this contract, beginning with zero/low-cost evidence and fatal kill checks, then monetary evidence, then the remaining validation and underwriting evidence. Do not yet implement autonomous product building or uncalibrated portfolio allocation.