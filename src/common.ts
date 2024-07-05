export function getPathParams(request: Request) {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/').slice(1);
    const userName = pathSegments[1] || '';
    const chatId = pathSegments[2] || '';
    return { userName, chatId };
}