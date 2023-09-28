import { describe, test, expect } from 'bun:test';
import ovenjoy from 'ovenjoy';

describe('create application ovenjoy()', () => {
  test('creating app multiple times should return the same instance', () => {
    const app1 = ovenjoy();
    const app2 = ovenjoy();
    expect(app1).toStrictEqual(app2);
  });
});
