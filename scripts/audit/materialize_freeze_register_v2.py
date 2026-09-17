from __future__ import annotations

# This layer imports the structural materializer, then enriches rows with the
# phase-certified subject/disposition data that cannot safely be represented
# by generic family-level prose alone.
import json
from materialize_freeze_register import REGISTER, OUT, validate

rows = {r["object_id"]: r for r in REGISTER["rows"]}

# ---------- Phase F: exact row subjects and closure propositions ----------
F = {
"F01-01":("COMMERCIAL_LINEAGE_CARDINALITY","Arbitrary L1…LN legitimate R19 lineages coexist for one Asset; Asset-only uniqueness/reuse cannot collapse distinct lineage authority."),
"F01-02":("COMMERCIAL_LINEAGE_IDENTITY_REPRESENTATION","A first-class immutable complete R19 Lineage Reference binds the exact historical authority path and cannot be reconstructed from current state."),
"F01-04":("HISTORICAL_RETENTION_DURABILITY","Authoritative R19 lineage remains historically addressable through governed delete/archive/retention behavior, or the unresolved row upgrades to DEFECT and is remediated."),
"F02-01":("BOUNDARY_DECISION_IDENTITY_REPRESENTATION","Durable operation-specific D1…DN Boundary Decisions coexist and bind exact authority/lineage, predicate set and policy version, outcomes, decision time/evidence, and adoption target where applicable."),
"F02-02":("BOUNDARY_REGISTRY_REPRESENTATION","Identify/classify an equivalent canonical Boundary Registry representation, or confirm absence, upgrade to DEFECT, introduce governed representation, and recheck."),
"F02-03":("HISTORICAL_RETENTION_DURABILITY","Exact historical Boundary Decisions remain authoritatively addressable under delete/archive behavior, or the unresolved row upgrades/remediates as DEFECT."),
"F03-01":("BUILD_SOURCE_SNAPSHOT_IDENTITY_AND_FREEZE","Immutable per-Build source authority is frozen before consequential builder dispatch; arbitrary-N snapshots coexist and mutable repository state cannot substitute for exact authorized source."),
"F03-02":("HISTORICAL_RETENTION_DURABILITY","Required Build Source Snapshots remain authoritatively addressable through retention/archive/delete lifecycle, or upgrade/remediate as DEFECT."),
"F04-01":("ARTIFACT_VERSION_IDENTITY_REPRESENTATION","Canonical immutable Artifact Version identity exists for arbitrary-N history and binds exact Build/source/produced artifact/deployment identity rather than repository URL/branch/current fields."),
"F04-02":("QA_RELEASE_EXACT_ARTIFACT_BINDING","Exact QA result and Release/dispatch consume the same exact immutable Artifact Version; latest QA/current branch lookup cannot substitute."),
"F04-03":("HISTORICAL_RETENTION_DURABILITY","Exact Artifact/QA/Release history remains authoritatively addressable through retention/archive/delete lifecycle, or upgrade/remediate as DEFECT."),
"F05-01":("OFFER_VERSION_IDENTITY_REPRESENTATION","Immutable Offer Version with stable exact identity/fingerprint binds all materially governing commercial fields, exact upstream lineage, provider/account, Artifact/Release, and successor provenance; material change creates successor rather than mutation."),
"F05-02":("OFFER_VERSION_CARDINALITY","Arbitrary O1…ON legitimate successor Offer Versions coexist per Asset; DB uniqueness and Asset-only create/reuse semantics cannot collapse them."),
"F05-03":("CUSTOMER_CHARGING_GRANT_REPRESENTATION","Immutable Grant identity binds one exact Offer/fingerprint, provider/account, operation scope, checkout/payment configuration, issuer/provenance, lifecycle, revocation/supersession; later offers cannot inherit prior Asset-level authority."),
"F05-04":("HISTORICAL_RETENTION_DURABILITY","Required Offer/Grant/revocation/contract/provider evidence remains historically addressable, or upgrade/remediate as DEFECT."),
"F06-01":("CAPABILITY_AUTHORITY_HISTORY_CARDINALITY","Arbitrary-N immutable/versioned capability authority records coexist per logical capability key with exact provider/account/R6 verification/policy/lifecycle identity; current projection cannot erase history."),
"F06-02":("EXECUTION_CAPABILITY_BINDING_ATTACHMENT","Every consequential execution binds exact immutable Capability Binding identity/provider-account/R6 verification/policy/lifecycle/provenance; required Binding Validation Record is durable and replay-stable."),
"F06-03":("CAPABILITY_LIFECYCLE_STATE_REPRESENTATION","Required distinct R18 lifecycle states and continuation semantics are durably representable rather than hidden in untyped metadata or collapsed to the current enum."),
"F06-04":("HISTORICAL_RETENTION_DURABILITY","Execution↔binding↔validation↔R6/provider-account history remains authoritatively addressable through archive/delete lifecycle, or upgrade/remediate as DEFECT."),
"F07-01":("R6_VERIFICATION_TO_R18_BINDING","B1→VR1, B2→VR2 and arbitrary-N coexist; no current logical capability/provider lookup can cross-wire verification ancestry."),
"F07-03":("R18_BINDING_VALIDATION_TO_R20_DECISION","Each R20 Decision consumes the exact R18 Binding/Validation result actually evaluated; no current/latest/same-scope substitution."),
"F07-04":("R17_OFFER_GRANT_TO_R18_BINDING","Exact Offer/Grant↔Binding identity survives same-provider/different-account and successor-offer histories under the canonical R17→R18 semantic rule."),
"F07-05":("R18_BINDING_TO_R19_LINEAGE","Exact consumed Binding is embedded/referenced by the exact Lineage; no provider/current-account/Asset reconstruction."),
"F07-06":("EXECUTION_TO_MULTIPLE_R18_BINDINGS","Arbitrary-N binding-set membership per execution is exact, complete, restart-stable, and rejects mixed sets across executions."),
"F07-07":("R10_ARTIFACT_RELEASE_TO_R17_OFFER","Offer freezes the exact production Artifact/Release pair; current/latest production cannot substitute after successor history exists."),
"F07-08":("R17_OFFER_GRANT_TO_R19_LINEAGE","O1/G1↔L1 and O2/G2↔L2 remain exact; current activation/offer/Asset association cannot cross-wire lineage."),
"F07-09":("R17_OFFER_GRANT_TO_R20_DECISION","Each Decision binds the exact Offer/Grant for its operation and preserves historical Decisions after supersession."),
"F07-10":("R9_SNAPSHOT_TO_R10_ARTIFACT","Artifact derives from exact frozen source snapshot; individually valid source/artifact from different histories must fail."),
"F07-11":("R10_ARTIFACT_TO_EXACT_QA_RESULT","Exact QA result identifies the exact Artifact Version tested; later QA/latest round cannot substitute."),
"F07-12":("PRODUCTION_ARTIFACT_RELEASE_TO_ASSET_ADOPTION","Asset adoption binds the exact production Artifact/Release actually adopted; current release/build pointers cannot reconstruct a different history."),
"F07-13":("R2_RESOLUTION_OUTCOME_TO_R7_RESERVATION","R7 reservation binds the exact R2 Resolution Outcome/version consumed at admission; current/latest resolution cannot substitute."),
"F07-14":("R12_OCCURRENCE_TO_R13_PATH_HEALTH","R12 occurrence binds the exact R13 path-health result, executor/service path, expectation, and applicable health semantics; mixed-history health evidence fails."),
"F07-15":("R3_FRESHNESS_TO_R20_DECISION","R20 Decision binds the exact operation-specific R3 freshness result/policy version; current freshness lookup cannot substitute and freshness does not manufacture lineage."),
"F07-16":("R7_RESERVATION_EXECUTION_TO_R15_FINANCIAL_RESULT","R15 financial observations remain attributable to the exact R7 reservation/execution identity without cross-run substitution."),
"F07-17":("R15_EVIDENCE_SET_TO_R16_RECONCILIATION","R16 canonical reconciliation binds the exact complete R15 evidence set and remains deterministic/order-independent for that set."),
"F07-18":("R19_LINEAGE_TO_R20_BOUNDARY_DECISION","Each R20 Boundary Decision consumes the exact complete R19 Lineage Reference for the operation; current lineage/Asset association cannot substitute."),
}
for oid,(subject,closure) in F.items():
    rows[oid]["normative_proposition_id"] = subject
    rows[oid]["closure_predicate"] = closure
    rows[oid]["source_artifact_refs"] = ["PHASE_F_SYNTHESIS_CLOSURE_CERTIFICATION.md","GLOBAL_REMEDIATION_REGISTER_PHASE_F_RECONCILIATION_REVIEW_DRAFT.md"]

# ---------- Phase H: exact subjects + source-exhaustion states ----------
H1_SUBJECT = {
"H1-S01":"R8 reconciliation-capability taxonomy/model/labels",
"H1-S02":"R13 health thresholds/stall windows",
"H1-S03":"R13 aggregate-health formula",
"H1-S04":"R14 readiness/incumbent drain timeout policy",
"H1-S05":"R15 provider redaction mechanics",
"H1-S06":"R15 provider financial field mappings",
"H1-S07":"R16 provider financial interpretation",
"H1-S08":"R17 deterministic commercial-equivalence fast path",
"H1-S09":"R17 checkout-provider mapping",
"H1-D01":"R10 deterministic artifact-equivalence/materialization criteria",
"H1-D02":"R19 legacy-lineage reconstruction threshold",
}
H2_SUBJECT = {
1:"R4 historical audit/fixture/closure packet",2:"R5 historical audit/migration/fixture/closure/DI",3:"R5 candidate fingerprint representation",4:"R6 historical packet",5:"R6 Policy Registry/Verification Result representation",6:"R7 migration ordinal/closure",7:"R8 historical packet",8:"R9 historical packet",9:"R10 historical packet",10:"R11 corrective-class names",11:"R11 deterministic key exact form",12:"R11 provenance",13:"R12 state names",14:"R12 non-WATCH deterministic key",15:"R12 provenance",16:"R12 historical retry cadence zero consequence",17:"R13 Executor Expectation Registry",18:"R13 provenance",19:"R14 lifecycle names",20:"R14 authority epoch/fencing",21:"R14 successor compatibility",22:"R14 provenance",23:"R15 Provider Financial Observation/provenance",24:"R15 redaction provenance",25:"R15 synthetic fingerprint algorithm",26:"R15 provenance",27:"R16 reconciliation-policy/derived-state",28:"R16 informational-observation name",29:"R16 provenance",30:"R17 Offer/Grant representation",31:"R17 Offer/Grant lifecycle names",32:"R17 fingerprint/canonical serialization",33:"R17 provenance",34:"R18 Binding Snapshot/Validation Record",35:"R18 audit provenance",36:"R19 Lineage representation/serialization/hash",37:"R19 transaction/customer-contract/session names/storage",38:"R19 provenance",39:"R20 Boundary Registry representation",40:"R20 Boundary Decision representation",41:"R20 boundary-class names",42:"R20 exact three-phase strings",43:"R20 validator-policy representation",44:"R20 forward-governance historical label",45:"R20 historical mechanical enforcement form",46:"R20 provenance"
}
for oid,subject in H1_SUBJECT.items():
    r=rows[oid]; r["normative_proposition_id"]=subject; r["source_artifact_refs"]=["PHASE_H_H4_GLOBAL_SOURCE_GAP_REGISTER_SYNTHESIS.md"]
    r["source_exhaustion_state"] = "SOURCE_AVAILABILITY_UNRESOLVED" if oid in {"H1-S05","H1-S06","H1-S07","H1-S09"} else "SOURCE_PARTIALLY_EXHAUSTED"
for i,subject in H2_SUBJECT.items():
    oid=f"H2-E{i:02d}"; r=rows[oid]; r["normative_proposition_id"]=subject; r["source_artifact_refs"]=["PHASE_H_H4_GLOBAL_SOURCE_GAP_REGISTER_SYNTHESIS.md"]
    r["source_exhaustion_state"] = "SOURCE_NOT_YET_EXHAUSTED" if i in {1,2,3,4,5,34,35} else "SOURCE_PARTIALLY_EXHAUSTED"

# H canonical source-state arithmetic is asserted explicitly.
REGISTER["phase_h_source_state_arithmetic"] = {
    "SOURCE_EXHAUSTED":0,
    "SOURCE_NOT_YET_EXHAUSTED":7,
    "SOURCE_PARTIALLY_EXHAUSTED":46,
    "SOURCE_AVAILABILITY_UNRESOLVED":4,
}

# ---------- Phase I exact subjects and carry-forward boundary ----------
I_SUBJECT = {
"NAME-H1-S01":"R8 reconciliation-capability labels",
"NAME-H2-E10":"R11 corrective-class names",
"NAME-H2-E13":"R12 state names",
"NAME-H2-E19":"R14 lifecycle names",
"NAME-H2-E28":"R16 informational-observation name",
"NAME-H2-E31":"R17 Offer/Grant lifecycle names",
"NAME-H2-E41":"R20 boundary-class names",
"NAME-H2-E42":"R20 exact three-phase literal strings",
"NAME-H2-E44":"R20 forward-governance historical label",
}
for oid,subject in I_SUBJECT.items():
    rows[oid]["normative_proposition_id"] = subject
    rows[oid]["source_artifact_refs"] = ["PHASE_H_H4_GLOBAL_SOURCE_GAP_REGISTER_SYNTHESIS.md","GLOBAL_REMEDIATION_REGISTER_PHASE_I_RECONCILIATION_REVIEW_DRAFT.md","GLOBAL_REMEDIATION_REGISTER_PHASE_I_RECONCILIATION_REVIEW_CORRECTIONS_1.md"]

# ---------- Phase J exact current evidenced disposition ----------
J_DISP = {"J-F01":"J_DOCUMENTED_ONLY","J-F02":"J_MISSING","J-F03":"J_DOCUMENTED_ONLY","J-F04":"J_MISSING","J-F05":"J_DOCUMENTED_ONLY","J-F06":"J_MISSING"}
J_SUBJECT = {
"J-F01":"consequential-surface classification trigger",
"J-F02":"mandatory Boundary Registry registration/re-registration",
"J-F03":"mandatory bypass/degradation review trigger",
"J-F04":"deterministic fail-closed enforcement where mechanically possible",
"J-F05":"consumer allow/deny plus degradation-regression proof",
"J-F06":"unrepresentable consequence-class A0/A1 escalation",
}
for oid,disp in J_DISP.items():
    rows[oid]["current_evidenced_disposition"] = disp
    rows[oid]["normative_proposition_id"] = J_SUBJECT[oid]
    rows[oid]["source_artifact_refs"] = ["PHASE_J_J3_FINAL_PHASE_J_SYNTHESIS.md"]
REGISTER["phase_j_disposition_arithmetic"]={"J_ENFORCED":0,"J_PARTIALLY_ENFORCED":0,"J_DOCUMENTED_ONLY":3,"J_MISSING":3}

# J-A9 remains audit-governance-domain closure only; no development-process closure is implied.
rows["J-A9"]["notes"] += " This closes only the Phase-I provenance/evidence-rule attack; it is not evidence of future-code mechanical enforcement."

# ---------- Source artifact anchors for core C/G/integration/freeze objects ----------
for oid in ["RD-C-R17-R18","RD-C-R19-R18","RD-C-R19-R14","RD-C-R5-R20","RD-C-R11-R8"]:
    rows[oid]["source_artifact_refs"]=["Phase-C canonical edge/gap record","GLOBAL_REMEDIATION_REGISTER_ROUND5_CORRECTIONS.md"]
rows["IC-G2-01"]["source_artifact_refs"]=["Phase-G G2-01 adjudication","GLOBAL_REMEDIATION_REGISTER_PHASE_F_RECONCILIATION_REVIEW_CORRECTIONS_1.md"]
for i in range(1,6): rows[f"XPI-{i:02d}"]["source_artifact_refs"]=["GLOBAL_REMEDIATION_DEPENDENCY_AND_INVALIDATION_REGISTER_INTEGRATED_REVIEW_DRAFT.md","Integrated Corrections 1-4"]
for i in range(1,10): rows[f"FR-{i:02d}"]["source_artifact_refs"]=["GLOBAL_REMEDIATION_REGISTER_FREEZE_READINESS_AUDIT_REVIEW_DRAFT.md","Freeze-Readiness/Freeze-Candidate Corrections 1-4"]

# ---------- Additional fidelity validation ----------
def fidelity_errors():
    errors=[]
    if len([r for r in REGISTER["rows"] if r["source_phase"]=="F" and r["object_type"]=="FINDING"]) != 36:
        errors.append("Phase F primary count != 36")
    if len([r for r in REGISTER["rows"] if r["source_phase"]=="H" and r["object_type"]=="SOURCE_GAP"]) != 57:
        errors.append("Phase H source-gap count != 57")
    if len([r for r in REGISTER["rows"] if r["source_phase"]=="I" and r["object_type"]=="NAME_CARRY_FORWARD"]) != 9:
        errors.append("Phase I carry-forward count != 9")
    if len([r for r in REGISTER["rows"] if r["source_phase"]=="J" and r["object_type"]=="GOVERNANCE_NODE"]) != 6:
        errors.append("Phase J finding count != 6")
    if len([r for r in REGISTER["rows"] if r["source_phase"]=="J" and r["object_type"]=="ATTACK"]) != 11:
        errors.append("Phase J attack count != 11")
    if sum(1 for r in REGISTER["rows"] if r.get("current_evidenced_disposition")=="J_DOCUMENTED_ONLY") != 3:
        errors.append("Phase J documented-only arithmetic mismatch")
    if sum(1 for r in REGISTER["rows"] if r.get("current_evidenced_disposition")=="J_MISSING") != 3:
        errors.append("Phase J missing arithmetic mismatch")
    hstates={k:0 for k in REGISTER["phase_h_source_state_arithmetic"]}
    for r in REGISTER["rows"]:
        s=r.get("source_exhaustion_state")
        if s in hstates: hstates[s]+=1
    if hstates != REGISTER["phase_h_source_state_arithmetic"]:
        errors.append(f"Phase H source-state arithmetic mismatch: {hstates}")
    superseded_mechanical={"NAME-H2-E10","NAME-H2-E13","NAME-H2-E19","NAME-H2-E31","NAME-H2-E41","NAME-H2-E42"}
    actual={r["object_id"] for r in REGISTER["rows"] if r["source_phase"]=="I" and r["incorporation_state"]=="SUPERSEDED_BY_INTEGRATION"}
    if actual != superseded_mechanical:
        errors.append(f"Phase I supersession set mismatch: {sorted(actual)}")
    return errors

base_errors = validate(REGISTER)
fid_errors = fidelity_errors()
all_errors = base_errors + fid_errors
REGISTER["validation"]={
    "error_count":len(all_errors),"errors":all_errors,
    "row_count":len(REGISTER["rows"]),"edge_count":len(REGISTER["edges"]),
    "structural_error_count":len(base_errors),"fidelity_error_count":len(fid_errors),
}
OUT.write_text(json.dumps(REGISTER,indent=2,sort_keys=True)+"\n")
print(json.dumps(REGISTER["validation"],indent=2))
if all_errors: raise SystemExit(1)
