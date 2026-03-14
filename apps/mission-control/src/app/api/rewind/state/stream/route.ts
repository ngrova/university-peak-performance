import { readRewindState, watchRewindState } from '../../rewind-state-file';

function sseChunk(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: Request): Promise<Response> {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const initial = readRewindState();
      controller.enqueue(encoder.encode(sseChunk(initial)));

      const cleanup = watchRewindState((state) => {
        try {
          controller.enqueue(encoder.encode(sseChunk(state)));
        } catch {
          // client disconnected
        }
      });

      request.signal.addEventListener('abort', () => {
        cleanup();
        try { controller.close(); } catch { /* already closed */ }
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
