import { describe, test } from 'bun:test';
import ovenjoy from 'ovenjoy';

describe('app.listen()', () => {
  test('should start listening on port 3000', (done) => {
    try {
      const app = ovenjoy();
      var server = app.listen(3000, () => {
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
      const server = app.listen(3000, () => {
        app.listen(3000);
      });
      server?.stop();
      done('Error');
    } catch (error: any) {
      done();
    }
  });
});
