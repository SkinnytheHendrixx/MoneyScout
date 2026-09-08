import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";

const here = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(here, "../..");
const output = "/tmp/money-scout-zero-cost-demand-tests.mjs";

await build({
  entryPoints: [path.join(here, "test/zero-cost-demand-tests.tsx")],
  outfile: output,
  bundle: true,
  platform: "node",
  format: "esm",
  sourcemap: "inline",
  alias: {
    "@": path.join(workspace, "artifacts/money-scout/src"),
  },
  external: ["pg-native"],
  plugins: [esbuildPluginPino({ transports: ["pino-pretty"] })],
});

process.env.NODE_ENV = "test";
await import(`file://${output}`);