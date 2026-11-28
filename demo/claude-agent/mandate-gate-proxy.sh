#!/bin/sh
# Starts company A's agent-proxy as a stdio MCP server for Claude Code (or any MCP agent).
# Nothing may be printed to stdout except MCP messages, so setup output goes to stderr.
here=$(cd "$(dirname "$0")" && pwd)
repo=$(cd "$here/../.." && pwd)
if [ -s "$HOME/.nvm/nvm.sh" ]; then . "$HOME/.nvm/nvm.sh" >/dev/null 2>&1; nvm use 22 >/dev/null 2>&1; fi
export MGATE_GATEWAY_URL="${MGATE_GATEWAY_URL:-http://127.0.0.1:7400/mcp}"
export MGATE_AUDIENCE="${MGATE_AUDIENCE:-mgate:customer-b}"
export MGATE_AGENT_TOKEN_ID="${MGATE_AGENT_TOKEN_ID:-1505}"
export MGATE_WORK_ORDER="${MGATE_WORK_ORDER:-$repo/.data/work-orders/current.json}"
export MGATE_AGENT_MODEL="${MGATE_AGENT_MODEL:-claude-code}"
# x402: the agent wallet pays for level-2 actions; local stop rule at 10 CCD per proxy run.
export MGATE_PAYER_KEY="${MGATE_PAYER_KEY:-agent-wallet.export}"
export MGATE_MAX_SPEND_MICRO_CCD="${MGATE_MAX_SPEND_MICRO_CCD:-10000000}"
# Delegation: company A's sub-agents (public registry info) and where signed delegations go.
export MGATE_SUB_AGENTS="${MGATE_SUB_AGENTS:-$here/sub-agents.json}"
export MGATE_DELEGATIONS_DIR="${MGATE_DELEGATIONS_DIR:-$repo/.data/delegations}"
cd "$repo/packages/agent-proxy" && exec "$repo/node_modules/.bin/tsx" src/main.ts
