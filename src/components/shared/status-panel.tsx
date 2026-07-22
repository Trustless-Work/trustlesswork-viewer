import { Flag } from "@phosphor-icons/react";
import { SectionCard } from "./section-card";
import { StatusBadge } from "./status-badge";

interface StatusPanelProps {
  flags: {
    dispute_flag: string;
    release_flag: string;
    resolved_flag: string;
  };
  tooltips: { [key: string]: string };
}

export const StatusPanel = ({ flags }: StatusPanelProps) => {
  const disputed = flags.dispute_flag === "True";
  const released = flags.release_flag === "True";
  const resolved = flags.resolved_flag === "True";
  const hasAny = disputed || released || resolved;

  return (
    <SectionCard title="Escrow Status" icon={Flag}>
      {hasAny ? (
        <div className="flex flex-wrap gap-2">
          {disputed ? <StatusBadge status="true" type="dispute" /> : null}
          {released ? <StatusBadge status="true" type="release" /> : null}
          {resolved ? <StatusBadge status="true" type="resolve" /> : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No active status flags</p>
      )}
    </SectionCard>
  );
};
