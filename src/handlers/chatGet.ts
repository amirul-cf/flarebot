import { getPathParams } from '../common';
interface ChatEntry {
    role: string;
    content: string;
}

export async function handleChatGet(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const { userName, chatId } = getPathParams(request);
    const dbHistory: any = await env.DB.prepare(`SELECT role, content FROM history WHERE user_name = ?1 AND chat_id = ?2`)
        .bind(userName, chatId)
        .all();

    const initialChatHistory: ChatEntry[] = [{ role: 'assistant', content: 'Hi there! How can I assist you today?' }, ...dbHistory.results];


    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Chatbot</title>
          <style>body{font-family:Helvetica,sans-serif;margin:0;padding:0}#chat-container{max-width:600px;margin:20px auto;padding:20px;border:1px solid #ccc;border-radius:5px}#chat-history{height:calc(100vh - 220px);overflow-y:auto;margin-bottom:10px;padding:10px;border:1px solid #ccc;border-radius:5px}#chat-form{display:flex}#chat-input{flex-grow:1;padding:5px;border:1px solid #ccc;border-radius:5px}#chat-form button{margin-left:10px;padding:5px 10px;border:none;border-radius:5px;background-color:#f38020;color:#fff;cursor:pointer}</style>
        </head>
        <body>
          <div id="chat-container">
            <h1>Chatbot</h1>
            <div id="chat-history">
              ${initialChatHistory
            .map(
                (entry) =>
                    `<p><strong>${entry.role === 'assistant' ? 'Chatbot' : userName}:</strong> ${entry.content.replace(/\\n/g, '<br/>')}</p>`
            )
            .join('')}
            </div>
            <form id="chat-form">
              <input type="text" id="chat-input" placeholder="Type your message..." required>
              <button type="submit">Send</button>
            </form>
          </div>
          <script>
            const chatHistory = document.getElementById('chat-history');
            const chatForm = document.getElementById('chat-form');
            const chatInput = document.getElementById('chat-input');
  
            chatForm.addEventListener('submit', async (e) => {
              e.preventDefault();
              const message = chatInput.value.trim();
              if (message !== '') {
                const userEntry = { role: 'user', content: message };
                chatHistory.innerHTML += \`<p><strong>You:</strong> \${userEntry.content}</p>\`;
                chatInput.value = '';
  
                const chatEntries = Array.from(chatHistory.children)
                  .slice(-6)
                  .map(entry => ({
                    role: entry.querySelector('strong').textContent === 'Chatbot:' ? 'assistant' : 'user',
                    content: entry.textContent.replace(/^.*?:\\s*/, ''),
                  }));
  
                // TODO: send chatEntries to the backend
                const response = await fetch('/chat/${userName}/${chatId}', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chatEntries }),
                });
  
                if (response.ok) {
                  const data = await response.text();
                  const assistantEntry = { role: 'assistant', content: data };
                  chatHistory.innerHTML += \`<p><strong>Chatbot:</strong> \${assistantEntry.content.replace(/\\n/g, '<br/>')}</p>\`;
                } else {
                  chatHistory.innerHTML += '<p><strong>Error:</strong> Failed to get response from the chatbot.</p>';
                }
                chatHistory.scrollTop = chatHistory.scrollHeight;
              }
            });
          </script>
        </body>
      </html>`;

    return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
    });
}
