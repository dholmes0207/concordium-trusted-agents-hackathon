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
cd "$repo/packages/agent-proxy" && exec "$repo/node_modules/.bin/tsx" src/main.ts
