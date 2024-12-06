const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const packageJson = require('./package.json');
const appName = packageJson.name;
const outputDir = `dist/${appName}`;

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// content.js
esbuild.build({
  entryPoints: ['src/content.ts'],
  outfile: path.join(outputDir, 'content.js'),
  bundle: true,
  minify: true,
  sourcemap: false,
}).catch(() => process.exit(1));

// manifest.json
fs.copyFileSync('src/manifest.json', path.join(outputDir, 'manifest.json'));
