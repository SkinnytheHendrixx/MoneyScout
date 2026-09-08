export const sources = [
  { url: "https://example.test/buyer-workflow", title: "Buyer workflow evidence" },
  { url: "https://example.test/paid-usage", title: "Paid usage evidence" },
];

export const supported = {
  buyer_identified: "true",
  buyer_description: "Operations teams buying structured filing data.",
  workflow_identified: "true",
  workflow_description: "Recurring screening and monitoring workflow.",
  access_vs_consumption: "access_demand",
  recurring_usage_signal: "yes",
  recurring_usage_basis: "Customers purchase recurring monitoring access.",
  existing_paid_analog_found: true,
  paid_analog_names: ["Example Data Monitor"],
  demand_conclusion: "SUPPORTED",
  contradicting_finding_refs: [],
  confidence_basis: "Tier 1 and tier 3 evidence support the conclusion.",
  open_questions: [],
  findings: [
    {
      ref: "F1",
      claim: "Operations teams pay for recurring structured filing monitoring.",
      source_url: sources[0].url,
      source_title: sources[0].title,
      classification: "FACT",
      evaluation_dimension: "external_demand",
      evidence_tier: 1,
      contradicts_thesis: false,
    },
    {
      ref: "F2",
      claim: "A paid analog offers recurring access to structured filing data.",
      source_url: sources[1].url,
      source_title: sources[1].title,
      classification: "FACT",
      evaluation_dimension: "commercial_value",
      evidence_tier: 3,
      contradicts_thesis: false,
    },
  ],
} as const;

export const weak = {
  ...supported,
  buyer_identified: "true",
  workflow_identified: "unknown",
  workflow_description: null,
  access_vs_consumption: "unclear",
  recurring_usage_signal: "unknown",
  recurring_usage_basis: null,
  existing_paid_analog_found: false,
  paid_analog_names: [],
  demand_conclusion: "WEAK",
  confidence_basis: "Tier 4 evidence exists, but verified spend is unresolved.",
  findings: [
    {
      ...supported.findings[0],
      evidence_tier: 4,
      evaluation_dimension: "external_demand",
    },
  ],
} as const;

export const unknownWithEvidence = {
  ...weak,
  buyer_identified: "unknown",
  buyer_description: null,
  workflow_identified: "unknown",
  workflow_description: null,
  access_vs_consumption: "unclear",
  demand_conclusion: "UNKNOWN",
  confidence_basis: "The available evidence is relevant but does not establish demand.",
  open_questions: ["Who has budget authority for this workflow?"],
  findings: [
    {
      ...weak.findings[0],
      evidence_tier: 5,
      evaluation_dimension: "repeat_usage",
    },
  ],
} as const;

export const unsupported = {
  ...unknownWithEvidence,
  demand_conclusion: "UNSUPPORTED",
  contradicting_finding_refs: ["F2"],
  confidence_basis: "A direct operator statement contradicts the proposed demand.",
  findings: [
    ...unknownWithEvidence.findings,
    {
      ref: "F2",
      claim: "The operator states that this data is not purchased for the proposed workflow.",
      source_url: sources[1].url,
      source_title: sources[1].title,
      classification: "FACT",
      evaluation_dimension: "incumbent_weakness",
      evidence_tier: 2,
      contradicts_thesis: true,
    },
  ],
} as const;

export const unsupportedWithInvalidRef = {
  ...unsupported,
  contradicting_finding_refs: ["NOT_A_REAL_FINDING"],
  demand_conclusion: "UNSUPPORTED",
} as const;

export const sourceRejected = {
  ...unknownWithEvidence,
  findings: [
    {
      ...unknownWithEvidence.findings[0],
      source_url: "https://not-returned.test/untrusted",
    },
  ],
} as const;

export const schemaInvalid = {
  buyer_identified: "unknown",
  demand_conclusion: "UNKNOWN",
  findings: [],
} as const;