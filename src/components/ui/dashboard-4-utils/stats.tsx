import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { D, fmt } from "@/lib/lab";

// Real values from server/collect.sh
export function DashboardStats() {
  const items = [
    { label: "CPU usage", value: `${D.cpu.pct}%`, note: `${D.cpu.cores} core(s) · load ${D.cpu.load[0]}` },
    { label: "Memory", value: `${D.mem.pct}%`, note: `${fmt(D.mem.used)} of ${fmt(D.mem.total)}` },
    { label: "Disk space (/)", value: `${D.disk.pct}%`, note: `${fmt(D.disk.used)} of ${fmt(D.disk.total)}` },
    { label: "Logged in now", value: String(D.who.length), note: D.who.length ? D.who.join(", ") : `${D.active.length} accounts running processes` },
  ];
  return (<>{items.map((s) => (
    <Card key={s.label} className="flex flex-col gap-3 p-6">
      <p className="text-sm text-muted-foreground">{s.label}</p>
      <p className="text-3xl font-semibold tracking-tight">{s.value}</p>
      <Badge variant="secondary" className="w-fit max-w-full truncate">{s.note}</Badge>
    </Card>))}</>);
}
