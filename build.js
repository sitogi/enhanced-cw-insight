import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import packageJson from './package.json' assert { type: 'json' };

const appName = packageJson.name;
const outputDir = `dist/${appName}`;

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// content.js
try {
  await esbuild.build({
    entryPoints: ['src/content.ts', 'src/background.ts'],
    outdir: outputDir,
    bundle: true,
    minify: true,
    sourcemap: false,
  })
} catch (e) {
  process.exit(1);
}

// manifest.json
fs.copyFileSync('src/manifest.json', path.join(outputDir, 'manifest.json'));
