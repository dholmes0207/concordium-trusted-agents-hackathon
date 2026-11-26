#!/bin/sh
# Creates customer B's local Kubernetes (kind) with the payments incident. Idempotent.
set -e
here=$(cd "$(dirname "$0")" && pwd)
export PATH="$HOME/.local/bin:$PATH"
kind get clusters 2>/dev/null | grep -qx mandate-gate || kind create cluster --name mandate-gate --wait 120s
for v in v2.2.0 v2.2.1 v1.8.3 pg-16; do
  docker build -q --build-arg VERSION=$v -t mgate/svc:$v "$here/app" >/dev/null
  kind load docker-image --name mandate-gate mgate/svc:$v >/dev/null
done
kubectl --context kind-mandate-gate apply -f "$here/manifests.yaml" >/dev/null
# Start every demo from the faulty release.
kubectl --context kind-mandate-gate -n customer-b set image deploy/payments app=mgate/svc:v2.2.0 >/dev/null
for d in payments billing customer-db; do
  kubectl --context kind-mandate-gate -n customer-b rollout status deploy/$d --timeout=120s >/dev/null
done
echo "customer B cluster ready: kind-mandate-gate, namespace customer-b"
kubectl --context kind-mandate-gate -n customer-b get deploy
