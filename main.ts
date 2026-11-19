// Leonida Ledger entrypoint (Node 22, standard library only). The guide is
// the plain static files in app/ and the renders in screenshots/; this
// program hands them in by copying both folders to the output directory and
// writing dossier.json with the vendored make.fun library, which is the
// summary the judge reads. vendor/makefun-frontend.ts stays untouched: the
// scorer rebuilds the dossier with its own copy and compares byte for byte.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const appDir = join(repoRoot, 'app');
const shotsDir = join(repoRoot, 'screenshots');

mkdirSync(outputDir, { recursive: true });
cpSync(appDir, join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });

// The scorer's own caps: at most 4 screenshots, each at most 256 KiB; app/
// at most 993 files and directories and 48 MiB. The dossier text cap keeps
// the judge's view inside its token budget.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);

const shotNames = existsSync(shotsDir) ? readdirSync(shotsDir).sort() : [];
console.log(`Leonida Ledger handed in: ${shotNames.length} screenshot(s) (${shotNames.join(', ')}) and dossier.json (${dossier.length} bytes).`);
