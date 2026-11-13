import { useEffect, useState } from "react";
import { ExternalLink, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/lab";

type Stats = { bio: string | null; repos: number; followers: number };

export default function TeamTabs({ members }: { members: Member[] }) {
  const [active, setActive] = useState(0);
  const [stats, setStats] = useState<Record<string, Stats>>({});
  const m = members[active];

  // Live repo/follower counts + bio from the public GitHub API (fails silently if offline/rate-limited)
  useEffect(() => {
    if (stats[m.handle]) return;
    const ctrl = new AbortController();
    fetch(`https://api.github.com/users/${m.handle}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((u) => setStats((s) => ({ ...s, [m.handle]: { bio: u.bio, repos: u.public_repos, followers: u.followers } })))
      .catch(() => {});
    return () => ctrl.abort();
  }, [m.handle]); // eslint-disable-line react-hooks/exhaustive-deps

  const s = stats[m.handle];

  return (
    <section id="team" className="scroll-mt-24 px-6 pb-24 sm:px-10">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-5">
        <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">Our group</span>
        <h2 className="text-center font-semibold tracking-tight" style={{ fontSize: "clamp(1.85rem, 4vw, 2.75rem)", letterSpacing: "-0.03em", lineHeight: 1.08 }}>Find us on GitHub</h2>

        <div role="tablist" className="mt-2 grid w-full max-w-3xl grid-cols-2 gap-1 rounded-2xl border border-border bg-card p-1 sm:grid-cols-4">
          {members.map((x, i) => (
            <button key={x.handle} role="tab" aria-selected={i === active} onClick={() => setActive(i)}
              className={cn("truncate rounded-xl px-3 py-3 text-sm font-medium transition", i === active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {x.name}
            </button>
          ))}
        </div>

        <div role="tabpanel" className="flex w-full flex-col gap-6 rounded-3xl border border-border bg-card p-6 sm:flex-row sm:items-start sm:p-8">
          <img src={`https://github.com/${m.handle}.png?size=256`} alt={m.name} className="size-28 shrink-0 rounded-full border border-border bg-muted object-cover" />
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-semibold tracking-tight">{m.name}</h3>
            <p className="text-sm text-muted-foreground">{m.role} · @{m.handle}</p>
            {s?.bio && <p className="mt-1 text-sm">{s.bio}</p>}
            {s && <p className="text-xs text-muted-foreground"><span className="mr-4">{s.repos} repos</span>{s.followers} followers</p>}
            <Button className="mt-3 w-fit rounded-full" asChild>
              <a href={m.url} target="_blank" rel="noopener noreferrer"><GitBranch />Open GitHub<ExternalLink /></a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
