import { PrismaHero } from "@/components/ui/prisma-hero";
import { D } from "@/lib/lab";

const outcomes = [["Private by default", "Mode 2770: only the owning group can read or write."], ["Clean separation", "One folder per department, no mixed-up files."], ["Shared inside a team", "Setgid makes new files inherit the department group."], ["Easy to audit", "Group membership shows exactly who can reach what."]];

// Background video behind the content
export default function Storage() {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10"><PrismaHero /></div>
      <div className="mx-auto max-w-5xl space-y-8 p-4 pt-24 text-[#E1E0CC]">
        <div><h1 className="text-4xl font-semibold tracking-tight">Storage & Access</h1><p className="opacity-80">Each department gets its own folder. Students only see their own.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {D.folders.map((f: any) => (<div key={f.dept} className="rounded-2xl border border-white/20 bg-black/40 p-5 backdrop-blur">
            <h2 className="text-xl font-semibold uppercase">{f.dept}</h2><p className="text-sm opacity-80">{f.users} students · group {f.group}<br />mode {f.mode} (setgid)</p><code className="mt-2 block break-all text-xs opacity-70">{f.path}</code></div>))}
        </div>
        <h2 className="text-2xl font-semibold">What this gives you</h2>
        <div className="grid gap-4 sm:grid-cols-2">{outcomes.map(([t, d]) => <div key={t} className="rounded-2xl border border-white/20 bg-black/40 p-5 backdrop-blur"><h3 className="font-semibold">{t}</h3><p className="text-sm opacity-80">{d}</p></div>)}</div>
      </div>
    </div>
  );
}
