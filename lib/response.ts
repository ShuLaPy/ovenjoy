import { ResponseInit } from '@ovenjoy-types';

class OvenjoyResponse {
  private response: Response;
  private options: ResponseInit = {};
  // variables
  // statusCode - it can be set directly or by methods
  set statusCode(code: number) {
    this.options.status = code;
  }

  get getResponse(): Response {
    return this.response;
  }

  get isReady(): boolean {
    return !!this.response;
  }

  /**
   * Set status `code`.
   *
   * @param {Number} code
   * @return {OvenjoyResponse}
   * @public
   */
  status(code: number): OvenjoyResponse {
    this.statusCode = code;
    return this;
  }

  /**
   * Set header `field` to `value`, or pass
   * an object of header fields.
   *
   * Examples:
   *
   *    res.set('Foo', ['bar', 'baz']); TODO:
   *    res.set('Accept', 'application/json');
   *    res.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
   *
   * Aliased as `res.header()` and `res.setHeaders()`.
   *
   * @param {String | Object} field
   * @param {String} val
   * @return {ServerResponse} for chaining
   * @public
   */

  set = this.header;
  setHeaders = this.header;
  header(field: string | object, value?: string) {
    if (arguments.length === 2) {
      if (!field || !value) {
        throw new Error('Headers field or value should not be empty');
      }

      if (!this.options.headers) this.options.headers = {};

      this.options.headers[field as string] = value;

      return this;
    } else {
      if (typeof field !== 'object') {
        throw new Error('Headers param should be object');
      }
      for (let key in field) {
        this.set(key, field[key as keyof object]);
      }
    }

    return this;
  }

  // json - send json response
  json(body: any): void {
    this.response = Response.json(body, this.options);
  }

  // end - send response - TODO: used by cors
  send(body: any): void {
    this.response = new Response(body, this.options);
  }

  // res.cookie('cookieName',randomNumber, { maxAge: 900000, httpOnly: true });
}

export default OvenjoyResponse;
