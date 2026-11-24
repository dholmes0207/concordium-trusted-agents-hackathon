import { z } from 'zod';

/**
 * The operations the gateway exposes. Shared by the gateway (which enforces them) and the
 * agent-proxy (which offers them to the agent). Levels: 0 read-only, 1 reversible change,
 * 2 high risk and requires a human approval for each call (L3).
 */
export interface ToolDef {
  name: string; // MCP tool name
  action: string; // action string used in requests, work orders and audit
  level: 0 | 1 | 2;
  description: string;
  params: z.ZodRawShape;
}

const service = z.string().min(1).max(64).describe('Service name, e.g. "payments"');

export const TOOLS: ToolDef[] = [
  { name: 'logs_read', action: 'logs.read', level: 0,
    description: 'Read the most recent log lines of a service in the customer environment.',
    params: { service, lines: z.number().int().min(1).max(50).optional().describe('How many lines (default 20)') } },
  { name: 'service_status', action: 'service.status', level: 0,
    description: 'Get version, replica count and status of a service.',
    params: { service } },
  { name: 'service_restart', action: 'service.restart', level: 1,
    description: 'Restart a service. Reversible.',
    params: { service } },
  { name: 'service_scale', action: 'service.scale', level: 1,
    description: 'Scale a service to a number of replicas (0-10). Reversible.',
    params: { service, replicas: z.number().int().min(0).max(10) } },
  { name: 'deploy_prod', action: 'deploy.prod', level: 2,
    description: 'Deploy a version of a service to production. High risk: a named engineer must approve this exact action before it runs; the call waits for the approval.',
    params: { service, version: z.string().regex(/^v?\d+\.\d+\.\d+$/).describe('Semantic version, e.g. v2.3.0') } },
  { name: 'data_delete', action: 'data.delete', level: 2,
    description: 'Delete the data of a service. High risk: requires a named engineer to approve this exact action.',
    params: { service } },
];

export const toolByName = (name: string) => TOOLS.find((t) => t.name === name);
export const resourceFor = (params: { service?: string }) => `svc:${params.service ?? '*'}`;
