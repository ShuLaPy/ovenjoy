import { Handler, Middleware } from '@ovenjoy-types';

class Node {
  paramName: string;
  children: Record<string, Node>;
  data: any;
  placeholderChild: Node | null = null;
  wildcardChild: Node | null = null;

  constructor(
    options: {
      paramName?: string;
      data?: any;
    } = {}
  ) {
    const { paramName = '', data = null } = options;

    this.paramName = paramName;
    this.children = {};
    this.data = data;
  }
}

enum NodeType {
  Normal = 0,
  Wildcard = 1,
  Placeholder = 2,
}

export default class OvenjoyRadixRouter {
  private rootNode: Node = new Node();
  private trailingSlashRedirect: boolean;
  private staticRoutesMap: Record<string, Node> = {};

  constructor(options: { trailingSlashRedirect?: boolean } = {}) {
    this.trailingSlashRedirect =
      options.trailingSlashRedirect === false ? false : true;
  }

  findHandler(path: string) {
    path = this.validateInput(path);

    const staticPathNode = this.staticRoutesMap[path];
    if (staticPathNode) {
      return staticPathNode.data;
    }

    const { node, params } = this.findMatchingNode(path, this.rootNode);
    const handler = (node?.data || null) as any;

    if (handler && params) {
      handler.params = params;
    }

    return handler;
  }

  addRoute(data: {
    path: string;
    handler: Handler;
    middlewares?: Middleware[];
  }) {
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

    return path;
  }

  private getNodeType(str: string) {
    if (str[0] === ':') {
      return NodeType.Placeholder;
    } else if (str === '**') {
      return NodeType.Wildcard;
    } else {
      return NodeType.Normal;
    }
  }

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
