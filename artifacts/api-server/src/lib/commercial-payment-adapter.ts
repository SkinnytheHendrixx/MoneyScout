export type CommercialPreparationInput = {
  assetId: number;
  opportunityId: number;
  providerOperationKey: string;
  currency: "USD";
  priceCents: number;
  productionUrl: string;
  promisedOutcome: string;
};

export type CommercialPreparationResult = {
  checkoutReference: string;
  chargingEnabled: false;
  metadata?: Record<string, unknown>;
};

export type CommercialActivationResult = {
  checkoutReference: string;
  transactionReady: boolean;
  chargingEnabled: boolean;
  metadata?: Record<string, unknown>;
};

export interface CommercialPaymentAdapter {
  provider: string;
  costMode: "ZERO_CASH";
  prepare(input: CommercialPreparationInput): Promise<CommercialPreparationResult>;
  activateAndVerify(input: CommercialPreparationInput & { checkoutReference: string }): Promise<CommercialActivationResult>;
}

const adapters = new Map<string, CommercialPaymentAdapter>();

export function registerCommercialPaymentAdapter(adapter: CommercialPaymentAdapter): void {
  if (adapter.costMode !== "ZERO_CASH") throw new Error("COMMERCIAL_ADAPTER_MUST_BE_ZERO_CASH");
  adapters.set(adapter.provider, adapter);
}

export function clearCommercialPaymentAdapters(): void {
  adapters.clear();
}

export function getCommercialPaymentAdapter(provider: string): CommercialPaymentAdapter | null {
  return adapters.get(provider) ?? null;
}

export function createZeroCostCommercialFixtureAdapter(provider = "ZERO_COST_PAYMENT_FIXTURE"): CommercialPaymentAdapter {
  return {
    provider,
    costMode: "ZERO_CASH",
    async prepare(input) {
      return {
        checkoutReference: `fixture-checkout:${input.providerOperationKey}`,
        chargingEnabled: false,
        metadata: { fixture: true, real_external_charge_possible: false },
      };
    },
    async activateAndVerify(input) {
      return {
        checkoutReference: input.checkoutReference,
        transactionReady: true,
        chargingEnabled: true,
        metadata: { fixture: true, verified_without_external_charge: true },
      };
    },
  };
}

export function registerConfiguredCommercialHttpAdapter(): void {
  const provider = process.env.MONEY_SCOUT_PAYMENT_PROVIDER?.trim();
  const bridgeUrl = process.env.MONEY_SCOUT_PAYMENT_BRIDGE_URL?.trim();
  const bridgeToken = process.env.MONEY_SCOUT_PAYMENT_BRIDGE_TOKEN?.trim();
  if (!provider || !bridgeUrl || !bridgeToken) return;
  const call = async (path: string, body: Record<string, unknown>) => {
    const response = await fetch(`${bridgeUrl.replace(/\/$/, "")}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${bridgeToken}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });
    const raw = await response.text();
    if (!response.ok) throw new Error(`PAYMENT_BRIDGE_${response.status}:${raw.slice(0, 500)}`);
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return parsed;
  };
  registerCommercialPaymentAdapter({
    provider,
    costMode: "ZERO_CASH",
    async prepare(input) {
      const result = await call("/commercial/prepare", { ...input, charging_enabled: false, external_spend_ceiling_cents: 0 });
      if (typeof result.checkout_reference !== "string" || result.charging_enabled !== false) {
        throw new Error("PAYMENT_BRIDGE_UNSAFE_PREPARATION_RESPONSE");
      }
      return { checkoutReference: result.checkout_reference, chargingEnabled: false, metadata: result };
    },
    async activateAndVerify(input) {
      const result = await call("/commercial/activate", { ...input, customer_charging_authorized: true, external_spend_ceiling_cents: 0 });
      if (typeof result.checkout_reference !== "string") throw new Error("PAYMENT_BRIDGE_INVALID_ACTIVATION_RESPONSE");
      return {
        checkoutReference: result.checkout_reference,
        transactionReady: result.transaction_ready === true,
        chargingEnabled: result.charging_enabled === true,
        metadata: result,
      };
    },
  });
}
