import { useState } from "react";
import Dashboard from "@/components/ui/dashboard-4";
import { downloadReport } from "@/components/ui/dashboard-4-utils/quick-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { D } from "@/lib/lab";

export default function DashboardPage() {
  const [open, setOpen] = useState(true);
  return (
    <div className="min-h-screen w-full p-4 pt-24 text-foreground">
      <div className="mx-auto max-w-6xl space-y-4">
        <div><h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1><p className="text-sm text-muted-foreground">{D.os} · {D.uptime}</p></div>
        <Dashboard />
        <Card>
          <CardHeader><CardTitle className="text-lg">Terminal output</CardTitle><CardDescription>Exactly what server/collect.sh printed on its last run.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2"><Button onClick={() => setOpen(!open)} variant="secondary">{open ? "Hide output" : "Show output"}</Button><Button onClick={downloadReport}>Download .txt</Button></div>
            {open && <pre className="overflow-x-auto rounded-lg bg-neutral-900 p-4 font-mono text-xs text-green-300">{D.report}</pre>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
