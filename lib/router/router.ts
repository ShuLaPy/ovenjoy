import {
  Handler,
  HttpMethodTypes,
  HttpMethods,
  RequestMapTypes,
  RequestTuple,
  RouteDataType,
  RouteRequestMapper,
} from '@ovenjoy-types';
import type OvenjoyRequest from 'lib/request';
import path from 'path';
import type OvenJoyServer from 'lib/ovenjoy';
import query from 'lib/middleware/query';
import bodyParser from 'lib/middleware/parser';

type Mutable<T> = {
  -readonly [k in keyof T]: T[k];
};

class Router implements HttpMethods {
  private static router: Router;
  private localRequestMap: RouteRequestMapper = {};
  private routeMiddlewares: Handler[] = [];
  private mountpath = '';

  constructor(
    private requestMap: RequestMapTypes,
    private register: OvenJoyServer['register']
  ) {
    // TODO: Code cleaning
    // if (Router.router) {
    //   return Router.router;
    // }
    Router.router = this;
  }

  // Make sure we return same instance when called multiple times
  public static getInstance(options = {}): Router {
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
    this.delegate(path, 'GET', handlers);
  }

  delete(path: string, ...handlers: Handler[]) {
    this.delegate(path, 'DELETE', handlers);
  }

  head(path: string, ...handlers: Handler[]) {
    this.delegate(path, 'HEAD', handlers);
  }

  patch(path: string, ...handlers: Handler[]) {
    this.delegate(path, 'PATCH', handlers);
  }

  post(path: string, ...handlers: Handler[]) {
    this.delegate(path, 'POST', handlers);
  }

  put(path: string, ...handlers: Handler[]) {
    this.delegate(path, 'PUT', handlers);
  }

  options(path: string, ...handlers: Handler[]) {
    this.delegate(path, 'OPTIONS', handlers);
  }

  propfind(path: string, ...handlers: Handler[]) {
    this.delegate(path, 'PROPFIND', handlers);
  }

  proppatch(path: string, ...handlers: Handler[]) {
    this.delegate(path, 'PROPPATCH', handlers);
  }

  mkcol(path: string, ...handlers: Handler[]) {
    this.delegate(path, 'MKCOL', handlers);
  }

  copy(path: string, ...handlers: Handler[]) {
    this.delegate(path, 'COPY', handlers);
  }

  move(path: string, ...handlers: Handler[]) {
    this.delegate(path, 'MOVE', handlers);
  }

  lock(path: string, ...handlers: Handler[]) {
    this.delegate(path, 'LOCK', handlers);
  }

  unlock(path: string, ...handlers: Handler[]) {
    this.delegate(path, 'UNLOCK', handlers);
  }

  trace(path: string, ...handlers: Handler[]) {
    this.delegate(path, 'TRACE', handlers);
  }

  search(path: string, ...handlers: Handler[]) {
    this.delegate(path, 'SEARCH', handlers);
  }

  private delegate(
    localPath: string,
    method: HttpMethodTypes,
    handlers: Handler[]
  ) {
    this.submitToMap(method.toLowerCase(), localPath, handlers);
  }

  private submitToMap(method: string, path: string, handlers: Handler[]) {
    let targetMap: RequestTuple[] | undefined = this.localRequestMap[method];
    if (!targetMap) {
      this.localRequestMap[method] = [];
      targetMap = this.localRequestMap[method];
    }

    targetMap?.push({
      path,
      handlers: [...this.routeMiddlewares, ...handlers],
    });
  }

  use(handler: Handler) {
    this.routeMiddlewares.push(handler);
    Object.keys(this.localRequestMap).forEach((method) => {
      const targetMap = this.localRequestMap[method];
      this.localRequestMap[method] = targetMap.map((route) => {
        route.handlers.push(handler);
        return route;
      });
    });
  }

  mount(localPath: string, router: Router) {
    // router.mergeRoutes(localPath, this.mountpath, this.submitToMap.bind(this));
    router.mergeRoutes(
      localPath,
      this.submitToMap.bind(this),
      this.routeMiddlewares
    );
  }

  mergeRoutes(
    localPath: string,
    submitToMapFun: Router['submitToMap'],
    routeMiddlewares: Handler[]
  ) {
    for (const k in this.localRequestMap) {
      const method = k;
      const reqArr: Array<RequestTuple> = this.localRequestMap[k];
      reqArr.forEach((v, _) => {
        submitToMapFun(method, path.join(localPath, v.path), v.handlers);
      });
    }
  }

  // mergeRoutes(
  //   localPath: string,
  //   mountPath: string = '',
  //   submitToMapFun: Router['submitToMap']
  // ) {
  //   this.mountpath = path.join(mountPath, localPath);

  //   for (const k in this.localRequestMap) {
  //     const method = k;
  //     const reqArr: Array<RequestTuple> = this.localRequestMap[k];
  //     reqArr.forEach((v, _) => {
  //       submitToMapFun(
  //         method,
  //         path.join(mountPath, localPath, v.path),
  //         v.handlers
  //       );
  //     });
  //   }
  // }

  // TODO: see if mountpath is needed
  attach(globalPath: string, mountPath: string = '') {
    this.mountpath = path.join(mountPath, globalPath);

    for (const k in this.localRequestMap) {
      const method = k;
      const reqArr: Array<RequestTuple> = this.localRequestMap[k];
      reqArr.forEach((v, _) => {
        this.register.apply(this, [
          path.join(mountPath, globalPath, v.path),
          method as HttpMethodTypes,
          v.handlers,
        ]);
      });
    }
  }

  /**
   * Handles an OvenjoyRequest by matching it to a route handler and updating the request object.
   * @param req - The OvenjoyRequest object to be handled.
   * @throws {Error} If no matching route handler is found for the request.
   *
   */
  handle(req: OvenjoyRequest) {
    const mutableOvenjoyRequest = req as Mutable<OvenjoyRequest>;
    const handler = this.match(req.path, req.method as HttpMethodTypes);

    if (!handler) {
      throw new Error(`Cannot ${req.method} ${req.path}`);
    }

    const { params, ...routeData } = handler;
    mutableOvenjoyRequest.params = params;
    mutableOvenjoyRequest.route = {
      ...routeData,
      middlewares: [bodyParser.json, query, ...routeData.middlewares],
    };
  }

  match(path: string, method: HttpMethodTypes): Nullable<RouteDataType> {
    const routerTree = this.requestMap[method];
    return routerTree?.findHandler(path);
  }
}
export default Router;
