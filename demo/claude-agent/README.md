# Claude Code as the agent

Claude Code plays company A's DevOps agent. It sees the six MandateGate tools through
`agent-proxy` (stdio MCP, holds the agent key, signs every call); customer B's gateway checks
each call on Concordium testnet. See the steps in `Tailieu/Huong-dan-demo-Claude-Code.md`.

```bash
pnpm --filter @mandate-gate/issuer wo issue --hours 3 --sponsor   # company A: work order
pnpm demo:up                                                     # customer B: infra + gateway
cd demo/claude-agent && claude                                   # the agent
```
