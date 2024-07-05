import { handleRootGet } from './handlers/rootGet';
import { handleChatGet } from './handlers/chatGet';
import { handleChatPost } from './handlers/chatPost';

interface Routes {
  [path: string]: {
    [method: string]: (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>;
  };
}

const routes: Routes = {
  '/': {
    GET: handleRootGet,
  },
  '/chat': {
    GET: handleChatGet,
    POST: handleChatPost,
  },
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
	const routeKey = `/${url.pathname.split('/')[1]}`;
    const method = request.method;

    const routeHandlers = routes[routeKey];
    if (routeHandlers && routeHandlers[method]) {
      return routeHandlers[method](request, env, ctx);
    }

    return new Response('Not Found', { status: 404 });
  },
};
