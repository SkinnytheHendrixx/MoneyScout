# Phase F F7 — Final Mixed-History Cross-Cluster Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** F — Representability and Multiplicity / F7 Cross-Surface Integrity  
**Purpose:** final cross-cluster mixed-history attack before Phase-F synthesis  
**Implementation authority:** SUSPENDED

## 1. Standing register entering this pass

Six individual Phase-F surfaces are certified FAIL/OPEN:

- R19 / F5;
- R20 / F6;
- R9 / F1;
- R10 / F2;
- R17 / F3;
- R18 / F4.

Four F7 relationship clusters are certified FAIL/OPEN.

### Confirmed numbered F7 defects — 16 total

Batch 01:

- F07-01 — R6 Verification Result ↔ R18 Binding;
- F07-03 — R18 Binding/Validation ↔ R20 Decision;
- F07-04 — R17 Offer/Grant ↔ R18 commercial-payment Binding;
- F07-05 — R18 Binding ↔ R19 Lineage;
- F07-06 — one execution ↔ multiple exact R18 bindings.

Batch 02:

- F07-07 — R10 Artifact Version/Release ↔ R17 Offer Version;
- F07-08 — R17 Offer/Grant ↔ R19 Lineage;
- F07-09 — R17 Offer/Grant ↔ R20 Decision.

Batch 03:

- F07-10 — R9 Build Source Snapshot ↔ R10 Artifact Version;
- F07-11 — R10 Artifact Version ↔ exact QA Result;
- F07-12 — production Artifact/Release ↔ Asset adoption identity.

Batch 04:

- F07-13 — R2 Capability Resolution Outcome ↔ R7 Economic Action/reservation set;
- F07-14 — R12 occurrence ↔ R13 exact executor/service-path health result;
- F07-15 — R3 freshness/current-applicability result ↔ R20 Decision predicate;
- F07-16 — R7 reservation/execution ↔ R15/R16 financial result;
- F07-17 — R15 exact evidence set ↔ R16 canonical reconciliation result.

### Duplicate scenarios intentionally not separately counted

These remain mandatory tests under their existing owners:

1. execution ↔ exact R18 Binding — F06-02 already constitutes the whole relationship; draft F07-02 withdrawn;
2. exact R17 Offer Version ↔ CUSTOMER_CHARGING Grant — F05-03 constitutes the relationship;
3. exact QA-bound Artifact ↔ exact Release execution — F04-02 constitutes the relationship.

The full mixed-history attack must exercise these scenarios even though they do not receive new F7 numbers.

## 2. Governing anti-inflation rule

This pass is governed by `PHASE_F_F7_COUNTING_RULE_REFINEMENT_1.md`, Tests A–E.

A new cross-cluster finding may be opened only if the compound attack exposes an independently wireable persisted relationship, membership, retrieval, or temporal identity invariant that:

1. is not the constitutive purpose of an existing endpoint finding;
2. is not already one of F07-01 through F07-17;
3. is not merely a compound manifestation of two or more existing findings;
4. could remain wrong after every currently relevant endpoint and F7 finding were individually remediated correctly;
5. has affirmative current representability evidence establishing DEFECT, or sufficient uncertainty to justify UNRESOLVED.

A compound fixture combining existing failures does not earn another number merely because the combined scenario is severe.

## 3. Attack family M1 — source → artifact → QA → release → Asset → Offer → lineage → decision

Create two legitimate historical chains for one logical product lineage:

- Chain A: `S1 → P1 → Q1 → RL1 → A1 → O1/G1 → L1 → D1`;
- Chain B: `S2 → P2 → Q2 → RL2 → A2 → O2/G2 → L2 → D2`.

Where applicable, both chains share superficial parent attributes such as Opportunity, Product family, Asset lineage, repository, provider, or logical commercial capability while remaining historically distinct.

### Required affirmative control

Every direct and embedded identity agrees within each chain:

- S1 belongs to P1; S2 belongs to P2;
- Q1 tested P1; Q2 tested P2;
- RL1 deploys the exact artifact authorized by Q1; RL2 deploys the exact artifact authorized by Q2;
- A1 records P1/RL1 as the exact adopted production state; A2 records P2/RL2;
- O1/G1 binds P1/RL1; O2/G2 binds P2/RL2;
- L1 embeds the same O1/G1 and upstream source/artifact chain; L2 embeds O2/G2;
- D1 consumes the exact historical commercial authority represented by Chain A; D2 consumes Chain B.

### Deliberate substitutions

Reject at minimum:

1. `S1 → P2` and `S2 → P1` — F07-10;
2. `P1 → Q2` and `P2 → Q1` — F07-11;
3. Q1 authority reused while Release dispatches P2 — F04-02 duplicate scenario;
4. `P1/RL1 → A2` or `P2/RL2 → A1` — F07-12;
5. `P1/RL1 → O2` or `P2/RL2 → O1` — F07-07;
6. O1 wired to G2 or O2 wired to G1 — F05-03 duplicate scenario;
7. `O1/G1 → L2` or `O2/G2 → L1` — F07-08;
8. `O1/G1 → D2` or `O2/G2 → D1` — F07-09;
9. direct R9/R10 fields inside L disagree with the source/artifact embedded through O — exercise Phase-C C12-02/C13-03 plus F07-08;
10. current/latest repository, QA, Release, Asset, Offer, lineage, or decision lookup silently rewrites any historical edge.

### Coverage

M1 directly exercises F07-07 through F07-12 plus F04-02/F05-03 duplicate controls and the R9/R10/R17/R19/R20 hard-chain lineage discipline.

## 4. Attack family M2 — commercial authority ↔ capability binding ↔ lineage ↔ decision

Create two legitimate commercial authority paths:

- Chain A: `O1/G1` requires exact R18 binding set `BA = {Bpay-A1, Bcred-A1}` validated by exact R6 results and used by exact execution XA;
- Chain B: `O2/G2` requires binding set `BB = {Bpay-A2, Bcred-A2}` and exact execution XB.

Provider family may be the same while account/binding versions differ.

### Required affirmative control

- each R18 binding references the exact qualifying R6 result/version;
- XA is attached to its exact required binding set BA;
- XB is attached to BB;
- O1/G1 commercial authority consumes the exact payment/account binding intended for Chain A;
- O2/G2 consumes Chain B;
- L1 preserves BA; L2 preserves BB;
- D1 consumes the exact validated Chain-A bindings; D2 consumes Chain-B bindings.

### Deliberate substitutions

Reject at minimum:

1. R6 result V1 attached to binding B2 — F07-01;
2. XA reads current binding B2 instead of its own B1 — F06-02 duplicate execution↔binding scenario;
3. XA retains only one scalar binding while two simultaneous bindings are required — F07-06;
4. XA's binding set includes one member from BA and one from BB — F07-06 set-mixing attack;
5. `O1/G1 → BB` or `O2/G2 → BA` — F07-04;
6. `BA → L2` or `BB → L1` — F07-05;
7. validated BA consumed by D2 or validated BB consumed by D1 — F07-03;
8. provider-family equality used to substitute account A2 for A1;
9. current capability row or current configured driver used instead of frozen historical binding.

### Coverage

M2 directly exercises F07-01, F07-03, F07-04, F07-05, F07-06 and the withdrawn F07-02 scenario under F06-02.

## 5. Attack family M3 — R2 resolution → R7 reservation/execution → R15 evidence set → R16 reconciliation → R20 consumption

Create two economic/execution histories:

- Chain A: R2 outcome Q1 → R7 E1/RS1 under provider/account A/A1 → R15 evidence set S1 → R16 result C1;
- Chain B: R2 outcome Q2 → R7 E2/RS2 under provider/account A/A2 → R15 evidence set S2 → R16 result C2.

Q1/Q2 may concern the same high-level action intent while materially changing path, account, resource vector, or dependency semantics.

### Required affirmative control

- Q1 binds RS1 and its exact derived reservation vector; Q2 binds RS2;
- provider observations for E1/A1 remain attributable to E1 and observations for E2/A2 to E2;
- C1 durably identifies exact evidence membership S1 and policy version; C2 identifies S2;
- R7 release/settlement for E1 consumes only C1 where exact execution/provider/account/reservation-member equality passes;
- later durable evidence E3 creates a governed successor evidence set/result rather than silently mutating C1's historical membership;
- any R20 boundary consuming financial truth consumes the exact current-enough result required for that action without rewriting historical C1/C2 provenance.

### Deliberate substitutions

Reject at minimum:

1. Q2 silently reuses RS1 — F07-13;
2. valid F2/C2 for E2 settles/releases E1 because amount/provider family/currency match — F07-16;
3. same provider but account A2 financial result substitutes for A1 — F07-16;
4. C1 claimed current after already-durable E3 exists but E3 is absent from its identified set — F07-17;
5. duplicate delivery of one provider event becomes duplicate economic effect — F07-17/R16 dedupe control;
6. distinct event E3 collapses merely because amount/time resembles E2 — F07-17;
7. later R16 policy/result rewrites which evidence set/policy governed an earlier R7 release;
8. R8 technical truth or R16 financial truth individually cherry-picked where compound release requires both — Compound-02 control, no new number;
9. financial result releases unrelated non-financial reservation member — R7 member-scoping control, no new number.

### Coverage

M3 directly exercises F07-13, F07-16, F07-17 plus the non-recounted Compound-02 release controls.

## 6. Attack family M4 — recovered occurrence → executor health → reservation/admission

Create concurrent recovered work:

- O1 requires executor/service path X and exact health HX;
- O2 requires path Y and HY;
- both may compete for shared R7 resource pools.

### Required affirmative control

- O1 reconstructs deterministically and remains paired to X/HX;
- O2 remains paired to Y/HY;
- health is current enough at actual resumed-processing boundary;
- each occurrence keeps its own reservation/admission identity;
- aggregate resource admission accounts for simultaneous demand without manufacturing duplicate occurrence authority.

### Deliberate substitutions

Reject at minimum:

1. O2 borrows HX because X is healthy and in the same recovery batch — F07-14;
2. O1 uses stale HX after X degrades before progression — F07-14 freshness dimension;
3. duplicate recovery trigger manufactures a new reservation for the same logical occurrence — C24-03/Compound-03 control;
4. generic kernel health substitutes for exact path health;
5. concurrent recovery bursts are admitted as though each were the sole consumer of a shared pool;
6. partial recovery is reported complete while blocked occurrences remain.

### Coverage

M4 directly exercises F07-14 and the Phase-E recovery controls that were deliberately not separately recounted.

## 7. Attack family M5 — R3 freshness ↔ R20 decision inside a full commercial boundary

Create two freshness/decision histories:

- FR1 = evidence/proposition QF1/policy PF1/V1;
- FR2 = materially different evidence/proposition/policy/version;
- D1 is a consequential commercial boundary for Chain A requiring FR1 plus exact O1/G1, R18 bindings BA, R19 lineage L1, and all other predicates;
- D2 requires the corresponding Chain-B objects.

### Required affirmative control

D1 must preserve one exact predicate vector whose R3, R17, R18, R19 and other required identities all belong to Chain A. D2 must preserve Chain B.

### Deliberate substitutions

Reject at minimum:

1. D2 consumes FR1 because the evidence object/family is similar — F07-15;
2. D1 consumes O2/G2 — F07-09;
3. D1 consumes R18 validation/binding from Chain B — F07-03;
4. D1 consumes lineage L2 — exercised through F07-05/F07-08 and R20 lineage requirements;
5. one predicate is current/latest while the rest remain historically Chain A, yielding a mixed but individually valid predicate vector;
6. freshness becomes invalid between validation read and actual boundary commit — Compound-05 no-check-then-act control;
7. newer evidence silently substitutes for exact historical evidence rather than producing a governed successor freshness result.

### Coverage

M5 directly exercises F07-03, F07-09, F07-15 and cross-cluster composition of R3/R17/R18/R19/R20.

## 8. Global restart/replay and arbitrary-N attack

The complete test must not stop at two histories.

For arbitrary N legitimate histories H1…HN:

1. every canonical authority/history object remains independently addressable;
2. every relationship edge is persisted or deterministically reconstructable from immutable exact references, not current/latest/query order;
3. restart/replay reproduces the same graph;
4. predecessor history is not rewritten when successor HN+1 appears;
5. concurrent in-flight histories may coexist where contracts permit;
6. same-parent/same-provider/same-Asset/same-Build similarities never imply identity equivalence;
7. set-valued relations preserve exact membership and prevent cross-history member mixing;
8. evidence retrieval uses governed exact set identity/cutoff where Test E applies;
9. historical policy/result/adoption/release decisions preserve which versions actually governed at the time;
10. retention/archive behavior must preserve the required graph for the governing period.

## 9. Current representability disposition

The current repository cannot pass these attacks because the six individual surfaces and 16 cross-surface relationships already contain confirmed representability defects, including missing canonical objects, singleton/current-state collapse, missing exact references, and absent evidence-set/decision/binding persistence.

This final pass is therefore **not** expected to prove current PASS.

Its purpose is instead to answer:

> Do the mixed attacks reveal any additional independent representability invariant that is not already captured by the certified endpoint findings, F07-01…F07-17, or deliberately retained endpoint/compound controls?

### Provisional answer

**No additional independent F7 finding is opened by this draft.**

Every deliberate mixed-history failure identified above currently decomposes into one or more already-certified endpoint/F7 findings or a specifically retained Phase-E/constitutive control.

This is provisional pending adversarial review. A new finding should be opened only if the reviewer identifies a concrete cross-cluster invariant satisfying the governing anti-inflation rule in §2.

## 10. Coverage audit

All 16 confirmed F7 findings are exercised:

- F07-01 — M2;
- F07-03 — M2/M5;
- F07-04 — M2;
- F07-05 — M2/M5;
- F07-06 — M2;
- F07-07 — M1;
- F07-08 — M1/M5;
- F07-09 — M1/M5;
- F07-10 — M1;
- F07-11 — M1;
- F07-12 — M1;
- F07-13 — M3;
- F07-14 — M4;
- F07-15 — M5;
- F07-16 — M3;
- F07-17 — M3.

All three withdrawn/un-numbered duplicate scenarios are still exercised:

- execution↔R18 binding under F06-02 — M2;
- Offer↔Grant under F05-03 — M1;
- QA-bound Artifact↔Release under F04-02 — M1.

## 11. Adversarial-review questions

The reviewer should independently challenge at minimum:

1. Does any M1 substitution expose a new cross-cluster invariant not reducible to F07-07…12, F04-02, F05-03, or the Phase-C equality fixtures?
2. Does M2 reveal a distinct Offer/Grant↔multi-binding-set invariant beyond F07-04 plus F07-06, or is the combination correctly covered by those two findings?
3. Does M3 require a separately counted R16-result↔R20 financial-predicate reference beyond F07-16/F07-17 and R20's broader decision composition? Apply Tests A/B/E rather than assuming.
4. Does R15's sole `activationId` anchor into the already-defective `commercial_activations` surface create a new independent relationship defect, or is it correctly treated as reinforcing evidence for F07-16/F07-17/F07-08?
5. Does M4 expose a new R12 occurrence↔R7 reservation finding, or is that already fully governed by C24-03 and therefore a constitutive/previously assigned control?
6. Does M5 expose a new R19 Lineage↔R20 Decision finding distinct from existing R20/R19 endpoint requirements and F07-03/F07-08/F07-09? Apply the counting rule explicitly.
7. Are any of the five attack families missing a legitimate mixed-history substitution capable of surviving otherwise-correct endpoint/F7 remediation?
8. Does the arbitrary-N attack add any cardinality/set defect not already captured by F05-02, F07-06, or endpoint arbitrary-N requirements?
9. Does restart/replay expose any new relation not already represented by the 16 findings?
10. Is the provisional “no new finding” conclusion earned, or is it prematurely conservative?
11. Verify the standing count: 16 confirmed numbered F7 defects and three withdrawn/un-numbered duplicate scenarios.
12. Is retention correctly left as one synthesized unresolved durability class rather than multiplied per relationship?
13. Independent scan: identify any Phase-E, Phase-D, or Phase-C exact-correspondence fixture that is not exercised by M1–M5 or deliberately assigned to an existing owner.

## 12. Provisional verdict

**Final F7 mixed-history pass: FAIL / OPEN, with no new independent finding provisionally added.**

The current system cannot represent the required arbitrary-N cross-surface history graph. The failures are presently fully explained by the certified individual-surface defects, F07-01…F07-17, and deliberately retained non-duplicated endpoint/compound controls.

If adversarial review confirms coverage and no emergent independent invariant, this pass can be canonicalized without increasing the finding count. Phase F can then proceed to final synthesis/closure disposition, which should consolidate:

- six individual-surface FAIL certifications;
- 16 confirmed F7 cross-surface defects;
- three duplicate scenarios correctly not double-counted;
- unresolved historical-retention durability;
- remediation/re-certification dependencies;
- implementation authority remaining SUSPENDED.
