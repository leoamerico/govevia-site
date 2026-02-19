#!/usr/bin/env node
/**
 * webm-to-gif.mjs
 *
 * Converte todos os vídeos .webm gerados pelo Playwright (demo-results/)
 * em arquivos .gif dentro de demo-gifs/, usando ffmpeg-static.
 *
 * Uso:  node scripts/webm-to-gif.mjs
 */

import { execSync }  from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// ffmpeg-static resolve o binário correto para o SO atual
let ffmpegBin;
try {
  ffmpegBin = require('ffmpeg-static');
} catch {
  console.error('ffmpeg-static não encontrado. Execute: npm install --save-dev ffmpeg-static');
  process.exit(1);
}

const INPUT_DIR  = join(process.cwd(), 'demo-results');
const OUTPUT_DIR = join(process.cwd(), 'demo-gifs');

if (!existsSync(INPUT_DIR)) {
  console.error(`Diretório ${INPUT_DIR} não encontrado. Execute "npm run demo:record" primeiro.`);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });

/** Encontra todos os .webm recursivamente */
function findWebm(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) results.push(...findWebm(full));
    else if (extname(entry) === '.webm') results.push(full);
  }
  return results;
}

const videos = findWebm(INPUT_DIR);

if (videos.length === 0) {
  console.log('Nenhum .webm encontrado em demo-results/. Verifique se a gravação foi executada.');
  process.exit(0);
}

console.log(`\nConvertendo ${videos.length} vídeo(s) para GIF...\n`);

for (const webm of videos) {
  // deriva o nome do GIF a partir do path relativo (substitui / por -)
  const rel   = webm.replace(INPUT_DIR, '').replace(/[\\/]/g, '-').replace(/^-/, '');
  const name  = basename(rel, '.webm') + '.gif';
  const out   = join(OUTPUT_DIR, name);

  console.log(`  ${basename(webm)} → demo-gifs/${name}`);

  // Paleta em dois passos: melhor qualidade de cor nos GIFs
  const palette = out.replace('.gif', '-palette.png');

  try {
    execSync(
      `"${ffmpegBin}" -y -i "${webm}" -vf "fps=12,scale=960:-1:flags=lanczos,palettegen" "${palette}"`,
      { stdio: 'pipe' }
    );
    execSync(
      `"${ffmpegBin}" -y -i "${webm}" -i "${palette}" -lavfi "fps=12,scale=960:-1:flags=lanczos[x];[x][1:v]paletteuse" -loop 0 "${out}"`,
      { stdio: 'pipe' }
    );
    // remove arquivo de paleta temporário
    try { unlinkSync(palette); } catch { /* ignora se não existir */ }
    console.log(`  ✓  ${name}`);
  } catch (err) {
    console.error(`  ✗  Falha em ${basename(webm)}: ${err.message}`);
  }
}

console.log(`\nGIFs salvos em:  ${OUTPUT_DIR}\n`);
