import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { D, fmt } from "@/lib/lab";

export function CleanupChart() {
  const c = D.cleanup;
  const data = [{ name: "Removed (older than 7 days)", v: c.removed }, { name: "Kept", v: c.before - c.removed }];
  return (
    <Card className="md:col-span-2">
      <CardHeader><CardTitle className="text-lg">Last cleanup</CardTitle><CardDescription>{c.removed} of {c.before} temp files removed · {fmt(c.freed)} freed</CardDescription></CardHeader>
      <CardContent className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart><Tooltip /><Pie data={data} dataKey="v" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
            {data.map((_, i) => <Cell key={i} fill={`var(--chart-${i + 1})`} />)}</Pie></PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
