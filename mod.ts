export type RouteHandler<Params extends string = string> = (
  req: Request,
  params?: Record<Params, string>,
) => Promise<Response> | Response;

export type RouteMap = Record<
  string,
  RouteHandler | Record<string, RouteHandler>
>;

function methods(routes: Record<string, RouteHandler>): RouteHandler {
  return (req, params) => {
    if (req.method in routes) {
      return routes[req.method](req, params);
    } else {
      return new Response(null, { status: 405 });
    }
  };
}

/**
 * Creates router handler with RouteMap config
 *
 * ```ts
 * const router = createRouter({
 *   '/api/projects': { // Different methods
 *     'GET': getProjects,
 *     'POST': createProject
 *   },
 *   '/api/projects/:id': {
 *     'GET': (req, params) => getProject(req, params) // { id: 'abd2193df12c' }
 *   },
 *   '/api/check': check, // Any method
 * })
 *
 * await serve(router);
 * ```
 */
export function createRouter(routeMap: RouteMap) {
  const routes = new Map<URLPattern, RouteHandler>();

  for (const route in routeMap) {
    const url = new URLPattern({ pathname: route });
    const handleDefintion = routeMap[route];

    if (typeof handleDefintion === "function") {
      routes.set(url, handleDefintion);
    } else {
      routes.set(url, methods(handleDefintion));
    }
  }

  return (req: Request) => {
    for (const [pattern, handler] of routes) {
      if (pattern.test(req.url)) {
        const params = pattern.exec(req.url)?.pathname.groups;
        return handler(req, params);
      }
    }

    return new Response(null, { status: 404 });
  };
}
