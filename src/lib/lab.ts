import data from "@/data.json";
// Real output of server/collect.py (run `npm run refresh` to update)
export const D = data as any;
export const fmt = (x: number) => x >= 2 ** 30 ? (x / 2 ** 30).toFixed(1) + " GB" : x >= 2 ** 20 ? (x / 2 ** 20).toFixed(1) + " MB" : x >= 1024 ? Math.round(x / 1024) + " KB" : x + " B";
export const GITHUB = "https://github.com/allenasat044-prog/labserver";
