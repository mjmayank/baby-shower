"use client";

import { useEffect, useMemo, useState } from "react";
import { normalizeName, type Guest } from "@/lib/guests";
import CameraCapture from "./CameraCapture";
import MagicScreen from "./MagicScreen";
import OceanDecor from "./OceanDecor";

type Step = "splash" | "details" | "attributes" | "camera" | "magic" | "thanks";

const STEPS: Step[] = ["splash", "details", "attributes", "camera", "magic", "thanks"];

interface GeneratePayload {
  name: string;
  email: string;
  attributes: string[];
  imageDataUrl: string;
}

interface FailedJob {
  id: number;
  name: string;
  message: string;
  payload: GeneratePayload;
}

/** Turn a failed request into a message specific enough to act on. */
function describeError(err: unknown, payloadBytes: number): string {
  const mb = (payloadBytes / 1024 / 1024).toFixed(1);
  if (err instanceof TypeError) {
    // fetch() rejects with TypeError when no HTTP response arrived at all:
    // wifi drop, server unreachable, or the connection was cut mid-upload.
    return `Upload never reached the server (photo payload ${mb}MB) — usually a wifi drop. Tap Retry.`;
  }
  return err instanceof Error ? err.message : String(err);
}

export default function ShowerApp() {
  const [step, setStep] = useState<Step>("splash");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [attributesText, setAttributesText] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [matchedGuest, setMatchedGuest] = useState<Guest | null>(null);
  const [pending, setPending] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [failed, setFailed] = useState<FailedJob[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);

  // Dev nicety: jump straight to a screen with e.g. localhost:3000/?step=magic
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("step") as Step | null;
    if (requested && STEPS.includes(requested)) setStep(requested);
  }, []);

  // Load the guest list, and refresh it each time a guest reaches the name
  // screen so /admin edits show up without reloading the kiosk.
  useEffect(() => {
    if (step !== "splash" && step !== "details") return;
    fetch("/api/guests", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.guests)) setGuests(data.guests);
      })
      .catch(() => {
        /* keep the previous list; suggestions just won't refresh */
      });
  }, [step]);

  const suggestions = useMemo(() => {
    const n = normalizeName(name);
    if (n.length === 0) return [];
    // Names starting with the typed text rank above substring matches, and an
    // exact match stays visible so guests can still tap it to confirm.
    const starts = guests.filter((g) => normalizeName(g.name).startsWith(n));
    const contains = guests.filter(
      (g) => !normalizeName(g.name).startsWith(n) && normalizeName(g.name).includes(n)
    );
    return [...starts, ...contains].slice(0, 5);
  }, [name, guests]);

  function selectGuest(guest: Guest) {
    setName(guest.name);
    if (guest.email) setEmail(guest.email);
  }

  function emailValid(): boolean {
    return /\S+@\S+\.\S+/.test(email);
  }

  function goToAttributes() {
    const guest = guests.find((g) => normalizeName(g.name) === normalizeName(name));
    setMatchedGuest(guest ?? null);
    setAttributesText(guest ? guest.attributes.join(", ") : "");
    setStep("attributes");
  }

  function startJob(payload: GeneratePayload) {
    const payloadBytes = payload.imageDataUrl.length;
    setPending((p) => p + 1);
    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const text = await res.text();
        let data: { ok?: boolean; error?: string; problems?: string[]; requestId?: string } = {};
        try {
          data = JSON.parse(text);
        } catch {
          /* non-JSON response (e.g. a Vercel error page) — handled below */
        }
        if (!res.ok || !data.ok) {
          const detail = data.error || text.slice(0, 200) || "no response body";
          const tag = data.requestId ? ` [server log id: ${data.requestId}]` : "";
          if (res.status === 413) {
            throw new Error(`Photo upload too large (HTTP 413 — Vercel caps requests at 4.5MB): ${detail}${tag}`);
          }
          if (res.status === 504) {
            throw new Error(`Server timed out mid-generation (HTTP 504 — check the function's maxDuration on your Vercel plan): ${detail}${tag}`);
          }
          throw new Error(`Server error (HTTP ${res.status}): ${detail}${tag}`);
        }
        if (data.problems?.length) {
          setErrors((e) => [...e, ...data.problems!.map((p: string) => `${payload.name}: ${p}`)]);
        }
      })
      .catch((err) => {
        setFailed((f) => [
          ...f,
          {
            id: Date.now() + Math.random(),
            name: payload.name,
            message: describeError(err, payloadBytes),
            payload,
          },
        ]);
      })
      .finally(() => setPending((p) => p - 1));
  }

  function retryJob(job: FailedJob) {
    setFailed((f) => f.filter((x) => x.id !== job.id));
    startJob(job.payload);
  }

  function submit() {
    if (!photo) return;
    // Fire and forget: the magic + thank-you screens show immediately and the
    // next guest can start while this generates in the background.
    startJob({
      name: name.trim(),
      email: email.trim(),
      attributes: attributesText.split(",").map((a) => a.trim()).filter(Boolean),
      imageDataUrl: photo,
    });
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
              List a few things you&apos;re known for — hobbies, obsessions, signature moves, pets (breed and color).
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
              placeholder="e.g. surfing, baking sourdough, karaoke nights, Australian Shepherd with a copper-brown and white coat"
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

      {(errors.length > 0 || failed.length > 0) && (
        <div className="error-toast">
          <div className="error-toast-header">
            <strong>⚠️ Needs attention</strong>
            <button
              className="toast-dismiss"
              onClick={() => {
                setErrors([]);
                setFailed([]);
              }}
            >
              ✕ Dismiss all
            </button>
          </div>
          {failed.map((job) => (
            <div key={job.id} className="error-row">
              <span>
                <strong>{job.name}:</strong> {job.message}
              </span>
              <button className="retry-btn" onClick={() => retryJob(job)}>
                🔁 Retry
              </button>
            </div>
          ))}
          {errors.slice(-3).map((e, i) => (
            <div key={i} className="error-row">
              <span>{e}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
