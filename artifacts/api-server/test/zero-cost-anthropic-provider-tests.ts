import assert from "node:assert/strict";
import {
  configureAnthropicProviderEnvironment,
  selectAnthropicProvider,
} from "../src/lib/anthropic-provider";

const directEnv: NodeJS.ProcessEnv = {
  ANTHROPIC_API_KEY: "direct-key",
  AI_INTEGRATIONS_ANTHROPIC_API_KEY: "managed-key",
  AI_INTEGRATIONS_ANTHROPIC_BASE_URL: "https://managed.example",
};
const directSelection = configureAnthropicProviderEnvironment(directEnv);
assert.equal(directSelection.source, "DIRECT");
assert.equal(directSelection.baseUrl, "https://api.anthropic.com");
assert.equal(directEnv.AI_INTEGRATIONS_ANTHROPIC_API_KEY, "direct-key");
assert.equal(directEnv.AI_INTEGRATIONS_ANTHROPIC_BASE_URL, "https://api.anthropic.com");

const customDirectEnv: NodeJS.ProcessEnv = {
  ANTHROPIC_API_KEY: "direct-key",
  ANTHROPIC_BASE_URL: "https://direct-proxy.example",
};
const customDirectSelection = configureAnthropicProviderEnvironment(customDirectEnv);
assert.equal(customDirectSelection.source, "DIRECT");
assert.equal(customDirectSelection.baseUrl, "https://direct-proxy.example");
assert.equal(customDirectEnv.AI_INTEGRATIONS_ANTHROPIC_BASE_URL, "https://direct-proxy.example");

const managedEnv: NodeJS.ProcessEnv = {
  AI_INTEGRATIONS_ANTHROPIC_API_KEY: "managed-key",
  AI_INTEGRATIONS_ANTHROPIC_BASE_URL: "https://managed.example",
};
const managedSelection = configureAnthropicProviderEnvironment(managedEnv);
assert.equal(managedSelection.source, "REPLIT_MANAGED");
assert.equal(managedEnv.AI_INTEGRATIONS_ANTHROPIC_API_KEY, "managed-key");
assert.equal(managedEnv.AI_INTEGRATIONS_ANTHROPIC_BASE_URL, "https://managed.example");

assert.deepEqual(selectAnthropicProvider({}), {
  source: "UNAVAILABLE",
  apiKeyPresent: false,
  baseUrl: null,
});

console.log("PASS zero-cost Anthropic provider selection");
