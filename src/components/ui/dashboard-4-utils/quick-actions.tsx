import { ChevronRight, Download, FileText, HardDrive } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { D } from "@/lib/lab";

export function downloadReport() {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([D.report], { type: "text/plain" }));
  a.download = `lab-health-report-${Date.now()}.txt`; a.click();
}

export function QuickActions() {
  const row = "flex w-full items-center gap-3 rounded-lg p-3 text-left text-sm hover:bg-muted";
  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Quick actions</CardTitle><CardDescription>Report and shortcuts.</CardDescription></CardHeader>
      <CardContent className="flex flex-col gap-1">
        <button className={row} onClick={downloadReport}><Download className="size-4" /><span className="flex-1 font-medium">Download report</span><ChevronRight className="size-4" /></button>
        <Link className={row} to="/backups"><HardDrive className="size-4" /><span className="flex-1 font-medium">Backups & cleanup</span><ChevronRight className="size-4" /></Link>
        <Link className={row} to="/faq"><FileText className="size-4" /><span className="flex-1 font-medium">How to use</span><ChevronRight className="size-4" /></Link>
      </CardContent>
    </Card>
  );
}
