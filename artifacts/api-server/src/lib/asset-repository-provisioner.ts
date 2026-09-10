export type AssetRepositoryProvisionInput = {
  assetKey: string;
  internalSlug: string;
  idempotencyKey: string;
  defaultBranch: string;
  manifestFiles: Record<string, string>;
};

export type AssetRepositoryProvisionResult = {
  provider: string;
  repositoryExternalId: string;
  repositoryUrl: string;
  defaultBranch: string;
  baseCommitSha: string;
};

export interface AssetRepositoryProvisioner {
  readonly provider: string;
  provision(
    input: AssetRepositoryProvisionInput,
  ): Promise<AssetRepositoryProvisionResult>;
}

const cleanBaseUrl = (value: string): string => value.replace(/\/+$/, "");

export function configuredAssetRepositoryProvisioner(): AssetRepositoryProvisioner | null {
  const baseUrl = process.env.MONEY_SCOUT_REPOSITORY_PROVISIONER_URL?.trim();
  if (!baseUrl) return null;
  return createHttpAssetRepositoryProvisioner({
    provider:
      process.env.MONEY_SCOUT_REPOSITORY_PROVISIONER_PROVIDER?.trim() ||
      "GENERIC_GIT",
    baseUrl,
    token: process.env.MONEY_SCOUT_REPOSITORY_PROVISIONER_TOKEN?.trim() || null,
  });
}

export function createHttpAssetRepositoryProvisioner(config: {
  provider: string;
  baseUrl: string;
  token: string | null;
}): AssetRepositoryProvisioner {
  return {
    provider: config.provider,
    async provision(input) {
      const response = await fetch(
        `${cleanBaseUrl(config.baseUrl)}/v1/repositories`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(config.token
              ? { authorization: `Bearer ${config.token}` }
              : {}),
          },
          body: JSON.stringify({
            asset_key: input.assetKey,
            internal_slug: input.internalSlug,
            idempotency_key: input.idempotencyKey,
            default_branch: input.defaultBranch,
            files: input.manifestFiles,
            visibility: "private",
          }),
          signal: AbortSignal.timeout(30_000),
        },
      );
      const raw = await response.text();
      if (!response.ok) {
        throw new Error(
          `REPOSITORY_PROVISIONER_HTTP_${response.status}:${raw.slice(0, 1_000)}`,
        );
      }
      let value: Record<string, unknown>;
      try {
        value = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        throw new Error(
          "REPOSITORY_PROVISIONER_INVALID_RESPONSE: expected JSON",
        );
      }
      const repositoryExternalId = String(
        value.repository_external_id ??
          value.repositoryExternalId ??
          value.id ??
          "",
      ).trim();
      const repositoryUrl = String(
        value.repository_url ?? value.repositoryUrl ?? value.url ?? "",
      ).trim();
      const defaultBranch = String(
        value.default_branch ?? value.defaultBranch ?? input.defaultBranch,
      ).trim();
      const baseCommitSha = String(
        value.base_commit_sha ?? value.baseCommitSha ?? value.commit_sha ?? "",
      ).trim();
      if (
        !repositoryExternalId ||
        !repositoryUrl ||
        !defaultBranch ||
        !/^[0-9a-f]{7,64}$/i.test(baseCommitSha)
      ) {
        throw new Error(
          "REPOSITORY_PROVISIONER_INVALID_RESPONSE: repository identity, URL, branch, and exact base commit SHA are required",
        );
      }
      return {
        provider: config.provider,
        repositoryExternalId,
        repositoryUrl,
        defaultBranch,
        baseCommitSha,
      };
    },
  };
}

export function createZeroCostRepositoryFixtureProvisioner(): AssetRepositoryProvisioner {
  const records = new Map<string, AssetRepositoryProvisionResult>();
  return {
    provider: "ZERO_COST_FIXTURE_GIT",
    async provision(input) {
      const existing = records.get(input.idempotencyKey);
      if (existing) return existing;
      const result = {
        provider: "ZERO_COST_FIXTURE_GIT",
        repositoryExternalId: `fixture:${input.assetKey}`,
        repositoryUrl: `fixture://repositories/${input.internalSlug}`,
        defaultBranch: input.defaultBranch,
        baseCommitSha: "0".repeat(40),
      };
      records.set(input.idempotencyKey, result);
      return result;
    },
  };
}
