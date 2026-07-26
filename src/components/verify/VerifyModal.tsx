"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Camera, Check, X, Loader2, RefreshCw, ImageUp, ShieldCheck } from "lucide-react";
import type { Habit } from "@/lib/momentum/types";
import { DIFFICULTY_XP } from "@/lib/momentum/stats";
import { runVerification, recordVerification } from "@/lib/verify";
import { HabitIcon, colorValue } from "@/lib/icons";

type Phase = "camera" | "analyzing" | "approved" | "rejected" | "error";

export function VerifyModal({
  open,
  habit,
  date,
  onClose,
  onApproved,
}: {
  open: boolean;
  habit: Habit | null;
  date: string;
  onClose: () => void;
  onApproved: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [phase, setPhase] = useState<Phase>("camera");
  const [reason, setReason] = useState("");
  const [camReady, setCamReady] = useState(false);

  const color = habit ? colorValue(habit.color) : "var(--accent)";

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setCamReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCamReady(true);
    } catch {
      // Camera blocked/unavailable → fall back to the file picker.
      setCamReady(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    // Reset UI and (re)start the camera each time the sheet opens.
    /* eslint-disable react-hooks/set-state-in-effect */
    setPhase("camera");
    setReason("");
    /* eslint-enable react-hooks/set-state-in-effect */
    void startCamera();
    return () => stopCamera();
  }, [open, startCamera, stopCamera]);

  const verifyBlob = useCallback(
    async (blob: Blob) => {
      if (!habit) return;
      stopCamera();
      setPhase("analyzing");
      try {
        const result = await runVerification(habit.id, habit.name, blob);
        const xp = result.approved ? DIFFICULTY_XP[habit.difficulty] : 0;
        void recordVerification({
          habitId: habit.id,
          habitName: habit.name,
          date,
          approved: result.approved,
          explanation: result.reason,
          xpEarned: xp,
          imagePath: result.imagePath,
        });
        setReason(result.reason);
        if (result.approved) {
          setPhase("approved");
          onApproved();
          window.setTimeout(onClose, 1400);
        } else {
          setPhase("rejected");
        }
      } catch (e) {
        setReason((e as Error).message || "Something went wrong.");
        setPhase("error");
      }
    },
    [habit, date, onApproved, onClose, stopCamera],
  );

  const snap = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => blob && verifyBlob(blob), "image/jpeg", 0.9);
  }, [verifyBlob]);

  const retry = useCallback(() => {
    setPhase("camera");
    setReason("");
    void startCamera();
  }, [startCamera]);

  if (!open || !habit) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[140] flex items-end justify-center sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="relative w-full max-w-md overflow-hidden rounded-t-3xl border border-border bg-surface shadow-[var(--shadow-lg)] sm:rounded-3xl"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: `color-mix(in oklab, ${color} 16%, transparent)`, color }}>
              <HabitIcon name={habit.icon} size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-text">{habit.name}</p>
              <p className="flex items-center gap-1 text-[11.5px] text-text-muted">
                <ShieldCheck size={12} /> AI photo verification
              </p>
            </div>
            <button onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-2 hover:text-text">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="relative aspect-[3/4] w-full bg-black">
            {/* Live camera */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={phase === "camera" && camReady ? "h-full w-full object-cover" : "hidden"}
            />

            {phase === "camera" && !camReady && (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center text-white/80">
                <Camera size={34} />
                <p className="text-[14px]">Point your camera at the proof and take a photo.</p>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2 text-[13px] font-medium text-white"
                >
                  <ImageUp size={15} /> Open camera
                </button>
              </div>
            )}

            {phase === "analyzing" && (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-white">
                <Loader2 size={34} className="animate-spin" />
                <p className="text-[14px] font-medium">Analyzing your photo…</p>
              </div>
            )}

            <AnimatePresence>
              {phase === "approved" && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 text-center"
                >
                  <motion.span
                    initial={{ scale: 0.5 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 240, damping: 12 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full accent-gradient text-accent-ink"
                  >
                    <Check size={40} strokeWidth={3} />
                  </motion.span>
                  <p className="text-[16px] font-semibold text-white">Verified!</p>
                  {reason && <p className="max-w-[80%] text-[13px] text-white/70">{reason}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            {(phase === "rejected" || phase === "error") && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 p-6 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-soft text-danger">
                  <X size={32} strokeWidth={3} />
                </span>
                <p className="text-[15px] font-semibold text-white">
                  {phase === "error" ? "Couldn't verify" : "Not quite"}
                </p>
                <p className="max-w-[85%] text-[13px] text-white/75">{reason}</p>
              </div>
            )}
          </div>

          {/* Footer / actions */}
          <div className="p-4">
            {phase === "camera" && camReady && (
              <button
                onClick={snap}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl accent-gradient text-[15px] font-semibold text-accent-ink"
              >
                <Camera size={18} /> Take photo
              </button>
            )}
            {(phase === "rejected" || phase === "error") && (
              <div className="flex gap-2.5">
                <button onClick={onClose} className="h-11 flex-1 rounded-xl border border-border text-[14px] font-medium text-text-secondary">
                  Cancel
                </button>
                <button onClick={retry} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl accent-gradient text-[14px] font-semibold text-accent-ink">
                  <RefreshCw size={15} /> Try again
                </button>
              </div>
            )}
            {phase === "analyzing" && (
              <p className="text-center text-[12.5px] text-text-muted">Momentum is checking your photo with AI…</p>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void verifyBlob(f);
              e.target.value = "";
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
