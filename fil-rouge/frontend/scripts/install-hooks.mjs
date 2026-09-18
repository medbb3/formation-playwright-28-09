// Installe les hooks Git du dépôt (scripts/pre-commit.sh, scripts/commit-msg.sh) dans .git/hooks
import { copyFileSync, chmodSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const racine = resolve(process.cwd(), '..');
const hooks = resolve(racine, '.git/hooks');
if (!existsSync(hooks)) { console.error('Pas de dépôt Git à la racine (git init -b main).'); process.exit(1); }
for (const [src, dst] of [['pre-commit.sh', 'pre-commit'], ['commit-msg.sh', 'commit-msg']]) {
  copyFileSync(resolve(racine, 'scripts', src), resolve(hooks, dst));
  chmodSync(resolve(hooks, dst), 0o755);
  console.log(`hook installé : ${dst}`);
}
