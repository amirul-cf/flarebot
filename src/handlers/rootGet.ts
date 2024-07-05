// Handle GET request for the root route ('/')
export async function handleRootGet(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Return a simple welcome page
    return new Response(
      `<html>
        <head><title>Chatbot</title><style>body{font-family:Helvetica,sans-serif;}</style></head>
        <body><h1>Welcome to a Worker chatbot!</h1><p><a href="/chat">Start a chat!</a></body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
  