import { kv } from "@vercel/kv";

const STORAGE_KEY = "residence-olympique-status";

const BLOCK_TYPE = { A: "F3", B: "F4", C: "F3", D: "F3", E: "F4", F: "F3" };
const BLOCKS = ["A", "B", "C", "D", "E", "F"];

const PHOTO_READ = {
  A: { "2":["vendu","vendu"], "3":["vendu","dispo"], "4":["vendu","dispo"], "5":["vendu","vendu"],
       "6":["dispo","dispo"], "7":["vendu","dispo"], "8":["dispo","dispo"], "9":["vendu","vendu"], "10":["vendu","vendu"] },
  B: { "2":["vendu","vendu"], "3":["vendu","vendu"], "4":["vendu","vendu"], "5":["vendu","dispo"],
       "6":["dispo","dispo"], "7":["dispo","vendu"], "8":["dispo","vendu"], "9":["vendu","vendu"], "10":["vendu","dispo"] },
  C: { "2":["dispo","dispo"], "3":["dispo","dispo"], "4":["dispo","dispo"], "5":["dispo","dispo"],
       "6":["dispo","dispo"], "7":["dispo","dispo"], "8":["dispo","dispo"], "9":["vendu","dispo"], "10":["vendu","vendu"] },
  D: { "2":["dispo","dispo"], "3":["dispo","vendu"], "4":["dispo","vendu"], "5":["dispo","dispo"],
       "6":["dispo","dispo"], "7":["dispo","vendu"], "8":["dispo","dispo"], "9":["dispo","dispo"], "10":["dispo","dispo"] },
  E: { "2":["vendu","vendu"], "3":["vendu","vendu"], "4":["vendu","vendu"], "5":["vendu","dispo"],
       "6":["vendu","dispo"], "7":["vendu","vendu"], "8":["vendu","dispo"], "9":["dispo","vendu"], "10":["dispo","dispo"] },
  F: { "2":["dispo","vendu"], "3":["dispo","dispo"], "4":["vendu","dispo"], "5":["dispo","vendu"],
       "6":["dispo","vendu"], "7":["dispo","dispo"], "8":["dispo","dispo"], "9":["dispo","dispo"], "10":["dispo","dispo"] }
};

function buildDefaultState() {
  const s = {};
  BLOCKS.forEach((block) => {
    for (let f = 1; f <= 10; f++) {
      const floor = String(f);
      const read = PHOTO_READ[block][floor];
      s[`${block}-${floor}-0`] = read ? read[0] : "dispo";
      s[`${block}-${floor}-1`] = read ? read[1] : "dispo";
    }
    s[`${block}-Duplex1-0`] = "dispo";
    s[`${block}-Duplex2-0`] = "dispo";
  });
  return s;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    let state = await kv.get(STORAGE_KEY);
    if (!state) {
      state = buildDefaultState();
      await kv.set(STORAGE_KEY, state);
    }
    return res.status(200).json(state);
  }

  if (req.method === "POST") {
    const { key, status } = req.body;
    if (!key || !status) return res.status(400).json({ error: "key et status requis" });

    let state = (await kv.get(STORAGE_KEY)) || buildDefaultState();
    state[key] = status;
    await kv.set(STORAGE_KEY, state);
    return res.status(200).json(state);
  }

  if (req.method === "PUT") {
    const state = buildDefaultState();
    await kv.set(STORAGE_KEY, state);
    return res.status(200).json(state);
  }

  res.status(405).json({ error: "Méthode non autorisée" });
}
