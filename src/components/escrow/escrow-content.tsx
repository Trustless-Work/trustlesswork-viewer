import { ListChecks, Users } from "@phosphor-icons/react";
import type { OrganizedEscrowData } from "@/mappers/escrow-mapper";
import { TitleCard, TitleCardSkeleton } from "@/components/escrow/title-card";
import { TabView } from "@/components/escrow/tab-view";
import { DesktopView } from "@/components/escrow/desktop-view";
import { WelcomeState } from "@/components/escrow/welcome-state";
import { SectionCard } from "@/components/shared/section-card";
import { RoleCardSkeleton } from "@/components/shared/role-card";
import { MilestoneCardSkeleton } from "@/components/shared/milestone-card";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressHighlightProvider } from "@/contexts/AddressHighlightContext";
import { useNetwork } from "@/contexts/NetworkContext";

interface EscrowContentProps {
  loading: boolean;
  organized: OrganizedEscrowData | null;
  trustlineLoading?: boolean;
  isMobile: boolean;
  error: string | null;
}

const RolesSectionSkeleton = ({ count = 4 }: { count?: number }) => (
  <SectionCard title="Assigned Roles" icon={Users}>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <RoleCardSkeleton key={i} />
      ))}
    </div>
  </SectionCard>
);

const MilestonesSectionSkeleton = ({ count = 4 }: { count?: number }) => (
  <SectionCard title="Milestones" icon={ListChecks}>
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <MilestoneCardSkeleton key={i} />
      ))}
    </div>
  </SectionCard>
);

const MobileRolesSkeleton = () => (
  <SectionCard title="Assigned Roles" icon={Users}>
    <div className="flex flex-col gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="border-b border-border pb-4 last:border-0 last:pb-0"
        >
          <div className="flex flex-col gap-1 border-b-0 py-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex w-full items-center gap-1.5 sm:w-2/5">
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex w-full items-center gap-1 sm:w-3/5">
              <Skeleton className="h-8 w-full rounded-lg" />
              <Skeleton className="size-8 shrink-0 rounded-4xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </SectionCard>
);

/**
 * Per-element loading UI — TitleCard (incl. asset) + Roles + Milestones.
 * Search / Header stay outside this component.
 */
const EscrowContentSkeleton = () => (
  <div className="flex w-full max-w-5xl flex-col gap-6">
    <TitleCardSkeleton />

    {/* Mobile: tabs shell + default Roles tab (same split as TabView) */}
    <div className="mb-6 block md:hidden">
      <div className="w-full">
        <div className="mb-6 grid h-8 w-full grid-cols-2 rounded-lg bg-muted p-[3px]">
          <Skeleton className="h-full w-full rounded-md" />
          <Skeleton className="h-full w-full rounded-md" />
        </div>
        <MobileRolesSkeleton />
      </div>
    </div>

    {/* Desktop: same stack as DesktopView */}
    <div className="hidden flex-col gap-6 md:flex">
      <RolesSectionSkeleton />
      <MilestonesSectionSkeleton />
    </div>
  </div>
);

export const EscrowContent = ({
  loading,
  organized,
  trustlineLoading = false,
  isMobile,
  error,
}: EscrowContentProps) => {
  const { currentNetwork } = useNetwork();
  const showWelcome = !organized && !loading && !error;

  return (
    <div className="flex flex-col items-center">
      {loading && <EscrowContentSkeleton />}

      {organized && !loading && (
        <AddressHighlightProvider>
          <div className="w-full max-w-5xl">
            <TitleCard
              organized={organized}
              network={currentNetwork}
              trustlineLoading={trustlineLoading}
              addressSize={isMobile ? "sm" : "lg"}
            />

            {isMobile && <TabView organized={organized} />}

            {!isMobile && <DesktopView organized={organized} />}
          </div>
        </AddressHighlightProvider>
      )}

      <WelcomeState showWelcome={showWelcome} />
    </div>
  );
};
