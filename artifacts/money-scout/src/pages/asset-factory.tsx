import { useQuery } from "@tanstack/react-query";
import { Boxes, GitBranch, ShieldCheck, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FactoryRun = {
  id: number;
  opportunityId: number;
  betId: number;
  status: string;
  productDefinitionId: number | null;
  architecturePlanId: number | null;
  assetRepositoryId: number | null;
  buildJobId: number | null;
  blockerCode: string | null;
  nextAction: string;
  updatedAt: string;
};

type FactoryDetail = {
  run: FactoryRun;
  product_definition: {
    version: number;
    status: string;
    fingerprint: string;
  } | null;
  architecture_plan: {
    version: number;
    status: string;
    fingerprint: string;
    document: {
      capabilityBindings?: Array<{
        familyKey: string;
        implementationKey: string | null;
        version: number | null;
        outcome: string;
      }>;
    };
  } | null;
  review_defects: Array<{
    id: number;
    reviewStage: string;
    severity: string;
    summary: string;
    resolvedAt: string | null;
  }>;
  asset_repository: {
    assetKey: string;
    internalSlug: string;
    status: string;
    repositoryUrl: string | null;
    defaultBranch: string;
    baseCommitSha: string | null;
  } | null;
  build_job: {
    id: number;
    status: string;
    resultCommitSha: string | null;
    contract: { schemaVersion: number };
  } | null;
  builder_gateway_runs: Array<{
    id: number;
    provider: string;
    status: string;
    terminalOutcome: string | null;
    branchName: string;
    resultCommitSha: string | null;
    challenge: Record<string, unknown> | null;
  }>;
};

const tone = (status: string): "default" | "secondary" | "destructive" =>
  ["READY_FOR_BUILDER", "SUCCEEDED", "FROZEN"].includes(status)
    ? "default"
    : status.includes("BLOCKED") ||
        status === "FAILED" ||
        status === "CHALLENGED"
      ? "destructive"
      : "secondary";

function RunCard({ run }: { run: FactoryRun }) {
  const detail = useQuery<FactoryDetail>({
    queryKey: ["asset-factory", run.id],
    queryFn: async () => {
      const response = await fetch(`/api/asset-factory/runs/${run.id}`, {
        credentials: "include",
      });
      if (!response.ok)
        throw new Error(`Factory detail returned ${response.status}`);
      return response.json();
    },
    refetchInterval: 10_000,
  });
  const value = detail.data;
  const gateway = value?.builder_gateway_runs[0];
  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base">
            Factory #{run.id} · Bet #{run.betId}
          </CardTitle>
          <Badge variant={tone(run.status)}>{run.status}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Opportunity #{run.opportunityId} · {run.nextAction}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Product Definition
            </p>
            <p className="mt-1">
              {value?.product_definition
                ? `v${value.product_definition.version} · ${value.product_definition.status}`
                : "Pending"}
            </p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Architecture Plan
            </p>
            <p className="mt-1">
              {value?.architecture_plan
                ? `v${value.architecture_plan.version} · ${value.architecture_plan.status}`
                : "Pending"}
            </p>
          </div>
        </div>
        {value?.architecture_plan?.document.capabilityBindings?.length ? (
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Capability bindings
            </p>
            <p className="mt-1 text-muted-foreground">
              {value.architecture_plan.document.capabilityBindings
                .map(
                  (binding) =>
                    `${binding.familyKey}: ${binding.implementationKey ? `${binding.implementationKey}@${binding.version}` : binding.outcome}`,
                )
                .join(" · ")}
            </p>
          </div>
        ) : null}
        <div className="flex items-start gap-2">
          <GitBranch className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div>
            <p>
              {value?.asset_repository
                ? `${value.asset_repository.assetKey} · ${value.asset_repository.status}`
                : "Repository pending"}
            </p>
            <p className="break-all text-xs text-muted-foreground">
              {gateway
                ? `${gateway.provider} · ${gateway.status}${gateway.terminalOutcome ? ` · ${gateway.terminalOutcome}` : ""} · ${gateway.branchName} @ ${gateway.resultCommitSha ?? "commit pending"}`
                : value?.build_job
                  ? `Build #${value.build_job.id} · contract v${value.build_job.contract.schemaVersion} · ${value.build_job.status}`
                  : "Builder handoff pending"}
            </p>
          </div>
        </div>
        {value?.review_defects
          .filter((defect) => !defect.resolvedAt)
          .map((defect) => (
            <div
              key={defect.id}
              className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3"
            >
              <Wrench className="h-4 w-4 text-destructive" />
              <p>
                <strong>
                  {defect.reviewStage} {defect.severity}:
                </strong>{" "}
                {defect.summary}
              </p>
            </div>
          ))}
        <div className="flex gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          Factory/Bet authority grants no provider spend, charging, release,
          outbound, ads, production credentials, or custom domain.
        </div>
      </CardContent>
    </Card>
  );
}

export default function AssetFactoryPage() {
  const query = useQuery<{ runs: FactoryRun[] }>({
    queryKey: ["asset-factory"],
    queryFn: async () => {
      const response = await fetch("/api/asset-factory/runs", {
        credentials: "include",
      });
      if (!response.ok)
        throw new Error(`Factory runs returned ${response.status}`);
      return response.json();
    },
    refetchInterval: 10_000,
  });
  const runs = query.data?.runs ?? [];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Boxes className="h-6 w-6" />
          Asset Factory
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Frozen product scope, architecture, reusable capability decisions,
          repository identity, and exact builder/QA handoff.
        </p>
      </div>
      {query.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading Factory runs…</p>
      ) : query.isError ? (
        <p className="text-sm text-destructive">
          Unable to load Factory state.
        </p>
      ) : runs.length ? (
        <div className="grid gap-4">
          {runs.map((run) => (
            <RunCard key={run.id} run={run} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No approved Bet has entered the Asset Factory.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
