"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The mascot/customization experience has been replaced by the Fenom Progress
// Bubble on the Home screen. This route now just redirects there so any old
// link or bookmark lands somewhere sensible.
export default function MascotRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/dashboard"); }, [router]);
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
    </div>
  );
}
