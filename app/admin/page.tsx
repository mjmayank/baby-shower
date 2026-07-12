"use client";

// Admin panel: edit the guest list without a deploy. Protected by
// ADMIN_PASSWORD (sent with each save; nothing is stored in the browser).

import { useEffect, useState } from "react";

interface Row {
  name: string;
  email: string;
  attributes: string; // comma-separated in the form
}

export default function AdminPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [password, setPassword] = useState("");
  const [backend, setBackend] = useState<string>("");
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/guests", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setBackend(data.backend || "");
        setRows(
          (data.guests || []).map((g: { name: string; email?: string; attributes: string[] }) => ({
            name: g.name,
            email: g.email || "",
            attributes: (g.attributes || []).join(", "),
          }))
        );
      })
      .catch((err) => setStatus({ kind: "error", text: `Could not load guests: ${err}` }));
  }, []);

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((r) => r.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({
          guests: rows.map((r) => ({
            name: r.name,
            email: r.email || undefined,
            attributes: r.attributes.split(",").map((a) => a.trim()).filter(Boolean),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setStatus({
        kind: "ok",
        text:
          `Saved ${data.count} guests` +
          (data.backend === "memory"
            ? " — WARNING: no Redis attached, so this lasts only until the server restarts!"
            : " to Redis ✓"),
      });
      // Drop rows that the server filtered out (e.g. blank names).
      setRows((r) => r.filter((row) => row.name.trim()));
    } catch (err) {
      setStatus({ kind: "error", text: err instanceof Error ? err.message : String(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="scene admin-scene">
      <div className="card admin-card">
        <h1>🐳 Guest List Admin</h1>
        <p className="subtitle">
          Add or edit guests and their &quot;known for&quot; attributes. Changes go live at the
          booth as soon as you save — no deploy needed.
          {backend === "memory" && (
            <strong>
              {" "}
              (Running without Redis: edits are temporary! Attach Upstash Redis on Vercel to make
              them stick.)
            </strong>
          )}
        </p>

        <div className="admin-rows">
          <div className="admin-row admin-row-header">
            <span>Name</span>
            <span>Email (optional)</span>
            <span>Known for (comma-separated)</span>
            <span />
          </div>
          {rows.map((row, i) => (
            <div className="admin-row" key={i}>
              <input
                value={row.name}
                placeholder="Name"
                onChange={(e) => updateRow(i, { name: e.target.value })}
              />
              <input
                value={row.email}
                type="email"
                placeholder="Email"
                onChange={(e) => updateRow(i, { email: e.target.value })}
              />
              <input
                value={row.attributes}
                placeholder="e.g. tennis, baking"
                onChange={(e) => updateRow(i, { attributes: e.target.value })}
              />
              <button
                className="admin-delete"
                title="Remove guest"
                onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))}
              >
                🗑
              </button>
            </div>
          ))}
        </div>

        <div className="button-row" style={{ marginTop: 16 }}>
          <button
            className="btn btn-secondary"
            onClick={() => setRows((r) => [...r, { name: "", email: "", attributes: "" }])}
          >
            ＋ Add guest
          </button>
        </div>

        <div className="admin-save">
          <input
            type="password"
            value={password}
            placeholder="Admin password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn btn-primary" onClick={save} disabled={saving || !password}>
            {saving ? "Saving…" : "💾 Save all"}
          </button>
        </div>

        {status && (
          <div className={status.kind === "ok" ? "admin-status-ok" : "admin-status-error"}>
            {status.text}
          </div>
        )}
      </div>
    </main>
  );
}
