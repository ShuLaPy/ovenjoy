import type { Serve, Server } from 'bun';
import { Handler, HttpMethods } from '@ovenjoy-types';
import Router from './router/router';
import OvenjoyRequest from './request';
import OvenjoyResponse from './response';

class OvenJoyServer implements HttpMethods {
  // singleton OvenJoy Server
  private static server?: OvenJoyServer;
  private _router: Router;
  private readonly errorHandlers: Handler[] = [];

  constructor() {
    this.lazyrouter();
  }

  // Make sure we return same instance when called multiple times
  public static getInstance(): OvenJoyServer {
    if (!OvenJoyServer.server) {
      OvenJoyServer.server = new OvenJoyServer();
    }

    return OvenJoyServer.server;
  }

  /**
   * lazily adds the base router if it has not yet been added.
   *
   * @private
   */
  lazyrouter() {
    if (!this._router) {
      this._router = new Router();
    }
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
   * app.get("/admin", middlewareFunction1, function (req, res) {
   *   res.send("Admin Homepage");
   * });
   *
   */

  get(path: string, ...handlers: Handler[]) {
    this._router.get(path, ...handlers);
  }

  delete(path: string, ...handlers: Handler[]) {
    this._router.delete(path, ...handlers);
  }

  head(path: string, ...handlers: Handler[]) {
    this._router.head(path, ...handlers);
  }

  patch(path: string, ...handlers: Handler[]) {
    this._router.patch(path, ...handlers);
  }

  post(path: string, ...handlers: Handler[]) {
    this._router.post(path, ...handlers);
  }

  put(path: string, ...handlers: Handler[]) {
    this._router.put(path, ...handlers);
  }

  options(path: string, ...handlers: Handler[]) {
    this._router.options(path, ...handlers);
  }

  propfind(path: string, ...handlers: Handler[]) {
    this._router.propfind(path, ...handlers);
  }

  proppatch(path: string, ...handlers: Handler[]) {
    this._router.proppatch(path, ...handlers);
  }

  mkcol(path: string, ...handlers: Handler[]) {
    this._router.mkcol(path, ...handlers);
  }

  copy(path: string, ...handlers: Handler[]) {
    this._router.copy(path, ...handlers);
  }

  move(path: string, ...handlers: Handler[]) {
    this._router.move(path, ...handlers);
  }

  lock(path: string, ...handlers: Handler[]) {
    this._router.lock(path, ...handlers);
  }

  unlock(path: string, ...handlers: Handler[]) {
    this._router.unlock(path, ...handlers);
  }

  trace(path: string, ...handlers: Handler[]) {
    this._router.trace(path, ...handlers);
  }

  search(path: string, ...handlers: Handler[]) {
    this._router.search(path, ...handlers);
  }

  /**
   * Start Bun server and listen for connections.
   *
   * A node `Bun.Server` is returned.
   *
   * @param {string | number} port
   * @param {Function} cb or callback
   * @return {Server}
   * @public
   */

  listen(port: string | number, cb?: () => void): Server {
    try {
      const server = Bun.serve(this.getSettings(port));
      cb?.();
      return server;
    } catch (error: any) {
      const err = 'Ovenjoy Error: ' + error?.message;
      throw new Error(err);
    }
  }

  /**
   * Generate and return Bun Server options.
   *
   * @param {string | number} port
   * @return {Serve}
   * @private
   */

  private getSettings(port: string | number): Serve {
    const settings = {
      port: port,
      development: process.env.NODE_ENV !== 'production',
      fetch: this.fetch,
      error: this.outerErrorHandler,
    };
    return settings;
  }

  /**
   * Handle all incomming requests.
   *
   * @param {Request} req
   * @return {Promise<Response>}
   * @private
   */

  private fetch = async (req: Request): Promise<Response> => {
    const request = new OvenjoyRequest(req);
    const response = new OvenjoyResponse();
    const { middlewares } = request.route;
    const res = await this.execute(request, response, middlewares);
    return res;
  };

  /**
   * Executes a sequence of middleware functions in a pipeline to handle
   * an incoming OvenjoyRequest and generate an OvenjoyResponse.
   *
   * This method is responsible for processing the request and response objects
   * through a chain of middleware functions, allowing each middleware function
   * to perform specific tasks or modifications to the request and response.
   * Middleware functions are executed in the order they are provided
   * in the `middlewareStack` array.
   *
   * @param {OvenjoyRequest} req - The OvenjoyRequest object representing the incoming request.
   * @param {OvenjoyResponse} res - The OvenjoyResponse object representing the response to be generated.
   * @param {Handler[]} middlewareStack - An array of middleware functions to be executed in order.
   * @returns {Promise<Response>} A Promise that resolves when one of the middleware functions completes the response (ex. res.json(), res.send()).
   * @throws {Error} If an error occurs during the execution of a middleware function, it is propagated up as an error.
   *
   */

  execute(
    req: OvenjoyRequest,
    res: OvenjoyResponse,
    middlewareStack: Handler[]
  ): Promise<Response> {
    return new Promise((resolve) => {
      let currentIndex = 0;

      if (!middlewareStack) return;

      const next = (err?: Error): void => {
        if (err) throw err;
        if (res.isReady) resolve(res.getResponse);
        if (currentIndex < middlewareStack.length) {
          const currentMiddleware = middlewareStack[currentIndex];
          currentIndex++;
          currentMiddleware(req, res, next);
        }
      };

      next(); // Start the middleware chain

      if (currentIndex === middlewareStack.length && res.isReady)
        resolve(res.getResponse);
    });
  }

  /**
   * Handle request processing errors
   *
   * @param {Error} error
   * @return {Response}
   * @private
   */

  private outerErrorHandler = (error: Error): Response =>
    new Response(error.message, {
      // @ts-ignore
      status: error?.status ?? 500,
    });
}

export default OvenJoyServer;
