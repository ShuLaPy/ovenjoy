import type OvenjoyRequest from './request';
import type OvenjoyResponse from './response';
import type OvenjoyRadixRouter from './router/radixTreeRouter';

declare global {
  type Nullable<T> = T | undefined | null;
}

export type ErrorHandler = (
  err: Error,
  req: OvenjoyRequest,
  res: OvenjoyResponse,
  next?: (err?: Error) => void
) => void | Promise<any>;

export type Handler = (
  req: OvenjoyRequest,
  res: OvenjoyResponse,
  next?: () => void
) => void;

export type RequestMapTypes = {
  [key in HttpMethodTypes]?: OvenjoyRadixRouter;
};

export type RouteDataType = {
  path: string;
  middlewares: Handler[];
  params?: {
    [key: string]: string;
  };
};

export interface ResponseInit {
  headers?: Record<string, string>;
  /** @default 200 */
  status?: number | bigint;

  /** @default "OK" */
  statusText?: string;
}

export interface HttpMethods {
  delete: (path: string, ...handlers: Handler[]) => void;
  get: (path: string, ...handlers: Handler[]) => void;
  head: (path: string, ...handlers: Handler[]) => void;
  patch: (path: string, ...handlers: Handler[]) => void;
  post: (path: string, ...handlers: Handler[]) => void;
  put: (path: string, ...handlers: Handler[]) => void;
  options: (path: string, ...handlers: Handler[]) => void;
  propfind: (path: string, ...handlers: Handler[]) => void;
  proppatch: (path: string, ...handlers: Handler[]) => void;
  mkcol: (path: string, ...handlers: Handler[]) => void;
  copy: (path: string, ...handlers: Handler[]) => void;
  move: (path: string, ...handlers: Handler[]) => void;
  lock: (path: string, ...handlers: Handler[]) => void;
  unlock: (path: string, ...handlers: Handler[]) => void;
  trace: (path: string, ...handlers: Handler[]) => void;
  search: (path: string, ...handlers: Handler[]) => void;
}

export type HttpMethodTypes =
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'OPTIONS'
  | 'PROPFIND'
  | 'PROPPATCH'
  | 'MKCOL'
  | 'COPY'
  | 'MOVE'
  | 'LOCK'
  | 'UNLOCK'
  | 'TRACE'
  | 'SEARCH';
