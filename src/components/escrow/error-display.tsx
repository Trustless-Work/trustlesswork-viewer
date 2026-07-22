import { WarningCircle } from "@phosphor-icons/react";

interface ErrorDisplayProps {
  error: string | null;
}

export const ErrorDisplay = ({ error }: ErrorDisplayProps) => {
  if (!error) return null;

  return (
    <div className="mx-auto mb-6 flex max-w-2xl items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
      <WarningCircle className="size-4 shrink-0" weight="duotone" />
      <p>{error}</p>
    </div>
  );
};
