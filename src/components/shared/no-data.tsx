import type { Icon } from "@phosphor-icons/react";
import { Tray } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NoDataProps {
  title: string;
  description?: string;
  icon?: Icon;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

function NoData({
  title,
  description,
  icon: Icon = Tray,
  actionLabel,
  onAction,
  className,
}: NoDataProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border p-8 text-center",
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-xl bg-muted text-foreground">
        <Icon className="size-6" weight="duotone" />
      </div>
      <div className="flex max-w-sm flex-col gap-1.5">
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actionLabel && onAction ? (
        <Button type="button" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export { NoData };
export type { NoDataProps };
