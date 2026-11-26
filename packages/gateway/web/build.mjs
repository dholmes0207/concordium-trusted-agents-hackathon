import { build } from 'esbuild';

// The approval page only needs VerificationRequestV1.fromJSON (rebuilds the request object the wallet
// expects); that code path never calls the Concordium WASM, so the 5 MB rust-bindings are left out.
// Verified with the Concordium Browser Wallet on testnet (26 Nov 2026).
const noWasm = {
  name: 'no-concordium-wasm',
  setup(b) {
    b.onResolve({ filter: /^@concordium\/rust-bindings(\/.*)?$/ }, (a) => ({ path: a.path, namespace: 'no-wasm' }));
    b.onLoad({ filter: /.*/, namespace: 'no-wasm' }, () => ({ contents: 'export {};', loader: 'js' }));
  },
};

export async function bundle(entry, outfile, extra = {}) {
  return build({
    entryPoints: [entry], outfile, bundle: true, minify: true, format: 'esm', platform: 'browser', target: 'es2022',
    define: { 'process.env.NODE_ENV': '"production"', global: 'globalThis' },
    // MGATE_FULL_BUNDLE=1 keeps the WASM (4.8 MB), in case a wallet version needs more than fromJSON.
    plugins: process.env.MGATE_FULL_BUNDLE ? [] : [noWasm], logLevel: 'warning', ...extra,
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await bundle(new URL('./approve.ts', import.meta.url).pathname, new URL('../dist-web/approve.js', import.meta.url).pathname);
  console.log('built dist-web/approve.js');
}
