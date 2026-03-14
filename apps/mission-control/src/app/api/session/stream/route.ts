import { readSessionData, watchSessionFile } from '../session-watcher';

function sseChunk(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: Request): Promise<Response> {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send current data immediately
      const initial = readSessionData();
      controller.enqueue(encoder.encode(sseChunk(initial)));

      // Watch for file changes
      const cleanup = watchSessionFile((data) => {
        try {
          controller.enqueue(encoder.encode(sseChunk(data)));
        } catch {
          // Controller may be closed if client disconnected
        }
      });

      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        cleanup();
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
