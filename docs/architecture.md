# Architecture

## Components

| Component | Tech | Responsibility |
|---|---|---|
| Agent | | |
| Backend / verifier | | |
| Frontend | | |
| Concordium | testnet | |

## Main flow

```mermaid
sequenceDiagram
    actor User
    participant Agent
    participant Service
    participant Concordium
    User->>Agent: task
    Agent->>Concordium: identity / mandate / payment
    Agent->>Service: request + proof
    Service->>Concordium: verify
    Service-->>Agent: result
```

## Trust model
- What is verified on-chain:
- What stays off-chain (and why):
- Threats considered (spoofed agent, replayed proof, over-spending, tampered consent…):
