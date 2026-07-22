import { CheckCircle, Circle } from "@phosphor-icons/react";

interface ProgressBarProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  showSteps?: boolean;
  steps?: number;
}

export const ProgressBar = ({
  value,
  label = "Progress",
  showPercentage = true,
  showSteps = false,
  steps = 4,
}: ProgressBarProps) => {
  const percentage = Math.round(value);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">{label}</span>
        {showPercentage && (
          <span className="font-semibold text-primary">{percentage}%</span>
        )}
      </div>

      <div className="relative">
        <div className="h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700 ease-in-out"
            style={{ width: `${value}%` }}
          />
        </div>

        {showSteps && (
          <div className="absolute inset-x-0 -top-0 flex justify-between px-1">
            {Array.from({ length: steps }).map((_, index) => {
              const stepPercentage = (index / (steps - 1)) * 100;
              const isCompleted = value >= stepPercentage;

              return (
                <div key={index} className="-mt-3 flex flex-col items-center">
                  {isCompleted ? (
                    <CheckCircle
                      className="size-4 rounded-full bg-background text-foreground"
                      weight="duotone"
                    />
                  ) : (
                    <Circle
                      className="size-4 rounded-full bg-background text-foreground"
                      weight="duotone"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
