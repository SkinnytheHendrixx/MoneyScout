import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  PauseCircle,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type Bucket = {
  allocated: number | null;
  committed: number;
  consumed: number;
  remaining: number | null;
  unit: string;
};
type Bet = {
  id: number;
  opportunityId: number;
  status: string;
  decisionContract: {
    thesis: string;
    rationale: string;
    keyRisks: string[];
    unknowns: string[];
    successCriteria: string[];
    failureCriteria: string[];
  };
  resourceEnvelope: { externalCash: Bucket; autonomousCapacity: Bucket };
  buildEnvelope: {
    maximumExternalBuildSpendCents: number;
    onlyExistingZeroCashCapabilities: boolean;
    permittedProductScope: string[];
  };
  primaryRisk: string | null;
  blockerCode: string | null;
  nextAction: string;
  downstream_builds: Array<{
    id: number;
    status: string;
    productShape: string;
  }>;
};

const money = (value: number | null) =>
  value == null
    ? "Unknown"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value / 100);
const statusTone = (status: string): "default" | "destructive" | "secondary" =>
  status === "ACTIVE" || status === "APPROVED"
    ? "default"
    : status === "EXHAUSTED" || status === "WITHDRAWN"
      ? "destructive"
      : "secondary";

export default function BetsPage() {
  const query = useQuery<{ bets: Bet[] }>({
    queryKey: ["bets"],
    queryFn: async () => {
      const response = await fetch("/api/bets", { credentials: "include" });
      if (!response.ok) throw new Error(`Bets returned ${response.status}`);
      return response.json();
    },
    refetchInterval: 15_000,
  });
  const bets = query.data?.bets ?? [];
  const committed = bets
    .filter((bet) => ["APPROVED", "ACTIVE", "PAUSED"].includes(bet.status))
    .reduce((sum, bet) => sum + bet.resourceEnvelope.externalCash.committed, 0);
  const consumed = bets.reduce(
    (sum, bet) => sum + bet.resourceEnvelope.externalCash.consumed,
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Bets & capital
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Explicit investment decisions between underwriting and Build.
          Allocation never grants downstream authority.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Active allocations
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {
              bets.filter(
                (bet) => bet.status === "ACTIVE" || bet.status === "APPROVED",
              ).length
            }
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Downstream committed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {money(committed)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Actually consumed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {money(consumed)}
          </CardContent>
        </Card>
      </div>
      {query.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading Bets…</p>
      ) : query.isError ? (
        <p className="text-sm text-destructive">Unable to load Bet state.</p>
      ) : bets.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Target className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No Bet has been proposed.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              A BUILD verdict remains an opportunity thesis until a separate
              bounded allocation is approved.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {bets.map((bet) => {
            const cash = bet.resourceEnvelope.externalCash;
            const pct =
              cash.allocated && cash.allocated > 0
                ? Math.min(
                    100,
                    Math.round((cash.consumed / cash.allocated) * 100),
                  )
                : 0;
            const Icon =
              bet.status === "EXHAUSTED"
                ? AlertTriangle
                : bet.status === "PAUSED"
                  ? PauseCircle
                  : bet.status === "SUCCEEDED"
                    ? CheckCircle2
                    : CircleDollarSign;
            return (
              <Card key={bet.id} className="overflow-hidden">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">
                        Bet #{bet.id} · Opportunity #{bet.opportunityId}
                      </CardTitle>
                    </div>
                    <Badge variant={statusTone(bet.status)}>{bet.status}</Badge>
                  </div>
                  <p className="text-sm leading-6">
                    {bet.decisionContract.thesis}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                      <span>{money(cash.consumed)} consumed</span>
                      <span>
                        {money(cash.remaining)} remaining of{" "}
                        {money(cash.allocated)}
                      </span>
                    </div>
                    <Progress value={pct} />
                    <p className="mt-2 text-xs text-muted-foreground">
                      {money(cash.committed)} independently authorized
                      downstream; Bet approval itself grants $0 provider spend.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Primary risk
                      </p>
                      <p className="mt-1 text-sm">
                        {bet.primaryRisk ?? "Explicitly unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Trying to prove
                      </p>
                      <p className="mt-1 text-sm">
                        {bet.decisionContract.successCriteria[0] ??
                          "No success criterion recorded"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Stop contract
                    </p>
                    <p className="mt-1 text-sm">
                      {bet.decisionContract.failureCriteria[0] ??
                        "No withdrawal criterion recorded"}
                    </p>
                  </div>
                  <div className="rounded-md border bg-muted/40 p-3">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Current activity / next action
                    </p>
                    <p className="mt-1 text-sm">
                      {bet.blockerCode ? `${bet.blockerCode}: ` : ""}
                      {bet.nextAction}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {bet.downstream_builds.length
                        ? `${bet.downstream_builds.length} linked Build(s): ${bet.downstream_builds.map((build) => `${build.productShape} ${build.status}`).join(", ")}`
                        : "No downstream Build initiated."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
