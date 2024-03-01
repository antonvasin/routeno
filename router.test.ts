import { createRouter } from "./mod.ts";
import * as t from "https://deno.land/std@0.149.0/testing/asserts.ts";

function echoParamsJSON(
  _req: Request,
  params?: Partial<Record<string, string>>,
) {
  return Promise.resolve(
    new Response(JSON.stringify(params), {
      headers: { "Content-Type": "application/json" },
    }),
  );
}

const baseUrl = "http://localhost";

Deno.test("Matches routes", async () => {
  const router = createRouter({
    "/user/:id": {
      "GET": echoParamsJSON,
      "POST": echoParamsJSON,
    },
    "/ping": () => new Response("Pong"),
  });

  const user = await router(
    new Request(baseUrl + "/user/123", { "method": "GET" }),
  );

  t.assertEquals(user.status, 200);
  t.assertEquals((await user.json()).id, "123");
  t.assertEquals(
    (await router(new Request(baseUrl + "/user/123", { method: "POST" })))
      .status,
    200,
  );
  t.assertEquals((await router(new Request(baseUrl + "/ping"))).status, 200);
});

Deno.test("Return 404 on unknown route", async () => {
  const router = createRouter({
    "/user/:id": echoParamsJSON,
  });

  t.assertEquals(
    (await router(new Request(baseUrl + "/unknown", { method: "POST" })))
      .status,
    404,
  );
});
