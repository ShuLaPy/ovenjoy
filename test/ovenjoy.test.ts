import { describe, test, expect } from 'bun:test';
import Router from 'lib/router/router';
import ovenjoy from 'ovenjoy';

describe('create application ovenjoy()', () => {
  test('creating app multiple times should return the same instance', () => {
    const app1 = ovenjoy();
    const app2 = ovenjoy();
    expect(app1).toStrictEqual(app2);
  });
});

describe('register different routes', () => {
  test('calling app.METHOD should register routes in radix tree', () => {
    const app = ovenjoy();

    app.get('/user/:name', (req, res) => {
      console.log('Hello user');
    });

    app.get('/user/me', (req, res) => {
      console.log('Hello Logged in user');
    });

    app.post('/user/:name', (req, res) => {
      console.log('User created');
    });

    const router = Router.getInstance();

    expect(router.match('/user/hello', 'GET')).toBeTruthy();
    expect(router.match('/user/me', 'GET')).toBeTruthy();
    expect(router.match('/user/me', 'POST')).toBeTruthy();
    expect(router.match('/user/me/hello', 'POST')).toBeFalsy();
  });

  test('param object should be returned for paramRoutes', () => {
    const app = ovenjoy();

    app.get('/user/:name/:profession', (req, res) => {
      console.log('Hello user');
    });

    const router = Router.getInstance();

    expect(
      router.match('/user/shubham/software-engineer', 'GET')
    ).toHaveProperty('params', {
      name: 'shubham',
      profession: 'software-engineer',
    });
  });
});
