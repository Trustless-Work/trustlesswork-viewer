import { DetailRow } from "./detail-row";
import { InfoTooltip } from "./info-tooltip";
import { TruncatedText } from "./truncated-text";
import RoleIcon from "./role-icon";
import { Skeleton } from "@/components/ui/skeleton";

export type RoleTitle =
  | "Approver"
  | "Milestone Approver"
  | "Service Provider"
  | "Release Signer"
  | "Dispute Resolver"
  | "Platform Address"
  | "Receiver"
  | "Issuer"
  | "Depositor"
  | "Observer"
  | (string & {});

interface RoleCardProps {
  title: string;
  address: string;
  description: string;
}

export const RoleCardSkeleton = () => (
  <article className="mb-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
    <div className="mb-3 flex items-center gap-3">
      <Skeleton className="size-4 rounded-sm" />
      <Skeleton className="h-5 w-32" />
    </div>
    <div className="flex flex-col gap-1 border-b border-border py-2 last:border-0 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex w-full items-center gap-1.5 sm:w-2/5">
        <Skeleton className="h-3 w-14" />
      </div>
      <div className="flex w-full items-center gap-1 sm:w-3/5">
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="size-8 shrink-0 rounded-4xl" />
      </div>
    </div>
  </article>
);

export const RoleCard = ({ title, address, description }: RoleCardProps) => {
  return (
    <article className="mb-4 min-w-0 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex min-w-0 items-center gap-3">
        <RoleIcon title={title} />
        <h3 className="flex min-w-0 flex-1 items-center gap-1.5 text-base font-semibold">
          <TruncatedText as="span" className="font-semibold">
            {title}
          </TruncatedText>
          <InfoTooltip content={description} />
        </h3>
      </div>

      <DetailRow
        label="Address"
        value={address}
        canCopy
        isAddress
        addressChars={6}
      />
    </article>
  );
};
