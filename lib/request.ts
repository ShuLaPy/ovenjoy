import { RouteDataType } from '@ovenjoy-types';
import OvenJoyServer from './ovenjoy';

class OvenjoyRequest extends Request {
  public readonly params: Nullable<{ [key: string]: string }>;
  public readonly path: string;
  public readonly route: RouteDataType;
  [key: string]: any;

  constructor(req: Request) {
    super(req);
    this.path = new URL(req.url).pathname;
    OvenJoyServer.getInstance().router().handle(this);
  }

  // req.path - /about/admin/12345 - DONE

  // req.method - 'GET' // already avalibale - DONE

  // http://localhost:4000/first/about/admin/12345?name=Shubham Lad&job=software

  // TODO: Implement express.request.PROPERTIES
  // All the properties are getters access xthis.REQUEST_PROPERTIES and parse from it
  // req.app
  // req.baseUrl - '/first'
  // req.body
  // req.cookies -
  // req.fresh - false
  // req.hostname - 'localhost'
  // req.ip - '::1'
  // req.ips - []
  // req.originalUrl - '/first/about/admin/12345?name=Shubham%20Lad&job=software'
  // req.protocol - 'http'

  // req.secure - false
  // req.signedCookies
  // req.stale - true
  // req.subdomains - []
  // req.xhr - false
  // req.query - {name: 'Shubham Lad', job: 'software'}

  // TODO: Implement express.request.METHODS
  // req.accepts()
  // req.acceptsCharsets()
  // req.acceptsEncodings()
  // req.acceptsLanguages()
  // req.get()
  // req.is()
  // req.param()
  // req.range()
}

export default OvenjoyRequest;
