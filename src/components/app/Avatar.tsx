"use client";

import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function Avatar({ size = 32, className }: { size?: number; className?: string }) {
  const { user } = useAuth();
  const initial = (user?.name || "?").charAt(0).toUpperCase();

  if (user?.avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatar}
        alt={user.name}
        referrerPolicy="no-referrer"
        className={cn("shrink-0 rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-full font-semibold text-white", className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: user?.avatarColor
          ? `linear-gradient(135deg, ${user.avatarColor}, var(--accent-3))`
          : "var(--accent)",
      }}
    >
      {initial}
    </div>
  );
}
