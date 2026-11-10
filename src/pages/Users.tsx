import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { D } from "@/lib/lab";

export default function Users() {
  const ok = D.soft.filter((s: any) => s.v).length;
  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 pt-24">
      <h1 className="text-3xl font-semibold tracking-tight">Users & Software</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-6"><p className="text-4xl font-semibold">{D.created}</p><p className="text-sm text-muted-foreground">student accounts on this server (students.csv has {D.csv} rows)</p></Card>
        <Card className="p-6"><p className="text-4xl font-semibold">{ok}/{D.soft.length}</p><p className="text-sm text-muted-foreground">lab tools installed</p></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-lg">Installed software</CardTitle></CardHeader>
        <CardContent><table className="w-full text-sm"><tbody>{D.soft.map((s: any) => (
          <tr key={s.n} className="border-b"><td className="py-2 font-medium">{s.n}</td><td className="text-muted-foreground">{s.v ?? "—"}</td><td className="text-right"><Badge variant={s.v ? "default" : "secondary"}>{s.v ? "installed" : "missing"}</Badge></td></tr>))}</tbody></table></CardContent></Card>
    </div>
  );
}
