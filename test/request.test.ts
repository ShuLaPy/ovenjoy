import { describe, test, expect } from 'bun:test';
import ovenjoy from 'ovenjoy';

describe('register different routes', () => {
  test('should extend the request prototype in middleware', (done) => {
    const app = ovenjoy();

    const queryMiddleware = (req, res, next) => {
      req.querystring = function () {
        return require('url').parse(this.url).query;
      };
      next();
    };

    app.get('/foo', queryMiddleware, (req, res) => {
      res.send(req.querystring());
    });

    var server = app.listen(5500, () => {
      fetch('http://localhost:5500/foo?name=tobi')
        .then(async (res) => {
          const response = await res.text()
          expect(response).toEqual('name=tobi');
          server?.stop();
          done();
        })
        .catch((err) => done(err));
    });
  });
});
