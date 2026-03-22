import webApp from "./index.html";

const PORT = Number(process.env.PORT || "3002");

const server = Bun.serve({
  port: PORT,
  routes: {
    "/": webApp,
  },
  fetch() {
    return new Response("Not Found", { status: 404 });
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`Web UI running on ${server.url}`);
