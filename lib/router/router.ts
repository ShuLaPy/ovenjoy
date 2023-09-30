import {
  Handler,
  HttpMethodTypes,
  HttpMethods,
  Middleware,
  RequestMapTypes,
} from '@ovenjoy-types';
import OvenjoyRadixRouter from './radixTreeRouter';

class Router implements HttpMethods {
  private static router?: Router;
  private readonly requestMap: RequestMapTypes = {};

  constructor(private routerOptions?: any) {
    if (Router.router) {
      return Router.router;
    }
    Router.router = this;
  }

  // Make sure we return same instance when called multiple times
  public static getInstance(options = {}): Router {
    if (!Router.router) {
      Router.router = new Router(options);
    }

    return Router.router;
  }

  /**
   * Registers a route with the specified path and request handlers.
   *
   * @param {string} path - The URL path for the route.
   * @param {...Handler} handlers - Middlewares and The request handler functions to execute for the route.
   *
   * @example
   * const middlewareFunction1 = function (req, res, next) {
   *   console.log("Middleware One");
   *   next();
   * };
   *
   * router.get("/admin", middlewareFunction1, function (req, res) {
   *   res.send("Admin Homepage");
   * });
   *
   */

  get(path: string, ...handlers: Handler[]) {
    this.register(path, 'GET', handlers);
  }

  delete(path: string, ...handlers: Handler[]) {
    this.register(path, 'DELETE', handlers);
  }

  head(path: string, ...handlers: Handler[]) {
    this.register(path, 'HEAD', handlers);
  }

  patch(path: string, ...handlers: Handler[]) {
    this.register(path, 'PATCH', handlers);
  }

  post(path: string, ...handlers: Handler[]) {
    this.register(path, 'POST', handlers);
  }

  put(path: string, ...handlers: Handler[]) {
    this.register(path, 'PUT', handlers);
  }

  options(path: string, ...handlers: Handler[]) {
    this.register(path, 'OPTIONS', handlers);
  }

  propfind(path: string, ...handlers: Handler[]) {
    this.register(path, 'PROPFIND', handlers);
  }

  proppatch(path: string, ...handlers: Handler[]) {
    this.register(path, 'PROPPATCH', handlers);
  }

  mkcol(path: string, ...handlers: Handler[]) {
    this.register(path, 'MKCOL', handlers);
  }

  copy(path: string, ...handlers: Handler[]) {
    this.register(path, 'COPY', handlers);
  }

  move(path: string, ...handlers: Handler[]) {
    this.register(path, 'MOVE', handlers);
  }

  lock(path: string, ...handlers: Handler[]) {
    this.register(path, 'LOCK', handlers);
  }

  unlock(path: string, ...handlers: Handler[]) {
    this.register(path, 'UNLOCK', handlers);
  }

  trace(path: string, ...handlers: Handler[]) {
    this.register(path, 'TRACE', handlers);
  }

  search(path: string, ...handlers: Handler[]) {
    this.register(path, 'SEARCH', handlers);
  }

  /**
   * Registers a route with the specified path, HTTP method, and request handlers.
   *
   * This method is responsible for adding a new route definition to the server's routing system.
   * A route definition consists of a URL path, an HTTP method, and a series of request handlers.
   * Request handlers are functions that process incoming requests and generate responses.
   *
   * @private
   * @param {string} path - The URL path for the route.
   * @param {HttpMethodTypes} method - The HTTP method for the route (e.g., 'GET', 'POST').
   * @param {Handler[]} handlers - An array of request handler functions to execute for the route.
   *
   * @example
   * // Register a GET route that responds to requests at '/api/users'
   * this.register('/api/users', 'GET', [getUserListHandler, sendResponseHandler]);
   *
   * @see {@link OvenjoyRadixRouter} for the routing system used to manage routes.
   */

  private register(path: string, method: HttpMethodTypes, handlers: Handler[]) {
    // Extract middlewares and the final handler from the handlers array
    const middlewares = handlers.slice(0, handlers.length - 1) as Middleware[];
    const handler = handlers[handlers.length - 1];

    // Get or create the router tree for the specified HTTP method
    let routerTree = this.requestMap[method];

    if (!routerTree) {
      this.requestMap[method.toUpperCase() as keyof RequestMapTypes] =
        new OvenjoyRadixRouter();
      routerTree = this.requestMap[method];
    }

    // Add the route to the router tree
    routerTree!.addRoute({
      path,
      handler,
      middlewares,
    });
  }

  match(path: string, method: HttpMethodTypes) {
    const routerTree = this.requestMap[method];
    return routerTree?.findHandler(path);
  }
}

export default Router;
