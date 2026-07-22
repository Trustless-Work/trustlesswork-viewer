import { cn } from "@/lib/utils";

function LiveStatusDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-2 shrink-0 rounded-full bg-primary",
        className,
      )}
    />
  );
}

export { LiveStatusDot };
