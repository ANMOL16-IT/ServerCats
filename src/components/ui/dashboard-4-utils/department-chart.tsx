import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { D } from "@/lib/lab";

export function DepartmentChart() {
  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Students by department</CardTitle><CardDescription>{D.created} accounts</CardDescription></CardHeader>
      <CardContent className="flex flex-col gap-3">
        {D.folders.map((f: any, i: number) => (
          <div key={f.dept}>
            <div className="flex justify-between text-sm"><span className="font-medium uppercase">{f.dept}</span><span className="text-muted-foreground">{f.users}</span></div>
            <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full" style={{ width: `${(f.users / Math.max(...D.folders.map((x: any) => x.users), 1)) * 100}%`, background: `var(--chart-${i + 1})` }} /></div>
          </div>))}
      </CardContent>
    </Card>
  );
}
