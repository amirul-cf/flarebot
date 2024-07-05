import { getPathParams } from '../common';

// Handle POST request for the '/chat' route
interface ChatEntry {
    role: string;
    content: string;
}

interface ChatRequest {
    chatEntries: ChatEntry[];
}

export async function handleChatPost(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const { chatEntries } = (await request.json()) as ChatRequest;
    const { userName, chatId } = getPathParams(request);

    const systemPrompt = (await env.CONFIG.get('systemPrompt')) ?? `You are a friendly assistant that always responds in a rhyme`;
    const { response } = await env.AI.run('@hf/mistral/mistral-7b-instruct-v0.2' /*'@cf/meta/llama-3-8b-instruct'*/, {
        messages: [{ role: 'system', content: systemPrompt }, ...chatEntries],
    });

    // get the latest prompt from the user (last chat entry)
    const lastMsg = chatEntries[chatEntries.length - 1];

    // prepare a generic insert statement (we'll bind values to it below)
    const insertStatement = env.DB.prepare(
        `INSERT INTO history (user_name, chat_id, role, content)
		 VALUES (?1, ?2, ?3, ?4)`
    );

    // make 2 inserts in a batch
    await env.DB.batch([
        // the latest user prompt
        insertStatement.bind(userName, chatId, lastMsg.role, lastMsg.content),
        // and the lastest AI response
        insertStatement.bind(userName, chatId, 'assistant', response),
    ]);

    return new Response(response, {
        headers: { 'Content-Type': 'text/plain' },
    });
}