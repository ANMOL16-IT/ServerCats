import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { D, fmt } from "@/lib/lab";

export default function Backups() {
  const b = D.backup, c = D.cleanup;
  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 pt-24">
      <h1 className="text-3xl font-semibold tracking-tight">Backup & Maintenance</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-lg">Latest backup</CardTitle><CardDescription>{b.time}</CardDescription></CardHeader>
          <CardContent className="space-y-3 text-sm"><p className="font-medium">{b.file}</p><p>{fmt(b.size)} · sha256 {b.sha}…</p>
            <Badge variant={b.ok ? "default" : "destructive"}>Restore test {b.ok ? "passed" : "failed"}: {b.restored}/{b.files} files</Badge>
            <pre className="rounded-lg bg-muted p-3 text-xs">0 2 * * *  cd /path/to/labserver && npm run refresh</pre></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-lg">Automatic cleanup</CardTitle><CardDescription>{c.time}</CardDescription></CardHeader>
          <CardContent className="space-y-3 text-sm"><p><b>{c.removed}</b> of {c.before} temp files removed, <b>{fmt(c.freed)}</b> freed.</p><pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">{c.cmd}</pre></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-lg">Backup history</CardTitle></CardHeader>
        <CardContent><table className="w-full text-sm"><tbody>{b.history.map((h: any) => <tr key={h.file} className="border-b"><td className="py-2">{h.file}</td><td className="text-right">{fmt(h.size)}</td></tr>)}</tbody></table></CardContent></Card>
    </div>
  );
}
