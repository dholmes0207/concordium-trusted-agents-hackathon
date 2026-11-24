import { REGISTRY_MCP_URL } from './config.js';

/**
 * Minimal JSON-RPC client for the hosted Agent Registry MCP server (streamable HTTP).
 * Used by scripts to build payloads. The gateway does NOT trust it for decisions.
 */
export class RegistryMcp {
  private sessionId?: string;
  private nextId = 1;
  constructor(private url = REGISTRY_MCP_URL) {}

  private async rpc(method: string, params?: unknown): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    };
    if (this.sessionId) headers['Mcp-Session-Id'] = this.sessionId;
    const res = await fetch(this.url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ jsonrpc: '2.0', id: this.nextId++, method, params }),
    });
    const sid = res.headers.get('mcp-session-id');
    if (sid) this.sessionId = sid;
    if (res.status === 429) throw new Error(`rate limited, retry after ${res.headers.get('retry-after') ?? '?'}s`);
    const text = await res.text();
    if (!res.ok) throw new Error(`MCP HTTP ${res.status}: ${text.slice(0, 300)}`);
    // Either plain JSON or an SSE stream with `data:` lines.
    const json = text.trimStart().startsWith('{')
      ? JSON.parse(text)
      : JSON.parse(text.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5)).join(''));
    if (json.error) throw new Error(`MCP error ${json.error.code}: ${json.error.message}`);
    return json.result;
  }

  async init(): Promise<void> {
    await this.rpc('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'mandate-gate-scripts', version: '0.1.0' },
    });
  }

  /** Calls a tool and returns its structured or JSON-text result. */
  async call(name: string, args: Record<string, unknown>): Promise<any> {
    const r = await this.rpc('tools/call', { name, arguments: args });
    if (r?.isError) throw new Error(`tool ${name} failed: ${JSON.stringify(r.content).slice(0, 500)}`);
    if (r?.structuredContent) return r.structuredContent;
    const textPart = r?.content?.find((c: any) => c.type === 'text')?.text;
    try { return JSON.parse(textPart); } catch { return textPart; }
  }
}
