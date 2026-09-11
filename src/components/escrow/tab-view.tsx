import { ListChecks, Users } from "@phosphor-icons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OrganizedEscrowData } from "@/mappers/escrow-mapper";
import { ROLE_PERMISSIONS } from "@/lib/escrow-constants";
import { ADDRESS_CHARS } from "@/lib/format-address";
import { SectionCard } from "@/components/shared/section-card";
import { DetailRow } from "@/components/shared/detail-row";
import { MilestoneCard } from "@/components/shared/milestone-card";
import { NoData } from "@/components/shared/no-data";
import { InfoTooltip } from "@/components/shared/info-tooltip";

interface TabViewProps {
  organized: OrganizedEscrowData;
}

export const TabView = ({ organized }: TabViewProps) => {
  const assetSymbol = organized.trustline.assetCode;

  return (
    <div className="mb-6 block md:hidden">
      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="roles" className="gap-1">
            <Users className="size-3 text-foreground" weight="duotone" />
            <span>Roles</span>
          </TabsTrigger>
          <TabsTrigger value="milestones" className="gap-1">
            <ListChecks className="size-3 text-foreground" weight="duotone" />
            <span>Tasks</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <SectionCard title="Assigned Roles" icon={Users}>
            <div className="flex flex-col gap-4">
              {organized.roles.map((role) => (
                <div
                  key={role.key}
                  className="border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="mb-2 flex items-center gap-1.5">
                    <span className="text-sm font-medium">{role.label}</span>
                    <InfoTooltip
                      content={
                        ROLE_PERMISSIONS[role.label] ||
                        "No description available"
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    {role.addresses.map((address, index) => (
                      <DetailRow
                        key={`${role.key}-${address}-${index}`}
                        label={
                          role.addresses.length > 1
                            ? `Address ${index + 1}`
                            : "Address"
                        }
                        value={address}
                        tooltip={
                          ROLE_PERMISSIONS[role.label] ||
                          "No description available"
                        }
                        canCopy
                        isAddress
                        addressChars={ADDRESS_CHARS.sm}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="milestones">
          <SectionCard title="Milestones" icon={ListChecks}>
            {organized.milestones.length > 0 ? (
              <div className="flex flex-col gap-4">
                {organized.milestones.map((milestone, index) => (
                  <MilestoneCard
                    key={index}
                    index={index}
                    title={milestone.title}
                    description={milestone.description}
                    status={milestone.status}
                    approved={milestone.approved}
                    amount={milestone.amount}
                    assetSymbol={assetSymbol}
                    release_flag={milestone.release_flag}
                    dispute_flag={milestone.dispute_flag}
                    resolved_flag={milestone.resolved_flag}
                    signer={milestone.signer}
                    approver={milestone.approver}
                    receiver={milestone.receiver}
                    evidence={milestone.evidence}
                    approvals={milestone.approvals}
                  />
                ))}
              </div>
            ) : (
              <NoData title="No milestones found" />
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};
