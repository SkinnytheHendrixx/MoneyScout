from __future__ import annotations

import json
from materialize_freeze_register_v2 import REGISTER, OUT, validate

rows={r['object_id']:r for r in REGISTER['rows']}
edges=REGISTER['edges']
existing={e['edge_id'] for e in edges}

# Add non-primary representation-support objects required for mechanical Phase-I
# joint sign-off where no Phase-F primary already provides a clean endpoint.
from materialize_freeze_register import row
for oid,subject in [
 ('AUX-I-R11-CORRECTIVE-CLASS-REP','R11 corrective-class persisted/routing representation'),
 ('AUX-I-R12-STATE-REP','R12 state-machine persisted/transition representation'),
 ('AUX-I-R14-LIFECYCLE-REP','R14 lifecycle/fencing/handoff representation'),
]:
    if oid not in rows:
        r=row(oid,'REPRESENTATION_NODE','I','NON_PRIMARY_SUPPORT',oid,
              f'{subject} is explicit enough for mechanical NAME joint sign-off without creating another phase primary.',
              rep_owner=oid)
        r['source_artifact_refs']=['GLOBAL_REMEDIATION_REGISTER_PHASE_I_RECONCILIATION_REVIEW_DRAFT.md','GLOBAL_REMEDIATION_REGISTER_PHASE_I_RECONCILIATION_REVIEW_CORRECTIONS_1.md']
        REGISTER['rows'].append(r); rows[oid]=r

def add(eid,src,dst,typ,gate,scope='WHOLE_OBJECT',condition='ALWAYS',trust='CERTIFIED_CURRENT'):
    if eid in existing:return
    e={'edge_id':eid,'source_object_id':src,'target_object_id':dst,'edge_type':typ,'edge_gate_phase':gate,
       'edge_scope':scope,'edge_condition':condition,'edge_trust_requirement':trust,'edge_status':'ACTIVE'}
    edges.append(e); existing.add(eid); rows[dst]['dependency_edges'].append(eid)

# Remove placeholder mechanical self-edges. Joint sign-off must point to the
# actual representation/governance support object, not to the NAME row itself.
self_mech={e['edge_id'] for e in edges if e['edge_type']=='MECHANICAL_NAME_DEPENDENCY' and e['source_object_id']==e['target_object_id']}
if self_mech:
    edges[:] = [e for e in edges if e['edge_id'] not in self_mech]
    for r in REGISTER['rows']:
        r['dependency_edges']=[eid for eid in r['dependency_edges'] if eid not in self_mech]
    existing-=self_mech

# Phase-F F7 endpoint prerequisites, exact row-by-row.
f7 = {
 'F07-01':['AUX-F-R6-VERIFICATION','F06-02'],
 'F07-03':['F06-02','F02-01'],
 'F07-04':['F05-03','F06-02'],
 'F07-05':['F06-02','F01-02'],
 'F07-06':['AUX-F-EXECUTION-IDENTITY','F06-02'],
 'F07-07':['F04-01','F05-01'],
 'F07-08':['F05-03','F01-02'],
 'F07-09':['F05-03','F02-01'],
 'F07-10':['F03-01','F04-01'],
 'F07-11':['F04-01'],
 'F07-12':['F04-01','AUX-F-ASSET-ADOPTION'],
 'F07-13':['AUX-F-R2-OUTCOME','AUX-F-R7-ECONOMIC-ACTION'],
 'F07-14':['AUX-F-R12-OCCURRENCE','AUX-F-R13-PATH-HEALTH'],
 'F07-15':['AUX-F-R3-FRESHNESS','F02-01'],
 'F07-16':['AUX-F-R7-ECONOMIC-ACTION','AUX-F-R15-EVIDENCE'],
 'F07-17':['AUX-F-R15-EVIDENCE','AUX-F-R16-RECONCILIATION'],
 'F07-18':['F01-02','F02-01'],
}
for dst,sources in f7.items():
    for i,src in enumerate(sources,1):
        add(f'E-F7REP-{dst[-2:]}-{i}',src,dst,'REPRESENTATION_PREREQUISITE','MAY_CLOSE','EXACT_ENDPOINT_REPRESENTATION')

# Phase-H exactness rows whose current governed representation is explicitly
# consumed by normalized F/I/J objects.
h_attach = {
 'H2-E05':['AUX-F-R6-VERIFICATION'],
 'H2-E14':['AUX-F-R12-OCCURRENCE'],
 'H2-E17':['AUX-F-R13-PATH-HEALTH'],
 'H2-E20':['AUX-I-R14-LIFECYCLE-REP'],
 'H2-E21':['AUX-I-R14-LIFECYCLE-REP'],
 'H2-E23':['AUX-F-R15-EVIDENCE'],
 'H2-E24':['AUX-F-R15-EVIDENCE'],
 'H2-E25':['AUX-F-R15-EVIDENCE'],
 'H2-E27':['AUX-F-R16-RECONCILIATION'],
 'H2-E30':['F05-01','F05-03'],
 'H2-E32':['F05-01'],
 'H2-E34':['F06-02'],
 'H2-E36':['F01-02'],
 'H2-E37':['F01-02'],
 'H2-E40':['F02-01'],
 'H2-E43':['F02-01'],
}
for src,targets in h_attach.items():
    for i,dst in enumerate(targets,1):
        add(f'E-HEXACT-{src}-{i}',src,dst,'SOURCE_PREREQUISITE','MAY_CLOSE','CURRENT_GOVERNED_REPRESENTATION','SOURCE_RECOVERED_OR_GOVERNED_CURRENT_FORM')
add('E-HEXACT-H2-E45-J04','H2-E45','J-F04','EVIDENCE_RECHECK_DEPENDENCY','RECHECK','HISTORICAL_ENFORCEMENT_FORM_ONLY','IF_RECOVERED_FORM_IS_ADOPTED_AS_CURRENT_EVIDENCE')

# Phase-I semantic/representation joint-signoff dependencies.
add('E-I-H1S01-NAME','H1-S01','NAME-H1-S01','SOURCE_PREREQUISITE','MAY_CLOSE','R8_TAXONOMY_SEMANTICS_BEFORE_LABELS')
add('E-I-E10-REP','AUX-I-R11-CORRECTIVE-CLASS-REP','NAME-H2-E10','MECHANICAL_NAME_DEPENDENCY','MAY_CLOSE','JOINT_NAME_REP_SIGNOFF')
add('E-I-E13-REP','AUX-I-R12-STATE-REP','NAME-H2-E13','MECHANICAL_NAME_DEPENDENCY','MAY_CLOSE','JOINT_NAME_REP_SIGNOFF')
add('E-I-E19-REP','AUX-I-R14-LIFECYCLE-REP','NAME-H2-E19','MECHANICAL_NAME_DEPENDENCY','MAY_CLOSE','JOINT_NAME_REP_SIGNOFF')
add('E-I-E31-REP1','F05-01','NAME-H2-E31','MECHANICAL_NAME_DEPENDENCY','MAY_CLOSE','OFFER_LIFECYCLE_JOINT_SIGNOFF')
add('E-I-E31-REP2','F05-03','NAME-H2-E31','MECHANICAL_NAME_DEPENDENCY','MAY_CLOSE','GRANT_LIFECYCLE_JOINT_SIGNOFF')
add('E-I-E42-REP','H2-E40','NAME-H2-E42','MECHANICAL_NAME_DEPENDENCY','MAY_CLOSE','R20_PHASE_REPRESENTATION_JOINT_SIGNOFF')
# E41 already receives H2-E43→NAME-H2-E41 in XPI-01 and then feeds J-F02.

# ROOT-1 transitive financial evidence consumers explicitly called out by the
# integrated corrections.
for i,dst in enumerate(['AUX-F-R15-EVIDENCE','AUX-F-R16-RECONCILIATION'],1):
    if 'ROOT-1' not in rows[dst]['physical_roots_known']:
        rows[dst]['physical_roots_known'].append('ROOT-1')
        rows[dst]['required_writer_root_ids'].append('ROOT-1')
        rows[dst]['required_writer_root_order_keys'].append(REGISTER['roots']['ROOT-1']['order_key'])
        rows[dst]['root_ordering_revision']='FREEZE-CANDIDATE-FR09-R1'
        rows[dst]['shared_root_lock_status']='NOT_ACQUIRED'
        rows[dst]['multi_root_acquisition_state']='NOT_STARTED'
    add(f'E-ROOT1-SUPPORT-{i}','ROOT-1',dst,'SHARED_ROOT_STABILITY_DEPENDENCY','RECHECK','SHARED_ROOT:ROOT-1')

# Every semantic/unresolved rule must carry machine-readable outgoing edge IDs,
# not merely a prose note.
for oid in ['RD-C-R17-R18','RD-C-R19-R18','RD-C-R19-R14','RD-C-R5-R20','RD-C-R11-R8']:
    rows[oid]['fanout_edge_ids']=sorted(e['edge_id'] for e in edges if e['source_object_id']==oid)
    rows[oid]['fanout_manifest_status']='MATERIALIZED'

# Assembly completeness oracle: known required edges from phase reconciliation
# and accepted integration corrections must exist explicitly.
REQUIRED_EDGE_PAIRS=set()
for dst,sources in f7.items():
    REQUIRED_EDGE_PAIRS.update((src,dst) for src in sources)
for src,targets in h_attach.items():
    REQUIRED_EDGE_PAIRS.update((src,dst) for dst in targets)
REQUIRED_EDGE_PAIRS.update({
 ('H1-S01','NAME-H1-S01'),
 ('AUX-I-R11-CORRECTIVE-CLASS-REP','NAME-H2-E10'),
 ('AUX-I-R12-STATE-REP','NAME-H2-E13'),
 ('AUX-I-R14-LIFECYCLE-REP','NAME-H2-E19'),
 ('F05-01','NAME-H2-E31'),('F05-03','NAME-H2-E31'),
 ('H2-E43','NAME-H2-E41'),('H2-E40','NAME-H2-E42'),
 ('RD-C-R17-R18','F07-04'),('RD-C-R19-R18','F07-05'),
 ('RD-C-R5-R20','H2-E40'),('RD-C-R5-R20','H2-E43'),('RD-C-R5-R20','NAME-H2-E42'),
 ('RD-C-R11-R8','NAME-H2-E10'),
})

def assembly_errors():
    errs=[]
    pairs={(e['source_object_id'],e['target_object_id']) for e in edges}
    missing=sorted(REQUIRED_EDGE_PAIRS-pairs)
    if missing: errs.append(f'missing required dependency pairs: {missing}')
    for oid in ['RD-C-R17-R18','RD-C-R19-R18','RD-C-R19-R14','RD-C-R5-R20','RD-C-R11-R8']:
        actual=set(rows[oid].get('fanout_edge_ids',[]))
        expected={e['edge_id'] for e in edges if e['source_object_id']==oid}
        if actual!=expected: errs.append(f'{oid}: fanout manifest mismatch')
    # Mechanical NAME rows may not retain placeholder self-dependency edges.
    for e in edges:
        if e['edge_type']=='MECHANICAL_NAME_DEPENDENCY' and e['source_object_id']==e['target_object_id']:
            errs.append(f"mechanical self-edge remains: {e['edge_id']}")
    return errs

base=validate(REGISTER)
# Preserve v2 fidelity assertions already encoded in its validation result by
# recomputing their key arithmetic here rather than trusting prior status.
fidelity=[]
if len([r for r in REGISTER['rows'] if r['source_phase']=='F' and r['object_type']=='FINDING'])!=36:fidelity.append('Phase F primary count != 36')
if len([r for r in REGISTER['rows'] if r['source_phase']=='H' and r['object_type']=='SOURCE_GAP'])!=57:fidelity.append('Phase H source-gap count != 57')
if len([r for r in REGISTER['rows'] if r['source_phase']=='I' and r['object_type']=='NAME_CARRY_FORWARD'])!=9:fidelity.append('Phase I count != 9')
if len([r for r in REGISTER['rows'] if r['source_phase']=='J' and r['object_type']=='GOVERNANCE_NODE'])!=6:fidelity.append('Phase J finding count != 6')
if len([r for r in REGISTER['rows'] if r['source_phase']=='J' and r['object_type']=='ATTACK'])!=11:fidelity.append('Phase J attack count != 11')
if sum(1 for r in REGISTER['rows'] if r.get('current_evidenced_disposition')=='J_DOCUMENTED_ONLY')!=3:fidelity.append('J documented-only mismatch')
if sum(1 for r in REGISTER['rows'] if r.get('current_evidenced_disposition')=='J_MISSING')!=3:fidelity.append('J missing mismatch')
assembly=assembly_errors()
all_errors=base+fidelity+assembly
REGISTER['validation']={
 'error_count':len(all_errors),'errors':all_errors,'row_count':len(REGISTER['rows']),'edge_count':len(edges),
 'structural_error_count':len(base),'fidelity_error_count':len(fidelity),'assembly_completeness_error_count':len(assembly),
}
REGISTER['status']='MATERIALIZED_FREEZE_ASSEMBLY_V3_REVIEW_DRAFT'
OUT.write_text(json.dumps(REGISTER,indent=2,sort_keys=True)+'\n')
print(json.dumps(REGISTER['validation'],indent=2))
if all_errors: raise SystemExit(1)
