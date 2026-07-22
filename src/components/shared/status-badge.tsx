import { Badge } from "@/components/ui/badge";
import { LiveStatusDot } from "@/components/shared/live-status-dot";
import { TruncatedText } from "@/components/shared/truncated-text";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";

interface StatusBadgeProps {
  status: "true" | "false" | "pending" | "approved" | "completed" | string;
  type?: "dispute" | "release" | "resolve" | "milestone";
}

/**
 * Flag badges (dispute / release / resolve) should only be rendered when the
 * flag is true — callers gate on that. Milestone status is always shown and
 * is independent of approval / flags.
 *
 * Variants: approved / released / resolved → success; dispute → destructive;
 * everything else → outline.
 */
export const StatusBadge = ({
  status,
  type = "milestone",
}: StatusBadgeProps) => {
  const lowerStatus = status.toString().toLowerCase().trim();

  if (type === "dispute") {
    return (
      <Badge variant="destructive">
        <WarningCircle weight="duotone" /> Disputed
      </Badge>
    );
  }

  if (type === "release") {
    return (
      <Badge variant="success">
        <CheckCircle weight="duotone" /> Released
      </Badge>
    );
  }

  if (type === "resolve") {
    return (
      <Badge variant="success">
        <CheckCircle weight="duotone" /> Resolved
      </Badge>
    );
  }

  if (lowerStatus === "approved") {
    return (
      <Badge variant="success">
        <CheckCircle weight="duotone" /> Approved
      </Badge>
    );
  }

  if (lowerStatus === "completed") {
    return (
      <Badge variant="outline">
        <CheckCircle weight="duotone" /> Completed
      </Badge>
    );
  }

  if (lowerStatus === "pending" || lowerStatus === "") {
    return (
      <Badge variant="outline">
        <WarningCircle weight="duotone" /> Pending
      </Badge>
    );
  }

  if (lowerStatus === "true") {
    return (
      <Badge variant="outline">
        <LiveStatusDot /> Active
      </Badge>
    );
  }

  // Free-form Service Provider status — preserve original casing, clamp length
  return (
    <Badge variant="outline" className="max-w-[12rem] min-w-0 normal-case">
      <TruncatedText as="span" className="max-w-[11rem] text-xs font-medium">
        {status}
      </TruncatedText>
    </Badge>
  );
};
