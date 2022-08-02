import { createRouter } from "./router.ts";
import {
  createRouteMap as createRenoMap,
  createRouter as createReno,
  forMethod,
} from "https://deno.land/x/reno@v2.0.24/reno/mod.ts";

const router = createRouter({
  "/endpoint": () => new Response("Hello"),
  "/endpoint2/:id": {
    POST: (_req, params) =>
      Promise.resolve(
        new Response(JSON.stringify(params), {
          headers: { "Content-Type": "application/json" },
        }),
      ),
  },
});

const reno = createReno(createRenoMap([
  ["/endpoint", () => new Response("Hello")],
  [
    /\/endpoint2\/?(\d+\w+)/,
    forMethod([
      ["POST", (req) =>
        Promise.resolve(
          new Response(JSON.stringify({ id: req.routeParams[0] }), {
            headers: { "Content-Type": "application/json" },
          }),
        )],
    ]),
  ],
]));

const baseUrl = "http://localhost";
const urlParams = new URLSearchParams({ param1: "foo" });
urlParams.append("param2", "abc");
urlParams.append("param2", "cde");
const queryString = urlParams.toString();

// routeno benchmarks

// @ts-ignore unstable
Deno.bench("GET routeno", { group: "GET" }, async () => {
  await router(new Request(`${baseUrl}/endpoint`));
});

// @ts-ignore unstable
Deno.bench("GET + params routeno", { group: "GET + params" }, async () => {
  await router(new Request(`${baseUrl}/endpoint?${queryString}`));
});

// @ts-ignore unstable
Deno.bench("POST routeno", { group: "POST" }, async () => {
  await router(
    new Request(`${baseUrl}/endpoint2/123123123`, { method: "POST" }),
  );
});

// reno benchmarks

// @ts-ignore unstable
Deno.bench("GET reno", { group: "GET" }, async () => {
  await reno(new Request(`${baseUrl}/endpoint`));
});

// @ts-ignore unstable
Deno.bench("GET + params reno", { group: "GET + params" }, async () => {
  await reno(new Request(`${baseUrl}/endpoint?${queryString}`));
});

// @ts-ignore unstable
Deno.bench("POST reno", { group: "POST" }, async () => {
  await reno(
    new Request(`${baseUrl}/endpoint2/123123123`, { method: "POST" }),
  );
});
