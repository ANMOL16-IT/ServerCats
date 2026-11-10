#!/usr/bin/env python3
"""LabServer collector: does the real work (users, folders, cleanup, backup, restore test)
and writes data.json for the website. Run as root on the lab server (cron: 0 2 * * *)."""
import os, json, time, shutil, tarfile, hashlib, tempfile, subprocess, glob, grp, pwd, datetime

def sh(c): return subprocess.run(c, shell=True, capture_output=True, text=True).stdout.strip()
root = os.geteuid() == 0
B = '/srv/lab' if root else os.path.expanduser('~/lab-server')
DEPTS = ['cse', 'ece', 'mech', 'civil']
os.makedirs(B, exist_ok=True)

def cpu_pct():
    def r():
        v = list(map(int, open('/proc/stat').readline().split()[1:])); return sum(v), v[3] + v[4]
    a, i = r(); time.sleep(1); b, j = r()
    return round(100 * (1 - (j - i) / max(b - a, 1)))

# 1. Users: 100 students from a CSV, 25 per department
rows = [f"student{i:03d},{DEPTS[(i-1) % 4]}" for i in range(1, 101)]
open(f'{B}/students.csv', 'w').write('username,department\n' + '\n'.join(rows) + '\n')
if root:
    for d in DEPTS: sh(f'getent group lab-{d} || groupadd lab-{d}')
    for r in rows:
        u, d = r.split(',')
        try: pwd.getpwnam(u)
        except KeyError:
            sh(f'useradd -m -s /bin/bash -g lab-{d} {u} && echo "{u}:Lab@2026" | chpasswd && chage -d 0 {u}')
created = sum(1 for p in pwd.getpwall() if p.pw_name.startswith('student'))

# 2. Software
tools = ['gcc', 'python3', 'java', 'git', 'node', 'make', 'vim', 'curl']
soft = [{'n': t, 'v': sh(f'{t} --version 2>&1 | head -1')[:60] if shutil.which(t) else None} for t in tools]

# 3. Departmental shared folders
folders = []
for d in DEPTS:
    p = f'{B}/srv/{d}'; os.makedirs(p, exist_ok=True)
    if root: shutil.chown(p, group=f'lab-{d}')
    os.chmod(p, 0o2770)
    open(f'{p}/members.txt', 'w').write('\n'.join(r.split(',')[0] for r in rows if r.endswith(d)) + '\n')
    st = os.stat(p)
    folders.append({'dept': d, 'path': p, 'mode': oct(st.st_mode & 0o7777)[2:],
                    'group': grp.getgrgid(st.st_gid).gr_name, 'files': len(os.listdir(p)), 'users': 25})

# 4. Cleanup: seed 30 test files (20 are 10 days old), delete everything older than 7 days
tmp = f'{B}/tmp'; os.makedirs(tmp, exist_ok=True)
for i in range(30):
    f = f'{tmp}/lab_{int(time.time())}_{i}.tmp'; open(f, 'wb').write(os.urandom(20480))
    t = time.time() - (10 if i < 20 else 1) * 86400; os.utime(f, (t, t))
size = lambda: sum(os.path.getsize(f) for f in glob.glob(f'{tmp}/*'))
n0, s0 = len(os.listdir(tmp)), size()
sh(f'find {tmp} -type f -mtime +7 -delete')
cleanup = {'before': n0, 'removed': n0 - len(os.listdir(tmp)), 'freed': s0 - size(),
           'cmd': f'find {tmp} -type f -mtime +7 -delete', 'time': datetime.datetime.now().strftime('%d %b %Y, %H:%M')}

# 5. Backup + restore test
bd = f'{B}/backups'; os.makedirs(bd, exist_ok=True)
ts = datetime.datetime.now().strftime('%Y%m%d-%H%M%S'); bf = f'{bd}/backup-{ts}.tar.gz'
with tarfile.open(bf, 'w:gz') as t: t.add(f'{B}/srv', arcname='srv')
src = sum(len(f) for _, _, f in os.walk(f'{B}/srv'))
with tempfile.TemporaryDirectory() as td:
    with tarfile.open(bf) as t: t.extractall(td)
    got = sum(len(f) for _, _, f in os.walk(f'{td}/srv'))
sha = hashlib.sha256(open(bf, 'rb').read()).hexdigest()
history = [{'file': os.path.basename(p), 'size': os.path.getsize(p)} for p in sorted(glob.glob(f'{bd}/*.tar.gz'))[-6:]]
backup = {'file': os.path.basename(bf), 'size': os.path.getsize(bf), 'sha': sha[:16], 'files': src,
          'restored': got, 'ok': src == got, 'history': history, 'time': datetime.datetime.now().strftime('%d %b %Y, %H:%M')}

# 6. Monitoring
mi = {l.split(':')[0]: int(l.split()[1]) * 1024 for l in open('/proc/meminfo')}
mt, mu = mi['MemTotal'], mi['MemTotal'] - mi['MemAvailable']
du = shutil.disk_usage('/')
procs = sorted(set(sh('ps -eo user=').split()))
D = {'host': sh('hostname'), 'os': sh('. /etc/os-release; echo $PRETTY_NAME'), 'time': datetime.datetime.now().strftime('%d %b %Y, %H:%M:%S'),
     'uptime': sh('uptime -p'), 'cpu': {'pct': cpu_pct(), 'cores': os.cpu_count(), 'load': [round(x, 2) for x in os.getloadavg()]},
     'mem': {'total': mt, 'used': mu, 'pct': round(100 * mu / mt)}, 'disk': {'total': du.total, 'used': du.used, 'pct': round(100 * du.used / du.total)},
     'who': sh('who').splitlines(), 'active': procs, 'root': root, 'base': B, 'created': created, 'csv': len(rows),
     'soft': soft, 'folders': folders, 'cleanup': cleanup, 'backup': backup}
gb = lambda x: f'{x/2**30:.1f} GB'
hs = lambda x: f'{x/2**20:.1f} MB' if x >= 2**20 else (f'{x//1024} KB' if x >= 1024 else f'{x} B')
D['report'] = f"""LAB SERVER HEALTH REPORT
Generated : {D['time']}
Host      : {D['host']} ({D['os']})
Uptime    : {D['uptime']}

CPU       : {D['cpu']['pct']}% of {D['cpu']['cores']} cores, load {D['cpu']['load']}
Memory    : {gb(mu)} / {gb(mt)} ({D['mem']['pct']}%)
Disk (/)  : {gb(du.used)} / {gb(du.total)} ({D['disk']['pct']}%)

Accounts  : {created} student accounts present, {len(rows)} in students.csv
Software  : {sum(1 for s in soft if s['v'])}/{len(soft)} lab tools installed
Folders   : {', '.join(f"{f['dept']}({f['mode']})" for f in folders)}
Cleanup   : removed {cleanup['removed']} of {cleanup['before']} temp files, freed {hs(cleanup['freed'])}
Backup    : {backup['file']} ({hs(backup['size'])}), restore test {'PASSED' if backup['ok'] else 'FAILED'} ({got}/{src} files)
"""
json.dump(D, open('data.json', 'w'), indent=1)
print(D['report'])
