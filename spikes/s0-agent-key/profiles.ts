// Agent profiles for the S0 scripts: the lead DevOps agent (#1505) and the payments watcher sub-agent.
// Pick one with `--agent watcher` (default: devops). A pinned card file must never change afterwards.
const RAW = 'https://raw.githubusercontent.com/dholmes0207/concordium-trusted-agents-hackathon/main/agent-card/';
export const REPO = 'https://github.com/dholmes0207/concordium-trusted-agents-hackathon';

export interface AgentProfile {
  file: string; url: string; keyName: string; role: string; name: string; description: string;
  skills: Array<{ id: string; name: string; description: string; tags: string[] }>;
}
export const PROFILES: Record<string, AgentProfile> = {
  devops: {
    file: 'mandate-gate-devops-agent.json', url: RAW + 'mandate-gate-devops-agent.json', keyName: 'agent-evm', role: 'mandate-gate-agent',
    name: 'Mandate Gate Demo - DevOps Agent',
    description: "HolmesGPT-based DevOps agent operated by company A. Acts on customer infrastructure only through the customer's MandateGate gateway, with a signed work order and human approval for risky actions.",
    skills: [
      { id: 'logs.read', name: 'Read service logs', description: 'Read recent log lines of a service in the customer environment.', tags: ['ops', 'read-only'] },
      { id: 'service.restart', name: 'Restart a service', description: 'Restart a service (reversible).', tags: ['ops'] },
      { id: 'deploy.prod', name: 'Deploy to production', description: 'Deploy a version to production; requires a named engineer to approve each action.', tags: ['ops', 'requires-approval'] },
    ],
  },
  watcher: {
    file: 'mandate-gate-payments-watcher.json', url: RAW + 'mandate-gate-payments-watcher.json', keyName: 'agent-watcher-evm', role: 'mandate-gate-sub-agent',
    name: 'MandateGate Payments Watcher',
    description: "Sub-agent operated by company A. Watches a customer service after a change, only under a delegation signed by the lead DevOps agent and checked by the customer's MandateGate gateway: read logs and status, restart within a small limit, never deploy.",
    skills: [
      { id: 'logs.read', name: 'Read service logs', description: 'Read recent log lines of the delegated service.', tags: ['ops', 'read-only'] },
      { id: 'service.status', name: 'Check service status', description: 'Check replicas, version and health of the delegated service.', tags: ['ops', 'read-only'] },
      { id: 'service.restart', name: 'Restart a service', description: 'Restart the delegated service, within the delegated rate limit.', tags: ['ops'] },
    ],
  },
};
export function profileFromArgs(argv = process.argv): AgentProfile {
  const i = argv.indexOf('--agent');
  const name = i > 0 ? argv[i + 1] : 'devops';
  const p = PROFILES[name];
  if (!p) throw new Error(`unknown agent profile ${name}`);
  return p;
}
