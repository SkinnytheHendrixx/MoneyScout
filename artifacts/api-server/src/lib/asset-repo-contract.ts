import type {
  ArchitecturePlanDocument,
  PersistedBuildContractV2,
  ProductDefinitionDocument,
} from "@workspace/db";
import { factoryFingerprint } from "./factory-fingerprint";

export function assetRepositoryIdentity(betId: number): {
  assetKey: string;
  internalSlug: string;
} {
  return {
    assetKey: `asset-business-bet-${betId}`,
    internalSlug: `money-scout-asset-${betId}`,
  };
}

function pretty(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function compileAssetRepositoryManifests(input: {
  productDefinition: ProductDefinitionDocument;
  architecturePlan: ArchitecturePlanDocument;
  buildContract: PersistedBuildContractV2;
}): Record<string, string> {
  const productFingerprint = factoryFingerprint(input.productDefinition);
  const architectureFingerprint = factoryFingerprint(input.architecturePlan);
  const buildFingerprint = factoryFingerprint(input.buildContract);
  return {
    "AGENTS.md": `# Asset Builder Contract\n\nThe frozen Product Definition and Architecture Plan are authoritative. Do not remove Product requirements, broaden commercial scope or authority, substitute major architecture, or rewrite acceptance semantics.\n\nReturn an ARCHITECTURE_CHALLENGE when technical evidence invalidates the architecture. Return a PRODUCT_CONTRACT_CHALLENGE when the Product Definition is contradictory or impossible. Normal implementation defects remain builder/QA repair work.\n\nNo production credentials, customer charging, public release, outbound, advertising, custom-domain changes, or external spend are authorized. Builder completion is only IMPLEMENTATION_READY until independent Money Scout #70 QA passes the exact commit.\n`,
    "PRODUCT.md": `# Frozen Product Definition\n\nFingerprint: ${productFingerprint}\n\nTarget buyer: ${input.productDefinition.commercialTruth.targetBuyer}\n\nValidated problem: ${input.productDefinition.commercialTruth.validatedProblem}\n\nPromised outcome: ${input.productDefinition.commercialTruth.promisedOutcome}\n\nRequirements are authoritative in \`.money-scout/product-definition.json\`.\n`,
    "ARCHITECTURE.md": `# Frozen Architecture Plan\n\nFingerprint: ${architectureFingerprint}\n\n${input.architecturePlan.topology}\n\nLocked decisions and builder discretion are authoritative in \`.money-scout/architecture-plan.json\`.\n`,
    "BUILD_CONTRACT.md": `# Build Contract v2\n\nFingerprint: ${buildFingerprint}\n\nImplement every INCLUDED REQ-* and satisfy every AC-* criterion. Preserve the frozen Product Definition and Architecture Plan. The result must be an exact Git commit ready for independent QA.\n`,
    "OPERATIONS.md": `# Operations Contract\n\n${input.architecturePlan.observabilityContract.map((item) => `- ${item}`).join("\n")}\n\nFailures must be observable and recoverable. Operational signals are not revenue proof.\n`,
    ".money-scout/product-definition.json": pretty(input.productDefinition),
    ".money-scout/architecture-plan.json": pretty(input.architecturePlan),
    ".money-scout/build-contract.json": pretty(input.buildContract),
    ".money-scout/capability-bindings.json": pretty(
      input.architecturePlan.capabilityBindings,
    ),
  };
}

export function validateBuilderRepositoryOutput(input: {
  originalManifestFiles: Record<string, string>;
  resultingManifestFiles: Record<string, string>;
  changedPaths: string[];
  branchName: string;
  expectedBranchName: string;
  secretMatches: string[];
  allowNoop: boolean;
}): string[] {
  const defects: string[] = [];
  if (input.branchName !== input.expectedBranchName) {
    defects.push("BUILDER_BRANCH_IDENTITY_MISMATCH");
  }
  for (const [path, content] of Object.entries(input.originalManifestFiles)) {
    if (input.resultingManifestFiles[path] !== content) {
      defects.push(`BUILDER_REWROTE_FROZEN_CONTRACT:${path}`);
    }
  }
  if (!input.changedPaths.length && !input.allowNoop) {
    defects.push("BUILDER_EMPTY_DIFF_WITHOUT_EXPLANATION");
  }
  if (input.secretMatches.length) {
    defects.push("BUILDER_OUTPUT_CONTAINS_POTENTIAL_SECRET");
  }
  return defects;
}
