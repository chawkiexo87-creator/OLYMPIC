import { useEffect, useState } from "react";

const BLOCK_TYPE = { A: "F3", B: "F4", C: "F3", D: "F3", E: "F4", F: "F3" };
const BLOCKS = ["A", "B", "C", "D", "E", "F"];

export default function Home() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((data) => {
        setState(data);
        setLoading(false);
      });
  }, []);

  async function toggleStatus(key) {
    const newStatus = state[key] === "vendu" ? "dispo" : "vendu";
    setState((prev) => ({ ...prev, [key]: newStatus }));
    const res = await fetch("/api/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, status: newStatus }),
    });
    const updated = await res.json();
    setState(updated);
  }

  async function resetAll() {
    if (!confirm("Réinitialiser tous les lots à la lecture d'origine ?")) return;
    const res = await fetch("/api/status", { method: "PUT" });
    const updated = await res.json();
    setState(updated);
  }

  if (loading || !state) return <div style={{ padding: 40 }}>Chargement…</div>;

  const counts = { dispo: 0, vendu: 0 };
  Object.values(state).forEach((v) => (counts[v] = (counts[v] || 0) + 1));
  const total = counts.dispo + counts.vendu;
  const pct = total ? Math.round((counts.vendu / total) * 100) : 0;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px 70px", fontFamily: "Inter, sans-serif" }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>Résidence Olympique</h1>
      <div style={{ color: "#6B7280", marginBottom: 20 }}>6 blocs · 132 lots · registre des ventes</div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 130, background: "#FEE2E2", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#DC2626" }}>{counts.vendu}</div>
          <div style={{ fontWeight: 600 }}>Vendus</div>
        </div>
        <div style={{ flex: 1, minWidth: 130, background: "#D1FAE5", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#059669" }}>{counts.dispo}</div>
          <div style={{ fontWeight: 600 }}>Disponibles</div>
        </div>
      </div>

      <div style={{ height: 12, borderRadius: 6, background: "#D1FAE5", overflow: "hidden", marginBottom: 6 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#DC2626" }} />
      </div>
      <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 24 }}>{pct}% des {total} lots vendus</div>

      {BLOCKS.map((block) => {
        let vendu = 0;
        for (let f = 1; f <= 10; f++) {
          if (state[`${block}-${f}-0`] === "vendu") vendu++;
          if (state[`${block}-${f}-1`] === "vendu") vendu++;
        }
        if (state[`${block}-Duplex1-0`] === "vendu") vendu++;
        if (state[`${block}-Duplex2-0`] === "vendu") vendu++;

        return (
          <div key={block} style={{ border: "1px solid #E5E7EB", borderRadius: 14, marginBottom: 20, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 20px", background: "#F4F6F8" }}>
              <div style={{ fontWeight: 800, fontSize: 20 }}>
                Bloc « {block} » <span style={{ background: "#2563EB", color: "#fff", fontSize: 13, padding: "3px 10px", borderRadius: 20, marginLeft: 8 }}>{BLOCK_TYPE[block]}</span>
              </div>
              <div style={{ color: "#6B7280", fontWeight: 600 }}>{vendu} / 22 vendus</div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "10px 16px", color: "#6B7280", fontSize: 13 }}>Étage</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", color: "#6B7280", fontSize: 13 }}>Lot 1</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", color: "#6B7280", fontSize: 13 }}>Lot 2</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((f) => (
                  <tr key={f}>
                    <td style={{ padding: "8px 20px", fontWeight: 700, color: "#6B7280" }}>{f}</td>
                    {[0, 1].map((c) => {
                      const key = `${block}-${f}-${c}`;
                      const status = state[key] || "dispo";
                      return (
                        <td key={c} style={{ padding: "8px 12px" }}>
                          <button
                            onClick={() => toggleStatus(key)}
                            style={{
                              width: "100%",
                              border: "none",
                              cursor: "pointer",
                              fontWeight: 700,
                              padding: "12px 8px",
                              borderRadius: 10,
                              background: status === "vendu" ? "#FEE2E2" : "#D1FAE5",
                              color: status === "vendu" ? "#DC2626" : "#059669",
                            }}
                          >
                            {status === "vendu" ? "Vendu" : "Disponible"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {[["Duplex1", "Duplex A"], ["Duplex2", "Duplex B"]].map(([dkey, label]) => {
                  const key = `${block}-${dkey}-0`;
                  const status = state[key] || "dispo";
                  return (
                    <tr key={dkey} style={{ background: "#EEF2FF" }}>
                      <td style={{ padding: "8px 20px", fontWeight: 700, color: "#4F46E5" }}>11–12</td>
                      <td colSpan={2} style={{ padding: "8px 12px" }}>
                        <button
                          onClick={() => toggleStatus(key)}
                          style={{
                            width: "100%",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 700,
                            padding: "12px 8px",
                            borderRadius: 10,
                            background: status === "vendu" ? "#FEE2E2" : "#D1FAE5",
                            color: status === "vendu" ? "#DC2626" : "#059669",
                          }}
                        >
                          {status === "vendu" ? "Vendu" : "Disponible"}
                        </button>
                        <div style={{ fontSize: 12, color: "#4F46E5", marginTop: 6, fontWeight: 600 }}>
                          {label} · terrasse privée avec piscine
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}

      <div style={{ textAlign: "center" }}>
        <button
          onClick={resetAll}
          style={{ fontSize: 13, fontWeight: 600, background: "none", border: "1px solid #E5E7EB", color: "#6B7280", padding: "8px 16px", borderRadius: 8, cursor: "pointer" }}
        >
          Réinitialiser à la lecture d'origine
        </button>
      </div>
    </div>
  );
}
