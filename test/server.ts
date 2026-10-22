import { join } from "node:path";

const dist = join(import.meta.dir, "../dist");
const index = Bun.file(join(dist, "index.html"));
if (!(await index.exists())) {
  throw new Error("Missing dist/index.html; run bun run build before the E2E tests.");
}

const routes: Record<string, Response> = {};
for await (const path of new Bun.Glob("**/*").scan({ cwd: dist, onlyFiles: true })) {
  if (path !== "_headers" && path !== "_redirects") {
    routes[`/${path}`] = new Response(Bun.file(join(dist, path)));
  }
}
routes["/"] = new Response(index);

// oxlint-disable-next-line vitest/require-hook -- Standalone web server, not a test suite.
Bun.serve({
  hostname: "localhost",
  port: 3000,
  routes,
  fetch() {
    return new Response("Not found", { status: 404 });
  },
});
