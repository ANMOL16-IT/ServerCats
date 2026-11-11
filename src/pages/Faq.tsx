import Faqs02 from "@/components/ui/faqs-02";
import { GITHUB } from "@/lib/lab";

const faqs = [
  { q: "How do I get fresh numbers?", a: "On the server run: npm run refresh (as root). It runs server/collect.sh, which creates accounts and folders, cleans temp files, takes a backup, tests the restore and rewrites src/data.json. Rebuild or reload the site to see it." },
  { q: "How do I read the dashboard?", a: "The four cards show CPU, memory, disk and who is logged in. The bar chart compares them, and the donut shows the last cleanup." },
  { q: "How do I get the health report?", a: "The Dashboard shows the exact terminal output of collect.sh. Press Download .txt to save it." },
  { q: "How do backups and restores work?", a: "Each run archives the department folders to a tar.gz, then extracts it to a temp folder and compares file counts. Passed means a restore works." },
  { q: "What does cleanup delete?", a: "Only files in the lab temp folder older than 7 days." },
  { q: "Who can open which folder?", a: "Only members of that department's group (mode 2770). See Storage & Access." },
];

export default function Faq() {
  return <div className="pt-12"><Faqs02 faqs={faqs} githubUrl={GITHUB} title="How to use LabServer" intro="LabServer shows what the server scripts produce. The scripts do the real work; this site displays it." /></div>;
}
