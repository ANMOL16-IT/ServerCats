#!/usr/bin/env bash
# LabServer collector (bash): does the real work (users, folders, cleanup, backup, restore test)
# prints the health report and writes data.json for the website.
# Run as root on the lab server (cron: 0 2 * * *).
set -u
cd "$(dirname "$0")"

if [ "$(id -u)" -eq 0 ]; then ROOT=true; B=/srv/lab; else ROOT=false; B="$HOME/lab-server"; fi
DEPTS=(cse ece mech civil)
mkdir -p "$B"

j() { printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'; }
gb() { awk -v x="$1" 'BEGIN{printf "%.1f GB", x/1073741824}'; }
hs() { awk -v x="$1" 'BEGIN{ if (x>=1048576) printf "%.1f MB", x/1048576; else if (x>=1024) printf "%d KB", x/1024; else printf "%d B", x }'; }
now() { date "$1"; }

cpu_pct() {
  read -r _ a1 a2 a3 a4 a5 a6 a7 a8 _ < /proc/stat
  local t1=$((a1+a2+a3+a4+a5+a6+a7+a8)) i1=$((a4+a5))
  sleep 1
  read -r _ b1 b2 b3 b4 b5 b6 b7 b8 _ < /proc/stat
  local t2=$((b1+b2+b3+b4+b5+b6+b7+b8)) i2=$((b4+b5))
  local dt=$((t2-t1)); [ "$dt" -lt 1 ] && dt=1
  awk -v dt="$dt" -v di=$((i2-i1)) 'BEGIN{printf "%d", 100*(1-di/dt)+0.5}'
}

# 1. Users: 100 students, 25 per department
ROWS=()
for i in $(seq 1 100); do
  ROWS+=("$(printf 'student%03d' "$i"),${DEPTS[$(( (i-1) % 4 ))]}")
done
{ echo "username,department"; printf '%s\n' "${ROWS[@]}"; } > "$B/students.csv"
if $ROOT; then
  for d in "${DEPTS[@]}"; do getent group "lab-$d" >/dev/null || groupadd "lab-$d"; done
  for r in "${ROWS[@]}"; do
    u=${r%,*}; d=${r#*,}
    if ! id "$u" >/dev/null 2>&1; then
      useradd -m -s /bin/bash -g "lab-$d" "$u" && echo "$u:Lab@2026" | chpasswd && chage -d 0 "$u"
    fi
  done
fi
CREATED=$(getent passwd | grep -c '^student')
CSV=${#ROWS[@]}

# 2. Software
TOOLS=(gcc python3 java git node make vim curl)
SOFT_JSON=""; SOFT_OK=0
for t in "${TOOLS[@]}"; do
  if command -v "$t" >/dev/null 2>&1; then
    v=$("$t" --version 2>&1 | head -1 | cut -c1-60); SOFT_OK=$((SOFT_OK+1)); vj="\"$(j "$v")\""
  else
    vj=null
  fi
  SOFT_JSON+="${SOFT_JSON:+,}{\"n\":\"$t\",\"v\":$vj}"
done

# 3. Departmental shared folders
FOLDERS_JSON=""; FOLDERS_TXT=""
for d in "${DEPTS[@]}"; do
  p="$B/srv/$d"; mkdir -p "$p"
  $ROOT && chown ":lab-$d" "$p"
  chmod 2770 "$p"
  grep ",$d\$" "$B/students.csv" | cut -d, -f1 > "$p/members.txt"
  mode=$(stat -c %a "$p"); grp=$(stat -c %G "$p"); nf=$(ls -A "$p" | wc -l)
  FOLDERS_JSON+="${FOLDERS_JSON:+,}{\"dept\":\"$d\",\"path\":\"$p\",\"mode\":\"$mode\",\"group\":\"$grp\",\"files\":$nf,\"users\":25}"
  FOLDERS_TXT+="${FOLDERS_TXT:+, }$d($mode)"
done

# 4. Cleanup: seed 30 test files (20 are 10 days old), delete everything older than 7 days
tmp="$B/tmp"; mkdir -p "$tmp"
stamp=$(date +%s)
for i in $(seq 0 29); do
  f="$tmp/lab_${stamp}_$i.tmp"
  head -c 20480 /dev/urandom > "$f"
  if [ "$i" -lt 20 ]; then touch -d "10 days ago" "$f"; else touch -d "1 day ago" "$f"; fi
done
tmp_size() { find "$tmp" -type f -printf '%s\n' | awk '{s+=$1} END{print s+0}'; }
tmp_count() { find "$tmp" -type f | wc -l; }
N0=$(tmp_count); S0=$(tmp_size)
CLEAN_CMD="find $tmp -type f -mtime +7 -delete"
find "$tmp" -type f -mtime +7 -delete
N1=$(tmp_count); S1=$(tmp_size)
REMOVED=$((N0-N1)); FREED=$((S0-S1)); CLEAN_TIME=$(now '+%d %b %Y, %H:%M')

# 5. Backup + restore test
bd="$B/backups"; mkdir -p "$bd"
ts=$(date +%Y%m%d-%H%M%S); bf="$bd/backup-$ts.tar.gz"
tar -czf "$bf" -C "$B" srv
SRC=$(find "$B/srv" -type f | wc -l)
td=$(mktemp -d)
tar -xzf "$bf" -C "$td"
GOT=$(find "$td/srv" -type f | wc -l)
rm -rf "$td"
SHA=$(sha256sum "$bf" | cut -c1-16)
BSIZE=$(stat -c %s "$bf")
if [ "$SRC" -eq "$GOT" ]; then OK=true; RESULT=PASSED; else OK=false; RESULT=FAILED; fi
HIST_JSON=""
for p in $(ls -1 "$bd"/*.tar.gz | sort | tail -6); do
  HIST_JSON+="${HIST_JSON:+,}{\"file\":\"$(basename "$p")\",\"size\":$(stat -c %s "$p")}"
done
BACKUP_TIME=$(now '+%d %b %Y, %H:%M')

# 6. Monitoring
CPU=$(cpu_pct); CORES=$(nproc)
read -r L1 L2 L3 _ < /proc/loadavg
MT=$(awk '/^MemTotal/{print $2*1024}' /proc/meminfo)
MA=$(awk '/^MemAvailable/{print $2*1024}' /proc/meminfo)
MU=$((MT-MA)); MPCT=$(awk -v u="$MU" -v t="$MT" 'BEGIN{printf "%d", 100*u/t+0.5}')
read -r DT DU < <(df -B1 / | awk 'NR==2{print $2, $3}')
DPCT=$(awk -v u="$DU" -v t="$DT" 'BEGIN{printf "%d", 100*u/t+0.5}')
HOST=$(hostname)
OSNAME=$(. /etc/os-release; echo "$PRETTY_NAME")
UPTIME=$(uptime -p)
TIME=$(now '+%d %b %Y, %H:%M:%S')
WHO_JSON=""
while IFS= read -r line; do [ -n "$line" ] && WHO_JSON+="${WHO_JSON:+,}\"$(j "$line")\""; done < <(who)
ACTIVE_JSON=""
for u in $(ps -eo user= | sort -u); do ACTIVE_JSON+="${ACTIVE_JSON:+,}\"$u\""; done

REPORT="LAB SERVER HEALTH REPORT
Generated : $TIME
Host      : $HOST ($OSNAME)
Uptime    : $UPTIME

CPU       : ${CPU}% of $CORES cores, load [$L1, $L2, $L3]
Memory    : $(gb "$MU") / $(gb "$MT") (${MPCT}%)
Disk (/)  : $(gb "$DU") / $(gb "$DT") (${DPCT}%)

Accounts  : $CREATED student accounts present, $CSV in students.csv
Software  : $SOFT_OK/${#TOOLS[@]} lab tools installed
Folders   : $FOLDERS_TXT
Cleanup   : removed $REMOVED of $N0 temp files, freed $(hs "$FREED")
Backup    : $(basename "$bf") ($(hs "$BSIZE")), restore test $RESULT ($GOT/$SRC files)
"

cat > data.json <<EOF
{
 "host": "$(j "$HOST")",
 "os": "$(j "$OSNAME")",
 "time": "$TIME",
 "uptime": "$(j "$UPTIME")",
 "cpu": {"pct": $CPU, "cores": $CORES, "load": [$L1, $L2, $L3]},
 "mem": {"total": $MT, "used": $MU, "pct": $MPCT},
 "disk": {"total": $DT, "used": $DU, "pct": $DPCT},
 "who": [$WHO_JSON],
 "active": [$ACTIVE_JSON],
 "root": $ROOT,
 "base": "$B",
 "created": $CREATED,
 "csv": $CSV,
 "soft": [$SOFT_JSON],
 "folders": [$FOLDERS_JSON],
 "cleanup": {"before": $N0, "removed": $REMOVED, "freed": $FREED, "cmd": "$(j "$CLEAN_CMD")", "time": "$CLEAN_TIME"},
 "backup": {"file": "$(basename "$bf")", "size": $BSIZE, "sha": "$SHA", "files": $SRC, "restored": $GOT, "ok": $OK, "history": [$HIST_JSON], "time": "$BACKUP_TIME"},
 "report": "$(printf '%s' "$REPORT" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' | awk '{printf "%s\\n", $0}')"
}
EOF

printf '%s\n' "$REPORT"
