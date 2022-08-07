# routeno

Small opinionated router for Deno.

- Uses `URLPattern` for route matching which supports Express-like route params
- Does not extend `Request` or have any helper functions
- Strives to be very simple and very minimal

## Usage

```typescript
import { createRouter } from 'https://deno.land/x/routeno@0.1.0/mod.ts';
import { serve } from 'https://deno.land/std@0.145.0/http/mod.ts';

function getProject(req: Request, params: Record<'id', string>) {
  return new Response(getProjectById(params.id));
}

const router = createRouter({
  '/api/projects': {
    'GET': getProjects,
    'POST': createProject,
  },
  '/api/projects/:id': {
    'GET': getProject,
  },
  '/api/check': check, // Will respond to any HTTP method
});

await serve(router);
```

## Design

Goal is to have tiny wrapper around standard `Request`, `Response` and `URLPattern` workflow.

It doesn't have middleware interface (e.g. `router.get('/route', endpoint)`) and accepts mapping object instead.

Router does not extend default `Request` object and instead passes route params as second argument to handler function.

## Performance

This router written to be as fast as possible while using `URLPattern` (which uses `path-to-regexp`), which is slower
than, e.g. using Radix Trees or RegEx for matching.

Benchmark script with comparison to several popular Deno routers is available. Run it with `deno bench --unstable`.
