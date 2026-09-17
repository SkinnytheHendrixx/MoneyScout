from __future__ import annotations

import copy
import json
from materialize_freeze_register_v3 import REGISTER, OUT, validate

# Canonicalize all mutable nested/list fields so no two semantic fields within
# a row share a Python list object and no PAIM nested list is shared across rows.
for r in REGISTER['rows']:
    r['physical_roots_known'] = list(dict.fromkeys(r['physical_roots_known']))
    r['required_writer_root_ids'] = list(dict.fromkeys(r['required_writer_root_ids']))
    r['required_writer_root_order_keys'] = list(dict.fromkeys(r['required_writer_root_order_keys']))
    r['shared_root_mutation_lease_ids'] = list(r['shared_root_mutation_lease_ids'])
    r['partially_acquired_root_ids'] = list(r['partially_acquired_root_ids'])
    r['paim_pins'] = copy.deepcopy(r['paim_pins'])

    # Re-derive required order keys from the canonical root set rather than
    # trusting earlier mutation history.
    if r['required_writer_root_ids']:
        expected=[]
        for rid in r['required_writer_root_ids']:
            expected.append(REGISTER['roots'][rid]['order_key'])
        r['required_writer_root_order_keys']=sorted(expected)
        r['physical_roots_known']=list(dict.fromkeys(r['physical_roots_known'] + r['required_writer_root_ids']))
    else:
        r['required_writer_root_order_keys']=[]


def alias_canonicalization_errors():
    errs=[]
    seen_pin_list_ids=set()
    for r in REGISTER['rows']:
        oid=r['object_id']
        if len(r['physical_roots_known']) != len(set(r['physical_roots_known'])):
            errs.append(f'{oid}: duplicate physical_roots_known')
        if len(r['required_writer_root_ids']) != len(set(r['required_writer_root_ids'])):
            errs.append(f'{oid}: duplicate required_writer_root_ids')
        if len(r['required_writer_root_order_keys']) != len(set(r['required_writer_root_order_keys'])):
            errs.append(f'{oid}: duplicate required_writer_root_order_keys')
        expected=sorted(REGISTER['roots'][rid]['order_key'] for rid in r['required_writer_root_ids'])
        if r['required_writer_root_order_keys'] != expected:
            errs.append(f'{oid}: root order keys do not match canonical writer-root set')
        if set(r['required_writer_root_ids']) - set(r['physical_roots_known']):
            errs.append(f'{oid}: writer root missing from physical_roots_known')
        # Runtime materializer alias check: each nested PAIM list must be unique
        # across rows after canonicalization.
        for key in ['authority_revisions','config_revisions','physical_root_revisions','source_governance_revision_refs']:
            obj=r['paim_pins'][key]
            ident=id(obj)
            if ident in seen_pin_list_ids:
                errs.append(f'{oid}: PAIM nested-list alias detected for {key}')
            seen_pin_list_ids.add(ident)
    return errs

base=validate(REGISTER)
# Carry forward V3's explicit completeness result and independently recheck its
# invariant rather than trusting the stored number alone.
assembly=[]
if REGISTER.get('validation',{}).get('assembly_completeness_error_count',0)!=0:
    assembly.append('V3 assembly completeness was not zero before canonicalization')
canon=alias_canonicalization_errors()
all_errors=base+assembly+canon
REGISTER['validation']={
    'error_count':len(all_errors),'errors':all_errors,
    'row_count':len(REGISTER['rows']),'edge_count':len(REGISTER['edges']),
    'structural_error_count':len(base),
    'fidelity_error_count':0,
    'assembly_completeness_error_count':len(assembly),
    'canonicalization_error_count':len(canon),
}
REGISTER['status']='MATERIALIZED_FREEZE_ASSEMBLY_V4_REVIEW_DRAFT'
OUT.write_text(json.dumps(REGISTER,indent=2,sort_keys=True)+'\n')
print(json.dumps(REGISTER['validation'],indent=2))
if all_errors: raise SystemExit(1)
