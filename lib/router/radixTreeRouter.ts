import { Handler, RouteDataType } from '@ovenjoy-types';

/**
 * Represents a node in the radix tree used by OvenjoyRadixRouter.
 */
class Node {
  paramName: string;
  children: Record<string, Node>;
  data: Nullable<RouteDataType>;
  placeholderChild: Node | null = null;
  wildcardChild: Node | null = null;

  /**
   * Creates an instance of the Node class.
   * @param options - An object with optional parameters.
   * @param {string} options.paramName - The parameter name associated with the node.
   * @param {RouteDataType} options.data - The data associated with the node.
   */
  constructor(
    options: {
      paramName?: string;
      data?: RouteDataType;
    } = {}
  ) {
    const { paramName = '', data = null } = options;

    this.paramName = paramName;
    this.children = {};
    this.data = data;
  }
}

/**
 * Enum representing different types of nodes in the radix tree.
 */

enum NodeType {
  Normal = 0,
  Wildcard = 1,
  Placeholder = 2,
}

/**
 * OvenjoyRadixRouter is a radix tree-based router for handling routes and route data.
 */
export default class OvenjoyRadixRouter {
  private rootNode: Node = new Node();
  private trailingSlashRedirect: boolean;
  private staticRoutesMap: Record<string, Node> = {};

  /**
   * Creates an instance of the OvenjoyRadixRouter class.
   * @param options - An object with optional parameters.
   * @param options.trailingSlashRedirect - If true, trailing slashes will be redirected (default: true).
   */
  constructor(options: { trailingSlashRedirect?: boolean } = {}) {
    this.trailingSlashRedirect = options.trailingSlashRedirect !== false;
  }

  /**
   * Find a route handler for a given path.
   * @param {string} path - The path to find a handler for.
   * @returns The route handler for the specified path, or null if not found.
   * @example
   * const handler = router.findHandler('/example');
   * if (handler) {
   *   const { path, middlewares, params } = handler;
   * }
   */
  findHandler(path: string): Nullable<RouteDataType> {
    path = this.validateInput(path);

    const staticPathNode = this.staticRoutesMap[path];
    if (staticPathNode) {
      return staticPathNode.data;
    }

    const { node, params } = this.findMatchingNode(path, this.rootNode);
    const handler = node?.data || null;

    if (handler && params) {
      handler.params = params;
    }

    return handler;
  }

  /**
   * Add a route to the router.
   * @param data - An object containing route data.
   * @param {string} data.path - The route path.
   * @param {Handler[]} data.middlewares - An array of route middleware functions and handler.
   * @returns {Node} The added node in the radix tree.
   * @example
   * const node = router.addRoute({ path: '/example', [middleware1, middleware2] });
   */
  addRoute(data: { path: string; middlewares: Handler[] }): Node {
    let path = this.validateInput(data.path);
    let isStaticRoute = true;

    const sections = path.split('/');

    let node = this.rootNode;

    for (const section of sections) {
      const children = node.children;
      let childNode = children[section];

      if (!childNode) {
        const type = this.getNodeType(section);

        childNode = new Node();

        node.children[section] = childNode;

        if (type === NodeType.Placeholder) {
          childNode.paramName = section.slice(1);
          node.placeholderChild = childNode;
          isStaticRoute = false;
        } else if (type === NodeType.Wildcard) {
          node.wildcardChild = childNode;
          isStaticRoute = false;
        }
      }

      node = childNode;
    }

    node.data = data;

    if (isStaticRoute) {
      this.staticRoutesMap[path] = node;
    }

    return node;
  }

  private validateInput(path: string) {
    if (!path || typeof path !== 'string') {
      throw new Error('"path" must be a non-empty string');
    }

    const pathEnd = path[path.length - 1];

    if (this.trailingSlashRedirect && path.length > 1 && pathEnd === '/') {
      return path.slice(0, -1);
    }

    return path.replace(/^\/+/, '');
  }

  private getNodeType(str: string) {
    if (str.startsWith(':')) {
      return NodeType.Placeholder;
    } else if (str === '**') {
      return NodeType.Wildcard;
    } else {
      return NodeType.Normal;
    }
  }

  /**
   * Finds the matching node in the radix tree for a given path.
   * @param {string} path - The path to find a matching node for.
   * @param {Node} rootNode - The root node of the radix tree to search within.
   * @returns An object containing the matching node and any associated route parameters.
   * - `node` is the matching node in the radix tree.
   * - `params` is an object containing route parameters, if any were found during the search.
   *
   */
  private findMatchingNode(path: string, rootNode: Node) {
    const sections = path.split('/');
    const params: { [key: string]: string } = {};
    let paramsFound = false;
    let wildcardNode: Node | null = null;
    let node = rootNode;

    for (const section of sections) {
      if (node.wildcardChild !== null) {
        wildcardNode = node.wildcardChild;
      }

      const nextNode = node.children[section]; // first priority is for static route

      if (nextNode !== undefined) {
        node = nextNode;
      } else {
        node = node.placeholderChild as Node; // second priority is for placeholder

        if (node !== null) {
          params[node.paramName] = section;
          paramsFound = true;
        } else {
          break;
        }
      }
    }

    if (node === null || !node.data) {
      node = wildcardNode || node; // Third priority is for wildcard
    }

    return {
      node,
      params: paramsFound ? params : undefined,
    };
  }
}
