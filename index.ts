import OvenjoyServer from './lib/ovenjoy';

function server(): OvenjoyServer {
  return OvenjoyServer.getInstance();
}

server.Router = OvenjoyServer.getInstance().router.bind(
  OvenjoyServer.getInstance()
);

export default server;
