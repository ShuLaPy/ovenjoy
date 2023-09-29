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

  private register(path: string, method: HttpMethodTypes, handlers: Handler[]) {
    const middlewares = handlers.slice(0, handlers.length - 1) as Middleware[];
    const handler = handlers[handlers.length - 1];

    let routerTree = this.requestMap[method];
    if (!routerTree) {
      this.requestMap[method.toUpperCase() as keyof RequestMapTypes] =
        new OvenjoyRadixRouter();
      routerTree = this.requestMap[method];
    }
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
