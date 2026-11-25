import { build } from 'esbuild';
await build({
  entryPoints: [new URL('./approve.ts', import.meta.url).pathname],
  outfile: new URL('../dist-web/approve.js', import.meta.url).pathname,
  bundle: true, minify: true, format: 'esm', platform: 'browser', target: 'es2022',
  define: { 'process.env.NODE_ENV': '"production"', global: 'globalThis' },
  logLevel: 'warning',
});
console.log('built dist-web/approve.js');
