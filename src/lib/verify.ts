import { supabase } from "@/lib/supabase";
import type { Verification } from "@/lib/momentum/types";

export interface VerifyResult {
  approved: boolean;
  reason: string;
  imagePath: string | null;
}

// Downscale + JPEG-compress a captured image; returns a Blob and raw base64.
export async function compressImage(source: Blob, maxDim = 1024, quality = 0.72): Promise<{ blob: Blob; base64: string }> {
  const bitmap = await createImageBitmap(source);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  const base64 = dataUrl.split(",")[1] ?? "";
  const blob = await (await fetch(dataUrl)).blob();
  return { blob, base64 };
}

// Full flow: upload the photo (best-effort) and ask the AI to verify it.
export async function runVerification(habitId: string, habitName: string, source: Blob): Promise<VerifyResult> {
  const { blob, base64 } = await compressImage(source);

  // Best-effort photo upload for history — never blocks verification.
  let imagePath: string | null = null;
  try {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (uid) {
      const path = `${uid}/${habitId}/${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("verifications").upload(path, blob, {
        contentType: "image/jpeg",
        upsert: false,
      });
      if (!error) imagePath = path;
    }
  } catch {
    /* history photo is optional */
  }

  const { data, error } = await supabase.functions.invoke("verify-habit", {
    body: { habitName, imageBase64: base64, mediaType: "image/jpeg" },
  });
  if (error) throw new Error(error.message || "Verification failed");
  if (data?.error) throw new Error(data.error);

  return { approved: Boolean(data?.approved), reason: String(data?.reason || ""), imagePath };
}

export async function recordVerification(v: {
  habitId: string;
  habitName: string;
  date: string;
  approved: boolean;
  explanation: string;
  xpEarned: number;
  imagePath: string | null;
}): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return;
  await supabase.from("verifications").insert({
    user_id: uid,
    habit_id: v.habitId,
    habit_name: v.habitName,
    date: v.date,
    approved: v.approved,
    explanation: v.explanation,
    xp_earned: v.xpEarned,
    image_path: v.imagePath,
  });
}

interface VerificationRow {
  id: string;
  habit_id: string | null;
  habit_name: string;
  date: string;
  approved: boolean;
  explanation: string;
  xp_earned: number;
  image_path: string | null;
  created_at: string;
}

export async function listVerifications(limit = 50): Promise<Verification[]> {
  const { data, error } = await supabase
    .from("verifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return (data as VerificationRow[]).map((r) => ({
    id: r.id,
    habitId: r.habit_id ?? "",
    habitName: r.habit_name,
    date: r.date,
    approved: r.approved,
    explanation: r.explanation,
    xpEarned: r.xp_earned,
    imagePath: r.image_path,
    createdAt: r.created_at,
  }));
}

export async function signedPhotoUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabase.storage.from("verifications").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
