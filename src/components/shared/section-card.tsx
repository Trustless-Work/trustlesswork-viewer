import type { ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  icon: Icon;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export const SectionCard = ({
  title,
  icon: Icon,
  children,
  className,
  action,
}: SectionCardProps) => {
  return (
    <section
      className={cn(
        "rounded-3xl border border-border bg-card p-4 sm:p-6",
        className,
      )}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-foreground">
          <Icon className="size-4 shrink-0" weight="duotone" />
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
};
