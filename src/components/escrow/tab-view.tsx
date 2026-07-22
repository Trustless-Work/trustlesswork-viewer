import { ListChecks, Users } from "@phosphor-icons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OrganizedEscrowData } from "@/mappers/escrow-mapper";
import {
  ROLE_PERMISSIONS,
  getRoleDisplayName,
} from "@/lib/escrow-constants";
import { ADDRESS_CHARS } from "@/lib/format-address";
import { SectionCard } from "@/components/shared/section-card";
import { DetailRow } from "@/components/shared/detail-row";
import { MilestoneCard } from "@/components/shared/milestone-card";
import { NoData } from "@/components/shared/no-data";

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
              {Object.entries(organized.roles).map(([key, value]) => (
                <div
                  key={key}
                  className="border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <DetailRow
                    label={getRoleDisplayName(key)}
                    value={value}
                    tooltip={
                      ROLE_PERMISSIONS[getRoleDisplayName(key)] ||
                      "No description available"
                    }
                    canCopy
                    isAddress
                    addressChars={ADDRESS_CHARS.sm}
                  />
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
