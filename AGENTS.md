# Agent Notes

## Bun Workspace Symlink Issue

**Issue:** Bun's workspace symlink resolution has a bug where `@tanstack/react-query` and its dependencies create nested `.bun` directories with relative symlinks that don't resolve correctly. This is a known issue with Bun workspaces.

**Workaround:** If you encounter module resolution errors with `@tanstack/react-query` or similar packages in workspaces, try:

```bash
rm -rf node_modules bun.lock
bun install
```

Or use npm instead:
```bash
rm -rf node_modules bun.lock
npm install
```

## Bun-only Verified Fix (apps/web)

**Observed failure in this repo:** `apps/web` may fail to build with `Could not resolve: "@tanstack/react-query"` even after a clean `bun install`.

**Verified root cause:** with `@tanstack/react-query@5.94.4`, Bun can install a package layout missing the `build` directory (only `src` exists), so bundling fails at import resolution time.

**Team-safe Bun-only fix (verified):**
1. Pin `apps/web` to `@tanstack/react-query@5.90.5`
2. Reinstall with Bun
3. Verify build/dev from `apps/web`

```bash
# from repo root
bun --cwd apps/web add @tanstack/react-query@5.90.5
bun --cwd apps/web install
bun --cwd apps/web run build
bun --cwd apps/web run dev
```

If you hit the same error again, do not switch to npm by default; use the Bun-only version pin above first.
