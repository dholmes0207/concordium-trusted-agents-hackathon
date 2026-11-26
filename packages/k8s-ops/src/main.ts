import { startK8sOps, DEFAULT_K8S } from './server.js';
const s = await startK8sOps();
console.log(`k8s-ops (customer B on ${DEFAULT_K8S.context}/${DEFAULT_K8S.namespace}) listening on`, s.address());
