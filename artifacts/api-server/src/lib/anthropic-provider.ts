export type AnthropicProviderSource = "DIRECT" | "REPLIT_MANAGED" | "UNAVAILABLE";

export type AnthropicProviderSelection = {
  source: AnthropicProviderSource;
  apiKeyPresent: boolean;
  baseUrl: string | null;
};

const DIRECT_BASE_URL = "https://api.anthropic.com";

const nonempty = (value: string | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

export const selectAnthropicProvider = (
  env: NodeJS.ProcessEnv = process.env,
): AnthropicProviderSelection => {
  const directApiKey = nonempty(env.ANTHROPIC_API_KEY);
  if (directApiKey) {
    return {
      source: "DIRECT",
      apiKeyPresent: true,
      baseUrl: nonempty(env.ANTHROPIC_BASE_URL) ?? DIRECT_BASE_URL,
    };
  }

  const managedApiKey = nonempty(env.AI_INTEGRATIONS_ANTHROPIC_API_KEY);
  const managedBaseUrl = nonempty(env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL);
  if (managedApiKey && managedBaseUrl) {
    return {
      source: "REPLIT_MANAGED",
      apiKeyPresent: true,
      baseUrl: managedBaseUrl,
    };
  }

  return { source: "UNAVAILABLE", apiKeyPresent: false, baseUrl: null };
};

export const configureAnthropicProviderEnvironment = (
  env: NodeJS.ProcessEnv = process.env,
): AnthropicProviderSelection => {
  const directApiKey = nonempty(env.ANTHROPIC_API_KEY);
  if (directApiKey) {
    // Existing research workers intentionally read the Replit integration variable names.
    // Remap them at process startup so every bounded worker uses the direct Anthropic
    // account without duplicating credential-selection logic or weakening spend controls.
    env.AI_INTEGRATIONS_ANTHROPIC_API_KEY = directApiKey;
    env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL =
      nonempty(env.ANTHROPIC_BASE_URL) ?? DIRECT_BASE_URL;
  }
  return selectAnthropicProvider(env);
};

export const anthropicProviderSelection = configureAnthropicProviderEnvironment();
