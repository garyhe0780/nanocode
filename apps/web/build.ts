#!/usr/bin/env bun
import plugin from "bun-plugin-tailwind";
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";

const outdir = "dist";

if (existsSync(outdir)) {
  await rm(outdir, { recursive: true, force: true });
}

const result = await Bun.build({
  entrypoints: ["src/index.ts"],
  outdir,
  target: "bun",
  plugins: [plugin],
});

if (!result.success) {
  console.error("Build failed");
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

console.log("Build completed");
