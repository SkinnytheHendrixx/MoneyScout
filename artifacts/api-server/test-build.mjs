import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { build } from "esbuild";

globalThis.require = createRequire(import.meta.url);

const here = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(here, "../..");
const output = "/tmp/money-scout-zero-cost-research-tests.mjs";

await build({
  entryPoints: [path.join(here, "test/zero-cost-research-suite.ts")],
  outfile: output,
  bundle: true,
  platform: "node",
  format: "esm",
  jsx: "automatic",
  sourcemap: "inline",
  alias: {
    "@": path.join(workspace, "artifacts/money-scout/src"),
    "react": path.join(workspace, "artifacts/money-scout/node_modules/react/index.js"),
    "react/jsx-runtime": path.join(
      workspace,
      "artifacts/money-scout/node_modules/react/jsx-runtime.js",
    ),
  },
  external: ["pg-native"],
});

process.env.NODE_ENV = "test";
await import(`file://${output}`);
