import { StatusBadge } from "./status-badge";
import { DetailRow } from "./detail-row";
import { TruncatedText } from "./truncated-text";
import { Skeleton } from "@/components/ui/skeleton";
import { ADDRESS_CHARS } from "@/lib/format-address";
import { ROLE_PERMISSIONS } from "@/lib/escrow-constants";
import { MoneyStat } from "@/components/shared/UsdcAmount";

interface MilestoneProps {
  index: number;
  title?: string;
  description: string;
  status: string;
  approved: boolean;
  amount?: string;
  /** Escrow asset code — USDC amounts render with the USDC icon. */
  assetSymbol?: string | null;
  release_flag?: boolean;
  dispute_flag?: boolean;
  resolved_flag?: boolean;
  signer?: string;
  approver?: string;
  receiver?: string;
}

export const MilestoneCardSkeleton = () => (
  <article className="mb-4 min-h-0 rounded-3xl border border-border bg-card p-5 shadow-sm">
    <div className="mb-3 flex items-start justify-between gap-3">
      <Skeleton className="h-5 w-40" />
      <div className="flex flex-wrap justify-end gap-1.5">
        <Skeleton className="h-5 w-20 rounded-4xl" />
        <Skeleton className="h-5 w-20 rounded-4xl" />
      </div>
    </div>

    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-5 w-28" />
      </div>
    </div>
  </article>
);

export const MilestoneCard = ({
  index,
  title,
  description,
  status,
  approved,
  amount,
  assetSymbol,
  release_flag,
  dispute_flag,
  resolved_flag,
  signer,
  approver,
  receiver,
}: MilestoneProps) => {
  return (
    <article className="mb-4 min-h-0 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <TruncatedText
          as="h3"
          lines={2}
          className="min-w-0 flex-1 text-base font-semibold"
        >
          {title || `Milestone ${index + 1}`}
        </TruncatedText>
        <div className="flex max-w-[60%] shrink-0 flex-wrap items-center justify-end gap-1.5">
          {/* Status is always shown — independent of approval / flags */}
          <StatusBadge status={status || "Pending"} type="milestone" />
          {approved ? <StatusBadge status="approved" /> : null}
          {dispute_flag ? (
            <StatusBadge status="true" type="dispute" />
          ) : null}
          {release_flag ? (
            <StatusBadge status="true" type="release" />
          ) : null}
          {resolved_flag ? (
            <StatusBadge status="true" type="resolve" />
          ) : null}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <TruncatedText as="p" lines={4} className="text-sm">
          {description}
        </TruncatedText>

        {amount ? (
          <MoneyStat
            label="Amount"
            value={amount}
            symbol={assetSymbol}
            size="lg"
            emphasis={false}
          />
        ) : null}

        {(receiver || signer || approver) && (
          <div className="flex flex-col gap-1">
            {receiver && (
              <DetailRow
                label="Receiver"
                value={receiver}
                tooltip={ROLE_PERMISSIONS.Receiver}
                canCopy
                isAddress
                addressChars={ADDRESS_CHARS.md}
              />
            )}
            {signer && (
              <DetailRow
                label="Signer"
                value={signer}
                canCopy
                isAddress
                addressChars={ADDRESS_CHARS.md}
              />
            )}
            {approver && (
              <DetailRow
                label="Approver"
                value={approver}
                canCopy
                isAddress
                addressChars={ADDRESS_CHARS.md}
              />
            )}
          </div>
        )}
      </div>
    </article>
  );
};
