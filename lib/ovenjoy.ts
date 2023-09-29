import type { Serve, Server } from 'bun';
import { Handler, HttpMethods } from '@ovenjoy-types';
import Router from './router/router';

class OvenJoyServer implements HttpMethods {
  // singleton OvenJoy Server
  private static server?: OvenJoyServer;
  private _router: Router;
  private readonly errorHandlers: Handler[] = [];

  // Make sure we return same instance when called multiple times
  public static getInstance(): OvenJoyServer {
    if (!OvenJoyServer.server) {
      OvenJoyServer.server = new OvenJoyServer();
    }

    return OvenJoyServer.server;
  }

  lazyrouter() {
    if (!this._router) {
      this._router = new Router();
    }
  }

  get(path: string, ...handlers: Handler[]) {
    this.lazyrouter();
    this._router.get(path, ...handlers);
  }

  delete(path: string, ...handlers: Handler[]) {
    this.lazyrouter();
    this._router.delete(path, ...handlers);
  }

  head(path: string, ...handlers: Handler[]) {
    this.lazyrouter();
    this._router.head(path, ...handlers);
  }

  patch(path: string, ...handlers: Handler[]) {
    this.lazyrouter();
    this._router.patch(path, ...handlers);
  }

  post(path: string, ...handlers: Handler[]) {
    this.lazyrouter();
    this._router.post(path, ...handlers);
  }

  put(path: string, ...handlers: Handler[]) {
    this.lazyrouter();
    this._router.put(path, ...handlers);
  }

  options(path: string, ...handlers: Handler[]) {
    this.lazyrouter();
    this._router.options(path, ...handlers);
  }

  propfind(path: string, ...handlers: Handler[]) {
    this.lazyrouter();
    this._router.propfind(path, ...handlers);
  }

  proppatch(path: string, ...handlers: Handler[]) {
    this.lazyrouter();
    this._router.proppatch(path, ...handlers);
  }

  mkcol(path: string, ...handlers: Handler[]) {
    this.lazyrouter();
    this._router.mkcol(path, ...handlers);
  }

  copy(path: string, ...handlers: Handler[]) {
    this.lazyrouter();
    this._router.copy(path, ...handlers);
  }

  move(path: string, ...handlers: Handler[]) {
    this.lazyrouter();
    this._router.move(path, ...handlers);
  }

  lock(path: string, ...handlers: Handler[]) {
    this.lazyrouter();
    this._router.lock(path, ...handlers);
  }

  unlock(path: string, ...handlers: Handler[]) {
    this.lazyrouter();
    this._router.unlock(path, ...handlers);
  }

  trace(path: string, ...handlers: Handler[]) {
    this.lazyrouter();
    this._router.trace(path, ...handlers);
  }

  search(path: string, ...handlers: Handler[]) {
    this.lazyrouter();
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
      cb?.call(null);
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
   * @return {Response}
   * @private
   */

  private fetch = async (req: Request): Promise<Response> => {
    const headers = { 'Content-Type': 'application/json' };
    return new Response(JSON.stringify({ data: 'Hello World' }), {
      headers,
    });
  };

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
