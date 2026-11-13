import { ArrowRight, Clock, GitBranch } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export type Faq = { q: string; a: string };

// Layout is the pasted Faqs02 block; content + contact card are now props.
export default function Faqs02({ faqs, githubUrl, title = "Your questions answered", intro }: { faqs: Faq[]; githubUrl: string; title?: string; intro?: string }) {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div className="lg:sticky lg:top-24 flex flex-col gap-5">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm shadow-black/5">FAQs</span>
            <h2 className="text-balance font-semibold tracking-tight" style={{ fontSize: "clamp(1.85rem, 4vw, 2.75rem)", letterSpacing: "-0.03em", lineHeight: 1.08 }}>{title}</h2>
            <p className="text-sm text-muted-foreground">{intro}</p>
            <div className="mt-2 flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-foreground text-background"><GitBranch className="size-4" /></span>
                <div className="flex flex-col leading-tight">
                  <p className="text-sm font-medium text-foreground">Still have questions?</p>
                  <p className="text-xs text-muted-foreground"><Clock className="mr-1.5 inline size-3" />Reach the people who built it</p>
                </div>
              </div>
              <Button size="sm" className="mt-2 w-full rounded-full" asChild>
                <a href="#team" onClick={(e) => { e.preventDefault(); document.getElementById("team")?.scrollIntoView({ behavior: "smooth" }); }}>Meet the team on GitHub<ArrowRight /></a>
              </Button>
            </div>
          </div>
          <Accordion type="single" collapsible>
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
