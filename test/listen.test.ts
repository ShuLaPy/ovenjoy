import { describe, test } from 'bun:test';
import ovenjoy from 'ovenjoy';

describe('app.listen()', () => {
  test('should start listening on port 5500', (done) => {
    try {
      const app = ovenjoy();
      var server = app.listen(5500, () => {
        server?.stop();
        done();
      });
    } catch (error: any) {
      done(error.message);
    }
  });

  test('double listen error', (done) => {
    try {
      const app = ovenjoy();
      const server = app.listen(5500, () => {
        app.listen(5500);
      });
      server?.stop();
      done('Error');
    } catch (error: any) {
      done();
    }
  });
});
