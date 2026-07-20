import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && (
        <span className="inline-flex items-center rounded-full border border-border bg-white/[0.03] px-3 py-1 text-[12px] font-medium tracking-wide text-primary">
          {eyebrow}
        </span>
      )}
      <h2 className="max-w-2xl text-balance text-[32px] font-semibold leading-[1.15] tracking-tight text-text sm:text-[40px]">
        {title}
      </h2>
      {description && (
        <p className="max-w-xl text-balance text-[16px] leading-relaxed text-text-secondary">
          {description}
        </p>
      )}
    </div>
  );
}
