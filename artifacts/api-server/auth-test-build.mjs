import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { build } from "esbuild";

globalThis.require = createRequire(import.meta.url);

const here = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(here, "../..");
const output = "/tmp/money-scout-zero-cost-auth-tests.mjs";

await build({
  entryPoints: [path.join(here, "test/zero-cost-auth-tests.ts")],
  outfile: output,
  bundle: true,
  platform: "node",
  format: "esm",
  sourcemap: "inline",
  external: ["pg-native"],
});

process.env.NODE_ENV = "test";
await import(`file://${output}`);