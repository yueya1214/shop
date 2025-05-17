require('esbuild').build({
  entryPoints: ['index.js'],
  bundle: true,
  outfile: 'worker.js',
  format: 'esm',
  platform: 'browser',
  external: [
    '@cloudflare/kv-asset-handler',
    '@tsndr/cloudflare-worker-jwt'
  ]
}).catch(() => process.exit(1));
