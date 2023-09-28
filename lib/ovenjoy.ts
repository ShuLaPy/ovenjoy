class OvenJoyServer {
  // singleton OvenJoy Server
  private static server?: OvenJoyServer;

  public static getInstance(): OvenJoyServer {
    if (!OvenJoyServer.server) {
      OvenJoyServer.server = new OvenJoyServer();
    }

    return OvenJoyServer.server;
  }

  listen(port: string | number, cb?: () => void) {
    try {
      const server = Bun.serve(this.getSettings(port));
      cb?.call(null);
      return server;
    } catch (error: any) {
      const err = 'Ovenjoy Error: ' + error?.message;
      throw new Error(err);
    }
  }

  private getSettings(port: string | number) {
    const settings = {
      port: port,
      development: process.env.NODE_ENV !== 'production',
      async fetch(req: Request) {
        const headers = { 'Content-Type': 'application/json' };
        return new Response(JSON.stringify({ data: 'Hello World' }), {
          headers,
        });
      },
      error(error: any) {
        return new Response(
          'An error occurred! Please check the server logs.',
          {
            status: 500,
          }
        );
      },
    };
    return settings;
  }
}

export default OvenJoyServer;
