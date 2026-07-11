"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  photo: string | null;
  onCapture: (dataUrl: string) => void;
  onRetake: () => void;
}

export default function CameraCapture({ photo, onCapture, onRetake }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setReady(true);
      })
      .catch((err) => {
        setCamError(
          err instanceof DOMException && err.name === "NotAllowedError"
            ? "Camera access was denied. Please allow camera access in your browser and reload."
            : `Could not start the camera: ${err instanceof Error ? err.message : String(err)}`
        );
      });
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function capture() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const size = Math.min(video.videoWidth, video.videoHeight);
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d")!;
    // Mirror the capture so it matches what the guest saw in the preview.
    ctx.translate(1024, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(
      video,
      (video.videoWidth - size) / 2,
      (video.videoHeight - size) / 2,
      size,
      size,
      0,
      0,
      1024,
      1024
    );
    onCapture(canvas.toDataURL("image/png"));
  }

  return (
    <>
      <div className="camera-frame">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="mirrored"
          style={{ display: photo ? "none" : "block" }}
        />
        {photo && <img src={photo} alt="Your photo" />}
        {ready && !photo && (
          <div className="face-guide">
            <div className="face-guide-oval" />
            <span className="face-guide-hint">Fill the oval with your face! 🫧</span>
          </div>
        )}
        {!ready && !photo && (
          <div className="camera-placeholder">
            <span style={{ fontSize: "2.5rem" }}>📸</span>
            <span>{camError ?? "Starting camera…"}</span>
          </div>
        )}
      </div>
      <div className="button-row">
        {photo ? (
          <button className="btn btn-secondary" onClick={onRetake}>
            🔄 Retake
          </button>
        ) : (
          <button className="btn btn-primary btn-big" onClick={capture} disabled={!ready}>
            📸 Snap!
          </button>
        )}
      </div>
    </>
  );
}
