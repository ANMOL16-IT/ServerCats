# LabServer — College Computer Laboratory

React + Vite + Tailwind v4 + shadcn-style components (Skiper39 landing, dashboard cards, Faqs-02, video background).

## Run
    npm install
    npm run dev          # http://localhost:5173
    npm run build        # production build in dist/

## Real data
`server/collect.py` does the real work (100 student accounts, department folders with mode 2770,
temp cleanup, tar.gz backup + restore test, CPU/RAM/disk) and writes data.json.

    sudo npm run refresh   # runs collect.py and copies data.json to src/data.json
    # nightly via cron:  0 2 * * *  cd /path/to/labserver && npm run refresh

Run it in a VM: it creates real Linux users. The FAQ page links to the repo set in src/lib/lab.ts (GITHUB); change it if your repo name differs.
Landing hero image and Prisma video load from the internet.
