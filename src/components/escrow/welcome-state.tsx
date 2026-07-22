import { MagnifyingGlass } from "@phosphor-icons/react";

import { NoData } from "@/components/shared/no-data";

interface WelcomeStateProps {
  showWelcome: boolean;
  handleUseExample?: () => void;
}

export const WelcomeState = ({
  showWelcome,
  handleUseExample,
}: WelcomeStateProps) => {
  if (!showWelcome) return null;

  return (
    <NoData
      icon={MagnifyingGlass}
      title="Welcome to Escrow Viewer"
      description="Enter an escrow contract ID above to view its details, milestones, and assigned roles."
      actionLabel={handleUseExample ? "Use example contract" : undefined}
      onAction={handleUseExample}
      className="mx-auto max-w-md"
    />
  );
};
