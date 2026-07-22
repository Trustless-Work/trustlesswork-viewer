import { ListChecks, Users } from "@phosphor-icons/react";
import type { OrganizedEscrowData } from "@/mappers/escrow-mapper";
import {
  ROLE_PERMISSIONS,
  getRoleDisplayName,
} from "@/lib/escrow-constants";
import { SectionCard } from "@/components/shared/section-card";
import { MilestoneCard } from "@/components/shared/milestone-card";
import { RoleCard } from "@/components/shared/role-card";
import { NoData } from "@/components/shared/no-data";

interface DesktopViewProps {
  organized: OrganizedEscrowData;
}

export const DesktopView = ({ organized }: DesktopViewProps) => {
  const assetSymbol = organized.trustline.assetCode;

  return (
    <div className="hidden flex-col gap-6 md:flex">
      <SectionCard title="Assigned Roles" icon={Users}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Object.entries(organized.roles).map(([key, value]) => (
            <RoleCard
              key={key}
              title={getRoleDisplayName(key)}
              address={String(value)}
              description={
                ROLE_PERMISSIONS[getRoleDisplayName(key)] ||
                "No description available"
              }
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Milestones" icon={ListChecks}>
        {organized.milestones.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {organized.milestones.map((milestone, index) => (
              <MilestoneCard
                key={index.toString()}
                title={milestone.title}
                description={milestone.description}
                status={milestone.status}
                approved={milestone.approved}
                index={index}
                amount={milestone.amount}
                assetSymbol={assetSymbol}
                release_flag={milestone.release_flag}
                dispute_flag={milestone.dispute_flag}
                resolved_flag={milestone.resolved_flag}
                signer={milestone.signer}
                approver={milestone.approver}
                receiver={milestone.receiver}
              />
            ))}
          </div>
        ) : (
          <NoData title="No milestones found" />
        )}
      </SectionCard>
    </div>
  );
};
