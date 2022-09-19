import { createRouter } from "./mod.ts";
import {
  createRouteMap as createRenoMap,
  createRouter as createReno,
  forMethod,
} from "https://deno.land/x/reno@v2.0.59/reno/mod.ts";

import { Node } from "https://deno.land/x/router@v2.0.1/mod.ts";

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

const routerr = new Node();
routerr.add("/endpoint", () => new Response("Hello"));
routerr.add(
  "/endpoint2/:id",
  (params: unknown) =>
    new Response(JSON.stringify(params), {
      headers: { "Content-Type": "application/json" },
    }),
);
// Minimal server implementation since router doesn't work with Request objects
const routeWithRouter = (req: Request) => {
  const [h, p] = routerr.find(req.url);

  if (h) {
    return h(p);
  } else {
    return new Response("Not Found", { status: 404 });
  }
};

const baseUrl = "http://localhost";
const urlParams = new URLSearchParams({ param1: "foo" });
urlParams.append("param2", "abc");
urlParams.append("param2", "cde");
const queryString = urlParams.toString();

// routeno benchmarks

// @ts-ignore unstable
Deno.bench("routeno GET", { group: "GET", baseline: true }, async () => {
  await router(new Request(`${baseUrl}/endpoint`));
});

// @ts-ignore unstable
Deno.bench("routeno GET + params", { group: "GET + params", baseline: true }, async () => {
  await router(new Request(`${baseUrl}/endpoint?${queryString}`));
});

// @ts-ignore unstable
Deno.bench("routeno POST", { group: "POST", baseline: true }, async () => {
  await router(
    new Request(`${baseUrl}/endpoint2/123123123`, { method: "POST" }),
  );
});

// reno benchmarks

// @ts-ignore unstable
Deno.bench("reno GET", { group: "GET" }, async () => {
  await reno(new Request(`${baseUrl}/endpoint`));
});

// @ts-ignore unstable
Deno.bench("reno GET + params", { group: "GET + params" }, async () => {
  await reno(new Request(`${baseUrl}/endpoint?${queryString}`));
});

// @ts-ignore unstable
Deno.bench("reno POST", { group: "POST" }, async () => {
  await reno(
    new Request(`${baseUrl}/endpoint2/123123123`, { method: "POST" }),
  );
});

// router benchmarks

// @ts-ignore unstable
Deno.bench("router GET", { group: "GET" }, () => {
  routeWithRouter(new Request(`${baseUrl}/endpoint`));
});

// @ts-ignore unstable
Deno.bench("router GET + params", { group: "GET + params" }, () => {
  routeWithRouter(new Request(`${baseUrl}/endpoint?${queryString}`));
});

// @ts-ignore unstable
Deno.bench("router POST", { group: "POST" }, () => {
  routeWithRouter(
    new Request(`${baseUrl}/endpoint2/123123123`, { method: "POST" }),
  );
});
