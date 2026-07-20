import { type ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 pb-6 pt-6 sm:px-6 sm:pt-10 lg:px-10">
      <div>
        <h1 className="text-[24px] font-semibold tracking-tight text-text sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 text-[13.5px] text-text-secondary">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
