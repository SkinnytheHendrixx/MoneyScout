from __future__ import annotations

import json
from collections import defaultdict, deque
from pathlib import Path

OUT = Path("docs/remediation-contracts/GLOBAL_REMEDIATION_REGISTER_FREEZE_ASSEMBLY.json")

MANDATORY_FIELDS = [
    "object_id","object_type","source_phase","source_finding_or_gap_id","normative_proposition_id",
    "source_artifact_refs","evidence_revision_refs","canonical_authority_owners","primary_closure_owner",
    "supporting_owners","ownership_notes","current_lifecycle_state","incorporation_state","superseded_by",
    "conditional_closure_additions","may_design","may_land","may_close","dependency_edges",
    "conditional_dependency_checks","semantic_rule_status","representation_owner","source_gap_disposition",
    "historical_provenance_state","provider_scope","physical_roots_known","paim_revision","paim_pins",
    "paim_pin_revalidation_status","graph_effect_status","consequential_surface_effect_status",
    "fanout_manifest_status","shared_root_lock_status","shared_root_mutation_lease_ids","required_writer_root_ids",
    "required_writer_root_order_keys","root_ordering_revision","multi_root_acquisition_state",
    "partially_acquired_root_ids","all_required_writer_leases_acquired","landing_prestate_id","landing_attempt_id",
    "landing_event_id","landing_commit_status","landing_outcome","post_bct_status","rollback_state",
    "precommit_abort_reason","precommit_abort_evidence_refs","writeset_expansion_discovery_phase",
    "distributed_commit_state","required_rechecks","required_attack_fixtures","required_migration_fixtures",
    "closure_predicate","closure_evidence_refs","notes"
]

INCORP = {"INCORPORATED","INCORPORATED_WITH_CONDITIONAL_CLOSURE_ADDITION","SUPERSEDED_BY_INTEGRATION"}
EDGE_TYPES = {
    "SEMANTIC_PREREQUISITE","UNRESOLVED_TRANSITION_PREREQUISITE","REPRESENTATION_PREREQUISITE",
    "CLOSURE_PREREQUISITE","GOVERNANCE_PREREQUISITE","EVIDENCE_RECHECK_DEPENDENCY",
    "GRAPH_UPDATE_DEPENDENCY","SOURCE_PREREQUISITE","PROVIDER_PREREQUISITE",
    "SHARED_ROOT_STABILITY_DEPENDENCY","RETENTION_COMPATIBILITY_DEPENDENCY","MECHANICAL_NAME_DEPENDENCY"
}
EDGE_GATES = {"MAY_DESIGN","MAY_LAND","POST_BCT","RECHECK","MAY_CLOSE","CERTIFICATION_BUNDLE_ONLY"}
ROOTS = {
    "ROOT-1":{"name":"commercial_activations","order_key":"ROOT-1:commercial_activations"},
    "ROOT-2":{"name":"capabilities","order_key":"ROOT-2:capabilities"},
    "ROOT-3":{"name":"commercial_payment_provider_config","order_key":"ROOT-3:commercial_payment_provider_config"},
}

BASE_PAIM_PINS = {
    "authority_revisions":[],"config_revisions":[],"physical_root_revisions":[],
    "candidate_graph_revision":"UNFROZEN","consequential_surface_inventory_revision":"UNFROZEN",
    "dependency_register_revision":"UNFROZEN","source_governance_revision_refs":[]
}


def row(object_id, object_type, phase, source, owner, closure, *, proposition=None, incorp="INCORPORATED",
        superseded_by="NOT_APPLICABLE", roots=None, provider="NOT_APPLICABLE", source_gap="NOT_APPLICABLE",
        historical="NOT_APPLICABLE", rep_owner="NOT_APPLICABLE", semantic="NOT_APPLICABLE",
        conditional=None, rechecks=None, attacks=None, migrations=None, notes=""):
    roots = roots or []
    order_keys = [ROOTS[r]["order_key"] for r in roots]
    return {
        "object_id":object_id,
        "object_type":object_type,
        "source_phase":phase,
        "source_finding_or_gap_id":source,
        "normative_proposition_id":proposition or object_id,
        "source_artifact_refs":[],
        "evidence_revision_refs":[],
        "canonical_authority_owners":[owner] if isinstance(owner,str) else list(owner),
        "primary_closure_owner":owner if isinstance(owner,str) else list(owner)[0],
        "supporting_owners":[],
        "ownership_notes":"ONE_PRIMARY_CLOSURE_AUTHORITY",
        "current_lifecycle_state":"OPEN" if object_type not in {"ATTACK","INTEGRATION_CONTROL","FREEZE_CONTROL"} else "ACTIVE_CONTROL",
        "incorporation_state":incorp,
        "superseded_by":superseded_by,
        "conditional_closure_additions":conditional or [],
        "may_design":False,"may_land":False,"may_close":False,
        "dependency_edges":[],
        "conditional_dependency_checks":[],
        "semantic_rule_status":semantic,
        "representation_owner":rep_owner,
        "source_gap_disposition":source_gap,
        "historical_provenance_state":historical,
        "provider_scope":provider,
        "physical_roots_known":roots,
        "paim_revision":"UNFROZEN",
        "paim_pins":dict(BASE_PAIM_PINS),
        "paim_pin_revalidation_status":"NOT_RUN",
        "graph_effect_status":"NOT_EVALUATED",
        "consequential_surface_effect_status":"NOT_EVALUATED",
        "fanout_manifest_status":"NOT_APPLICABLE" if object_type not in {"SEMANTIC_RULE_NODE","UNRESOLVED_TRANSITION_NODE"} else "MATERIALIZED",
        "shared_root_lock_status":"NOT_APPLICABLE" if not roots else "NOT_ACQUIRED",
        "shared_root_mutation_lease_ids":[],
        "required_writer_root_ids":roots,
        "required_writer_root_order_keys":order_keys,
        "root_ordering_revision":"FREEZE-CANDIDATE-FR09-R1" if roots else "NOT_APPLICABLE",
        "multi_root_acquisition_state":"NOT_APPLICABLE" if not roots else "NOT_STARTED",
        "partially_acquired_root_ids":[],
        "all_required_writer_leases_acquired":False,
        "landing_prestate_id":"NOT_CREATED",
        "landing_attempt_id":"NOT_CREATED",
        "landing_event_id":"NOT_CREATED",
        "landing_commit_status":"NOT_STARTED",
        "landing_outcome":"NOT_LANDED",
        "post_bct_status":"NOT_RUN",
        "rollback_state":"NOT_APPLICABLE",
        "precommit_abort_reason":"NOT_APPLICABLE",
        "precommit_abort_evidence_refs":[],
        "writeset_expansion_discovery_phase":"NOT_APPLICABLE",
        "distributed_commit_state":"NOT_APPLICABLE",
        "required_rechecks":rechecks or [],
        "required_attack_fixtures":attacks or [],
        "required_migration_fixtures":migrations or [],
        "closure_predicate":closure,
        "closure_evidence_refs":[],
        "notes":notes,
    }

ROWS = []

# Phase C: five standing remediation nodes.
ROWS += [
 row("RD-C-R17-R18","SEMANTIC_RULE_NODE","C","R17→R18 MISSING_REQUIRED_COMPOSITION","R17/R18","Canonical exact Offer/Grant↔commercial-payment Binding rule exists and passes BCT/edge classification.",semantic="UNRESOLVED_RULE"),
 row("RD-C-R19-R18","SEMANTIC_RULE_NODE","C","R19→R18 MISSING_REQUIRED_COMPOSITION","R19/R18","Canonical exact lineage↔Binding rule exists and passes BCT/edge classification.",semantic="UNRESOLVED_RULE"),
 row("RD-C-R19-R14","SEMANTIC_RULE_NODE","C","R19→R14 MISSING_REQUIRED_COMPOSITION","R19/R14","Canonical lineage preservation across R14 handoff exists and passes BCT/edge classification.",semantic="UNRESOLVED_RULE"),
 row("RD-C-R5-R20","SEMANTIC_RULE_NODE","C","R5→R20 MISSING_REQUIRED_COMPOSITION","R5/R20","Canonical rule defines whether/how R20 consumes exact R5 confirmation and boundary freshness.",semantic="UNRESOLVED_RULE"),
 row("RD-C-R11-R8","UNRESOLVED_TRANSITION_NODE","C","C21-03 UNRESOLVED_CROSS_NODE_GAP","R11/R8","Governed disposition exists for active R11 obligation after EXPOSURE_COMMITTED_UNRECONCILABLE without fabricating historical truth.",semantic="UNRESOLVED_TRANSITION"),
]

# Phase F: 36 primaries.
f_rows = [
("F01-01","REP-R19","COMMERCIAL_LINEAGE_CARDINALITY"),("F01-02","REP-R19","COMMERCIAL_LINEAGE_IDENTITY_REPRESENTATION"),("F01-04","RET-R19","HISTORICAL_RETENTION_DURABILITY"),
("F02-01","REP-R20","BOUNDARY_DECISION_IDENTITY_REPRESENTATION"),("F02-02","REP-F02-02","BOUNDARY_REGISTRY_REPRESENTATION"),("F02-03","RET-R20","HISTORICAL_RETENTION_DURABILITY"),
("F03-01","REP-R9","BUILD_SOURCE_SNAPSHOT_IDENTITY_AND_FREEZE"),("F03-02","RET-R9","HISTORICAL_RETENTION_DURABILITY"),
("F04-01","REP-R10","ARTIFACT_VERSION_IDENTITY_REPRESENTATION"),("F04-02","REP-R10","QA_RELEASE_EXACT_ARTIFACT_BINDING"),("F04-03","RET-R10","HISTORICAL_RETENTION_DURABILITY"),
("F05-01","REP-R17","OFFER_VERSION_IDENTITY_REPRESENTATION"),("F05-02","REP-R17","OFFER_VERSION_CARDINALITY"),("F05-03","REP-R17","CUSTOMER_CHARGING_GRANT_REPRESENTATION"),("F05-04","RET-R17","HISTORICAL_RETENTION_DURABILITY"),
("F06-01","REP-R18","CAPABILITY_AUTHORITY_HISTORY_CARDINALITY"),("F06-02","REP-R18","EXECUTION_CAPABILITY_BINDING_ATTACHMENT"),("F06-03","REP-R18","CAPABILITY_LIFECYCLE_STATE_REPRESENTATION"),("F06-04","RET-R18","HISTORICAL_RETENTION_DURABILITY"),
]
for fid, owner, label in f_rows:
    roots=[]
    conditional=[]
    if owner in {"REP-R17","REP-R19","RET-R17","RET-R19"}: roots=["ROOT-1"]
    if fid in {"F05-04","F01-04"}: conditional=["If ROOT-1 history is physically split, pinned-source triangulated reconciliation fixture is required."]
    ROWS.append(row(fid,"FINDING","F",fid,owner,f"Phase-F canonical closure predicate for {label} passes with required historical/reference integrity.",roots=roots,conditional=conditional,rep_owner=owner if owner.startswith("REP") else "NOT_APPLICABLE"))

f7_ids = [1,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]
for n in f7_ids:
    fid=f"F07-{n:02d}"
    roots=[]
    if n in {4,5,8,9,16,17,18}: roots=["ROOT-1"]
    if n in {1,3,4,5,6}: roots=sorted(set(roots+["ROOT-2"]))
    ROWS.append(row(fid,"FINDING","F",fid,f"REP-{fid}",f"Exact canonical Phase-F F7 relationship {fid} is representable, arbitrary-N/replay safe where applicable, and rejects mixed-history substitution.",roots=roots,rep_owner=f"REP-{fid}"))

# Phase-F support nodes.
SUPPORTS = [
 "AUX-F-R2-OUTCOME","AUX-F-R3-FRESHNESS","AUX-F-R6-VERIFICATION","AUX-F-R7-ECONOMIC-ACTION",
 "AUX-F-R12-OCCURRENCE","AUX-F-R13-PATH-HEALTH","AUX-F-R15-EVIDENCE","AUX-F-R16-RECONCILIATION",
 "AUX-F-EXECUTION-IDENTITY","AUX-F-ASSET-ADOPTION"
]
for sid in SUPPORTS:
    roots=["ROOT-2"] if sid=="AUX-F-R6-VERIFICATION" else []
    ROWS.append(row(sid,"REPRESENTATION_NODE","F","NON_PRIMARY_SUPPORT",sid,"Support representation is exact enough for every dependent Phase-F relationship; does not create an additional Phase-F primary.",roots=roots,rep_owner=sid))

# Phase G.
ROWS.append(row("IC-G2-01","FINDING","G","G2-01","IC-G2-01","Exact provider/account identity remains equal through capability proof/binding, Offer/Grant, lineage, boundary consumption, and actual dispatch.",roots=["ROOT-2","ROOT-3"],rechecks=["G2-END-TO-END-PROVIDER-ACCOUNT"],notes="Contract-sufficient implementation-conformance finding; no R6/R7/R8 contract amendment solely for G2-01."))

# Phase H: exact 57 source gaps.
H1 = {
 "H1-S01":"SAFE_CONSERVATIVE","H1-S02":"SAFE_CONSERVATIVE","H1-S03":"SAFE_CONSERVATIVE","H1-S04":"SAFE_CONSERVATIVE",
 "H1-S05":"BLOCK_PROVIDER","H1-S06":"BLOCK_PROVIDER","H1-S07":"BLOCK_PROVIDER","H1-S08":"SAFE_FALLBACK","H1-S09":"BLOCK_PROVIDER",
 "H1-D01":"SAFE_FALLBACK","H1-D02":"SAFE_FALLBACK"
}
for hid,disp in H1.items():
    roots=[]; provider="NOT_APPLICABLE"
    if hid in {"H1-S05","H1-S06","H1-S07","H1-S09"}: roots=["ROOT-3"]; provider="COMMERCIAL_PAYMENT_PROVIDER_DOMAIN"
    ROWS.append(row(hid,"SOURCE_GAP","H",hid,f"SRC-{hid}",f"Resolve {hid} by source recovery or its canonically allowed governed {disp} disposition without historical laundering.",roots=roots,provider=provider,source_gap=disp,historical="UNRESOLVED_HISTORICAL_EXACTNESS"))
for i in range(1,47):
    hid=f"H2-E{i:02d}"
    roots=["ROOT-2"] if i==5 else []
    ROWS.append(row(hid,"SOURCE_GAP","H",hid,f"SRC-{hid}",f"Resolve exactness/traceability gap {hid} without inventing historical form; attach identity/reference-affecting exactness to its consuming representation owner.",roots=roots,source_gap="EXACTNESS_ONLY",historical="UNRESOLVED_HISTORICAL_EXACTNESS"))

# Phase I nine carry-forwards. Six mechanical rows are superseded by integration because closure-test shape changed.
i_rows = [
("NAME-H1-S01","H1-S01",False),("NAME-H2-E10","H2-E10",True),("NAME-H2-E13","H2-E13",True),("NAME-H2-E19","H2-E19",True),
("NAME-H2-E28","H2-E28",False),("NAME-H2-E31","H2-E31",True),("NAME-H2-E41","H2-E41",True),("NAME-H2-E42","H2-E42",True),("NAME-H2-E44","H2-E44",False)
]
for iid,parent,mechanical in i_rows:
    inc="SUPERSEDED_BY_INTEGRATION" if mechanical else "INCORPORATED"
    sup="PHASE_I_CORRECTIONS_1_MECHANICAL_JOINT_SIGNOFF" if mechanical else "NOT_APPLICABLE"
    closure="Governed current literal/name adopted or historical name verified without laundering."
    if mechanical: closure += " NAME owner plus representation/governance owner joint sign-off is mandatory."
    ROWS.append(row(iid,"NAME_CARRY_FORWARD","I",parent,iid,closure,incorp=inc,superseded_by=sup,historical="UNRESOLVED_HISTORICAL_EXACTNESS"))

# Phase J six findings.
for i in range(1,7):
    jid=f"J-F{i:02d}"
    ROWS.append(row(jid,"GOVERNANCE_NODE","J",f"J-{i:02d}",f"GOV-{jid}",f"Phase-J obligation J-{i:02d} is durably enforced and its materially dependent attacks/rechecks pass."))

# Phase J 11 attack objects; preserve canonical arithmetic and J-A9 special closure.
for i in range(1,12):
    aid=f"J-A{i}"
    status="CLOSED_AUDIT_GOVERNANCE_DOMAIN" if i==9 else "OPEN_FUTURE_CODE_ESCAPE"
    r=row(aid,"ATTACK","J",aid,aid,"Attack has the canonical Phase-J disposition and remains linked to its principal J findings; attack state does not alter finding denominator.")
    r["current_lifecycle_state"]=status
    ROWS.append(r)

# Integration controls XPI-01..05.
for i in range(1,6):
    xid=f"XPI-{i:02d}"
    ROWS.append(row(xid,"INTEGRATION_CONTROL","INTEGRATION",xid,xid,"Integrated dependency/control rule is preserved as a certification/closure composition control and does not silently become a phase primary."))

# Freeze controls FR-01..09.
for i in range(1,10):
    fid=f"FR-{i:02d}"
    ROWS.append(row(fid,"FREEZE_CONTROL","FREEZE",fid,fid,"Freeze-control invariant is explicitly represented and passes assembly validation; not a C-J primary finding."))

# Root records are separate non-phase objects.
for rid,meta in ROOTS.items():
    rr=row(rid,"SHARED_ROOT","FREEZE","ROOT_REGISTER",rid,"Stable root ID/order key exists; mutations use FR-03/FR-09 lease protocol.")
    rr["notes"]=meta["name"]+" | "+meta["order_key"]
    ROWS.append(rr)

EDGES = []
def edge(eid, src, dst, typ, gate, scope="WHOLE_OBJECT", condition="ALWAYS", trust="CERTIFIED_CURRENT"):
    EDGES.append({"edge_id":eid,"source_object_id":src,"target_object_id":dst,"edge_type":typ,"edge_gate_phase":gate,
                  "edge_scope":scope,"edge_condition":condition,"edge_trust_requirement":trust,"edge_status":"ACTIVE"})

# Core semantic fan-out edges.
edge("E-C-01","RD-C-R17-R18","F07-04","SEMANTIC_PREREQUISITE","MAY_CLOSE","R17_R18_RELATIONSHIP")
edge("E-C-02","RD-C-R19-R18","F07-05","SEMANTIC_PREREQUISITE","MAY_CLOSE","R19_R18_RELATIONSHIP")
edge("E-C-03","RD-C-R19-R14","NAME-H2-E19","SEMANTIC_PREREQUISITE","MAY_CLOSE","R19_HANDOFF_DISCRIMINATOR_ONLY","WHEN_NAME_MAPS_HANDOFF_SEMANTICS")
edge("E-C-04","RD-C-R5-R20","F02-01","SEMANTIC_PREREQUISITE","MAY_CLOSE","R5_CONSUMING_BOUNDARY_DECISION_ONLY")
edge("E-C-05","RD-C-R5-R20","H2-E40","SEMANTIC_PREREQUISITE","MAY_CLOSE","R5_DEPENDENT_DECISION_REPRESENTATION_ONLY")
edge("E-C-06","RD-C-R5-R20","H2-E43","SEMANTIC_PREREQUISITE","MAY_CLOSE","R5_CONSUMING_VALIDATOR_POLICY_ONLY")
edge("E-C-07","RD-C-R5-R20","NAME-H2-E42","SEMANTIC_PREREQUISITE","MAY_CLOSE","BOUNDARY_VALIDATION_LITERAL_ONLY")
edge("E-C-08","RD-C-R5-R20","J-F04","GOVERNANCE_PREREQUISITE","MAY_CLOSE","R5_CONSUMING_ENFORCEMENT_ONLY")
edge("E-C-09","RD-C-R5-R20","J-F05","GOVERNANCE_PREREQUISITE","MAY_CLOSE","R5_CONSUMING_TESTS_ONLY")
edge("E-C-10","RD-C-R11-R8","NAME-H2-E10","UNRESOLVED_TRANSITION_PREREQUISITE","MAY_CLOSE","C21_03_CONSUMING_ROUTE_ONLY")

# H1 source prerequisites.
edge("E-H-01","H1-S02","F07-14","SOURCE_PREREQUISITE","MAY_CLOSE","R13_THRESHOLD_DEPENDENT_SLICE")
edge("E-H-02","H1-S03","F07-14","SOURCE_PREREQUISITE","MAY_CLOSE","R13_AGGREGATE_HEALTH_SLICE")
edge("E-H-03","H1-S04","RD-C-R19-R14","SOURCE_PREREQUISITE","MAY_CLOSE","TIMEOUT_DEPENDENT_HANDOFF_ONLY","WHEN_CHOSEN_HANDOFF_RULE_DEPENDS_ON_TIMEOUT")
for n,hid in enumerate(["H1-S05","H1-S06","H1-S07","H1-S09"],start=4):
    edge(f"E-H-{n:02d}",hid,"XPI-04","PROVIDER_PREREQUISITE","CERTIFICATION_BUNDLE_ONLY","PROVIDER_PATH_ONLY","WHEN_PROVIDER_PATH_CONSUMES_THIS_MAPPING")

# Capabilities shared-root interaction.
for idx,target in enumerate(["F06-01","F06-02","AUX-F-R6-VERIFICATION","F07-01","F07-03","F07-04","F07-05","F07-06","IC-G2-01","H2-E05"],start=1):
    edge(f"E-ROOT2-{idx:02d}","ROOT-2",target,"SHARED_ROOT_STABILITY_DEPENDENCY","RECHECK","SHARED_ROOT:ROOT-2")

# commercial_activations shared root and retention compatibility.
for idx,target in enumerate(["F05-01","F05-02","F05-03","F05-04","F01-01","F01-02","F01-04","F07-04","F07-08","F07-09","F07-16","F07-17","F07-18"],start=1):
    edge(f"E-ROOT1-{idx:02d}","ROOT-1",target,"SHARED_ROOT_STABILITY_DEPENDENCY","RECHECK","SHARED_ROOT:ROOT-1")
edge("E-RET-01","F05-04","F01-04","RETENTION_COMPATIBILITY_DEPENDENCY","MAY_CLOSE","RETENTION_SHARED_HISTORY_ONLY","WHILE_ROOT1_HISTORY_CORESIDES")

# Provider config root.
for idx,target in enumerate(["H1-S05","H1-S06","H1-S07","H1-S09","IC-G2-01"],start=1):
    edge(f"E-ROOT3-{idx:02d}","ROOT-3",target,"SHARED_ROOT_STABILITY_DEPENDENCY","RECHECK","SHARED_ROOT:ROOT-3")

# XPI chain edges.
edge("E-XPI1-01","F02-02","H2-E39","REPRESENTATION_PREREQUISITE","MAY_CLOSE","BOUNDARY_REGISTRY_FORM")
edge("E-XPI1-02","H2-E39","H2-E43","REPRESENTATION_PREREQUISITE","MAY_CLOSE","VALIDATOR_POLICY_FORM")
edge("E-XPI1-03","H2-E43","NAME-H2-E41","MECHANICAL_NAME_DEPENDENCY","MAY_CLOSE","BOUNDARY_CLASS_KEY_POLICY_MAPPING")
edge("E-XPI1-04","NAME-H2-E41","J-F02","GOVERNANCE_PREREQUISITE","MAY_CLOSE","REGISTRATION_ENFORCEMENT")

# G2 / provider path bundle edges are bundle-only, not row-owner redefinitions.
for idx,target in enumerate(["F05-03","F07-04","IC-G2-01","F07-05","F07-08","F07-18","F02-01"],start=1):
    edge(f"E-XPI4-{idx:02d}",target,"XPI-04","EVIDENCE_RECHECK_DEPENDENCY","CERTIFICATION_BUNDLE_ONLY","END_TO_END_PROVIDER_PATH")

# Mechanical NAME dependencies.
for iid in ["NAME-H2-E10","NAME-H2-E13","NAME-H2-E19","NAME-H2-E31","NAME-H2-E41","NAME-H2-E42"]:
    edge("E-NAME-"+iid.split("-")[-1],iid,iid,"MECHANICAL_NAME_DEPENDENCY","MAY_CLOSE","JOINT_NAME_REP_GOV_SIGNOFF","SELF_CONTROL_EDGE",trust="EFFECTIVE_PENDING_RECHECK")

# Attach edges to target rows for one-record inspection.
BY_ID = {r["object_id"]:r for r in ROWS}
for e in EDGES:
    if e["target_object_id"] in BY_ID:
        BY_ID[e["target_object_id"]]["dependency_edges"].append(e["edge_id"])

# Semantic-node fanout manifest is materialized from edges.
for rid in ["RD-C-R17-R18","RD-C-R19-R18","RD-C-R19-R14","RD-C-R5-R20","RD-C-R11-R8"]:
    BY_ID[rid]["notes"] += " FANOUT=" + ",".join(sorted(e["target_object_id"] for e in EDGES if e["source_object_id"]==rid))

# J attack fixtures linked to J governance findings without changing denominator.
attack_map = {
 "J-F01":["J-A1","J-A2","J-A5","J-A6","J-A7","J-A8","J-A10","J-A11"],
 "J-F02":["J-A1","J-A5","J-A6","J-A10","J-A11"],
 "J-F03":["J-A1","J-A2","J-A3","J-A5","J-A7","J-A8","J-A11"],
 "J-F04":["J-A1","J-A2","J-A3","J-A7","J-A10","J-A11"],
 "J-F05":["J-A1","J-A2","J-A3","J-A4","J-A10","J-A11"],
 "J-F06":["J-A6"],
}
for jid, attacks in attack_map.items(): BY_ID[jid]["required_attack_fixtures"] = attacks

# Preserve exact special incorporation decisions.
for fid in ["F01-04","F05-04"]:
    BY_ID[fid]["incorporation_state"]="INCORPORATED_WITH_CONDITIONAL_CLOSURE_ADDITION"
for iid in ["NAME-H2-E10","NAME-H2-E13","NAME-H2-E19","NAME-H2-E31","NAME-H2-E41","NAME-H2-E42"]:
    BY_ID[iid]["incorporation_state"]="SUPERSEDED_BY_INTEGRATION"
    BY_ID[iid]["superseded_by"]="PHASE_I_CORRECTIONS_1_MECHANICAL_UNTIL_PROVEN_NOMINAL"

# H2-E39 conditional landing-time check from Corrections 4.
BY_ID["H2-E39"]["conditional_dependency_checks"].append(
    "If selected Boundary Registry schema embeds named R5-specific predicate fields, promote RD-C-R5-R20→H2-E39 before landing."
)
# RET-R20 schema-evolution clarification.
BY_ID["F02-03"]["notes"] += " Older Boundary Decision rows may truthfully lack fields introduced only by later governed schema evolution; absence is not itself an addressability failure."

# Distributed commit fields on amendment-bearing objects default fail-closed and include prepared-indeterminate state in schema notes.
for r in ROWS:
    if r["object_type"] not in {"ATTACK","SHARED_ROOT"}:
        r["distributed_commit_state"]="NOT_STARTED_OR_SINGLE_TRANSACTION"


def validate(register):
    errors=[]
    ids=[r["object_id"] for r in register["rows"]]
    if len(ids)!=len(set(ids)): errors.append("duplicate object_id")
    known=set(ids)
    for r in register["rows"]:
        missing=[f for f in MANDATORY_FIELDS if f not in r]
        if missing: errors.append(f"{r['object_id']}: missing fields {missing}")
        if r["incorporation_state"] not in INCORP: errors.append(f"{r['object_id']}: bad incorporation_state")
        if r["may_land"] and not r["all_required_writer_leases_acquired"] and r["required_writer_root_ids"]:
            errors.append(f"{r['object_id']}: may_land with incomplete leases")
        if r["landing_commit_status"]=="COMMITTED_STABLE" and r["post_bct_status"]!="PASS":
            errors.append(f"{r['object_id']}: stable commit without POST-BCT pass")
    for e in register["edges"]:
        for f in ["edge_id","source_object_id","target_object_id","edge_type","edge_gate_phase","edge_scope","edge_condition","edge_trust_requirement","edge_status"]:
            if f not in e: errors.append(f"{e.get('edge_id','?')}: missing {f}")
        if e["edge_type"] not in EDGE_TYPES: errors.append(f"{e['edge_id']}: bad edge type")
        if e["edge_gate_phase"] not in EDGE_GATES: errors.append(f"{e['edge_id']}: bad gate")
        if e["source_object_id"] not in known or e["target_object_id"] not in known: errors.append(f"{e['edge_id']}: unknown endpoint")
    # Dependency-cycle check ignores self-control edges and bundle-only evidence edges.
    graph=defaultdict(set); indeg=defaultdict(int)
    cycle_types={"SEMANTIC_PREREQUISITE","UNRESOLVED_TRANSITION_PREREQUISITE","REPRESENTATION_PREREQUISITE","GOVERNANCE_PREREQUISITE","SOURCE_PREREQUISITE","PROVIDER_PREREQUISITE"}
    nodes=set()
    for e in register["edges"]:
        if e["edge_type"] not in cycle_types or e["source_object_id"]==e["target_object_id"]: continue
        a,b=e["source_object_id"],e["target_object_id"]; nodes|={a,b}
        if b not in graph[a]: graph[a].add(b); indeg[b]+=1; indeg.setdefault(a,0)
    q=deque([n for n in nodes if indeg[n]==0]); seen=0
    while q:
        n=q.popleft(); seen+=1
        for m in graph[n]:
            indeg[m]-=1
            if indeg[m]==0:q.append(m)
    if seen!=len(nodes): errors.append("dependency cycle detected")
    # Root ordering.
    keys=[v["order_key"] for v in register["roots"].values()]
    if len(keys)!=len(set(keys)): errors.append("duplicate root order key")
    return errors

REGISTER = {
    "status":"MATERIALIZED_FREEZE_ASSEMBLY_REVIEW_DRAFT",
    "implementation_authority":"SUSPENDED",
    "remediation_authority":"SUSPENDED",
    "schema_revision":"FREEZE-CANDIDATE-NORMALIZED-R1+FR08+FR09+FC3+FC4",
    "canonical_attack_arithmetic":"11 total = 10 open future-code escapes + 0 development-process closures + 1 J-A9 audit-governance-provenance closure",
    "roots":ROOTS,
    "rows":ROWS,
    "edges":EDGES,
    "distributed_commit_allowed_states":["NOT_STARTED_OR_SINGLE_TRANSACTION","PREPARING","PREPARED_GLOBAL_OUTCOME_INDETERMINATE","GLOBAL_COMMIT_PROVEN","GLOBAL_ABORT_PROVEN","ROLLBACK_RECONCILIATION_REQUIRED"],
}

errors=validate(REGISTER)
REGISTER["validation"]={"error_count":len(errors),"errors":errors,"row_count":len(ROWS),"edge_count":len(EDGES)}
OUT.parent.mkdir(parents=True,exist_ok=True)
OUT.write_text(json.dumps(REGISTER,indent=2,sort_keys=True)+"\n")
print(json.dumps(REGISTER["validation"],indent=2))
if errors: raise SystemExit(1)
