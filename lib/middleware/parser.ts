import type OvenjoyRequest from 'lib/request';
import type OvenjoyResponse from 'lib/response';

class BodyParser {
  public static async json(
    req: OvenjoyRequest,
    res: OvenjoyResponse,
    next: any
  ) {
    const headers = req.headers;

    const contentType = headers.get('content-type')?.split(';')[0];

    switch (contentType?.trim()) {
      case 'application/json':
        req.body = await req.json();
        break;

      case 'multipart/form-data':
        req.body = await req.formData();
        break;

      default:
        break;
    }

    next();
  }
}

export default BodyParser;
