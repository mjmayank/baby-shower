"use client";

import { useEffect, useMemo, useState } from "react";
import { GUESTS, findGuest, normalizeName, type Guest } from "@/lib/guests";
import CameraCapture from "./CameraCapture";
import MagicScreen from "./MagicScreen";
import OceanDecor from "./OceanDecor";

type Step = "splash" | "details" | "attributes" | "camera" | "magic" | "thanks";

const STEPS: Step[] = ["splash", "details", "attributes", "camera", "magic", "thanks"];

export default function ShowerApp() {
  const [step, setStep] = useState<Step>("splash");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [attributesText, setAttributesText] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [matchedGuest, setMatchedGuest] = useState<Guest | null>(null);
  const [pending, setPending] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  // Dev nicety: jump straight to a screen with e.g. localhost:3000/?step=magic
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("step") as Step | null;
    if (requested && STEPS.includes(requested)) setStep(requested);
  }, []);

  const suggestions = useMemo(() => {
    const n = normalizeName(name);
    if (n.length < 2) return [];
    const matches = GUESTS.filter((g) => normalizeName(g.name).includes(n));
    if (matches.length === 1 && normalizeName(matches[0].name) === n) return [];
    return matches.slice(0, 5);
  }, [name]);

  function selectGuest(guest: Guest) {
    setName(guest.name);
    if (guest.email) setEmail(guest.email);
  }

  function emailValid(): boolean {
    return /\S+@\S+\.\S+/.test(email);
  }

  function goToAttributes() {
    const guest = findGuest(name);
    setMatchedGuest(guest ?? null);
    setAttributesText(guest ? guest.attributes.join(", ") : "");
    setStep("attributes");
  }

  function submit() {
    if (!photo) return;
    const payload = {
      name: name.trim(),
      email: email.trim(),
      attributes: attributesText.split(",").map((a) => a.trim()).filter(Boolean),
      imageDataUrl: photo,
    };
    // Fire and forget: the thank-you screen shows immediately and the next
    // guest can start while this generates in the background.
    setPending((p) => p + 1);
    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          throw new Error(data.error || `Request failed (${res.status})`);
        }
        if (data.problems?.length) {
          setErrors((e) => [...e, ...data.problems.map((p: string) => `${payload.name}: ${p}`)]);
        }
      })
      .catch((err) => {
        setErrors((e) => [
          ...e,
          `${payload.name}: ${err instanceof Error ? err.message : String(err)}`,
        ]);
      })
      .finally(() => setPending((p) => p - 1));
    setStep("magic");
  }

  function resetForNextGuest() {
    setName("");
    setEmail("");
    setAttributesText("");
    setPhoto(null);
    setMatchedGuest(null);
    setStep("splash");
  }

  const firstName = name.trim().split(/\s+/)[0] || "friend";

  return (
    <main className="scene">
      <OceanDecor />

      {pending > 0 && (
        <div className="pending-pill">
          🫧 {pending} caricature{pending > 1 ? "s" : ""} brewing…
        </div>
      )}

      {step === "splash" && (
        <div className="card">
          <span className="big-emoji">🐳</span>
          <h1>Mayank &amp; Cayley&apos;s Baby Shower</h1>
          <div className="splash-creatures">🐙 🐠 🐢 🦀 🪼</div>
          <p className="subtitle">
            Dive in and turn yourself into an adorable baby caricature — snapped by our
            camera, drawn by AI, and sent straight to you!
          </p>
          <button className="btn btn-primary btn-big" onClick={() => setStep("details")}>
            🌊 Dive In!
          </button>
        </div>
      )}

      {step === "details" && (
        <div className="card">
          <span className="step-label">Step 1 of 3 · Who are you?</span>
          <h2>Ahoy there! 👋</h2>
          <div className="field">
            <label htmlFor="guest-name">Your name</label>
            <input
              id="guest-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              autoComplete="off"
              autoFocus
            />
            {suggestions.length > 0 && (
              <div className="suggestions">
                {suggestions.map((g) => (
                  <button key={g.name} className="suggestion-chip" onClick={() => selectGuest(g)}>
                    {g.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="field">
            <label htmlFor="guest-email">Your email</label>
            <input
              id="guest-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. you@example.com"
              autoComplete="off"
            />
            <p className="hint">We&apos;ll email your baby caricature to this address.</p>
          </div>
          <div className="button-row">
            <button className="btn btn-secondary" onClick={() => setStep("splash")}>
              ← Back
            </button>
            <button
              className="btn btn-primary"
              onClick={goToAttributes}
              disabled={!name.trim() || !emailValid()}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {step === "attributes" && (
        <div className="card">
          <span className="step-label">Step 2 of 3 · About you</span>
          <h2>What are you known for, {firstName}?</h2>
          {matchedGuest ? (
            <div className="known-banner">
              🐚 We found you on the guest list and filled in what you&apos;re famous for —
              feel free to tweak it!
            </div>
          ) : (
            <p className="subtitle">
              List a few things you&apos;re known for — hobbies, obsessions, signature moves.
              They&apos;ll show up in your baby caricature!
            </p>
          )}
          <div className="field">
            <label htmlFor="guest-attrs">Known for (comma-separated)</label>
            <textarea
              id="guest-attrs"
              rows={3}
              value={attributesText}
              onChange={(e) => setAttributesText(e.target.value)}
              placeholder="e.g. surfing, baking sourdough, karaoke nights"
            />
          </div>
          <div className="button-row">
            <button className="btn btn-secondary" onClick={() => setStep("details")}>
              ← Back
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setStep("camera")}
              disabled={!attributesText.trim()}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {step === "camera" && (
        <div className="card">
          <span className="step-label">Step 3 of 3 · Strike a pose</span>
          <h2>Say fish! 🐟</h2>
          <CameraCapture photo={photo} onCapture={setPhoto} onRetake={() => setPhoto(null)} />
          {photo && (
            <div className="button-row" style={{ marginTop: 16 }}>
              <button className="btn btn-primary btn-big" onClick={submit}>
                🍼 Baby-fy me!
              </button>
            </div>
          )}
          <div className="button-row" style={{ marginTop: 16 }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setPhoto(null);
                setStep("attributes");
              }}
            >
              ← Back
            </button>
          </div>
        </div>
      )}

      {step === "magic" && <MagicScreen photo={photo} onDone={() => setStep("thanks")} />}

      {step === "thanks" && (
        <div className="card">
          <span className="big-emoji swimmer">🐠</span>
          <h2>Thanks, {firstName}! 🎉</h2>
          <p className="subtitle">
            Your baby caricature is swimming its way to you — keep an eye on your
            inbox in the next few minutes!
          </p>
          <p className="subtitle">Thanks for celebrating with Mayank &amp; Cayley 💙</p>
          <button className="btn btn-primary btn-big" onClick={resetForNextGuest}>
            🌊 Next guest, dive in!
          </button>
        </div>
      )}

      {errors.length > 0 && (
        <div className="error-toast" onClick={() => setErrors([])}>
          <strong>⚠️ Needs attention (tap to dismiss):</strong>
          {errors.slice(-3).map((e, i) => (
            <div key={i}>{e}</div>
          ))}
        </div>
      )}
    </main>
  );
}
