"use client";

import { useState } from "react";
import {
  CheckCircle,
  CheckCircleIcon,
  Copy,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { TruncatedText } from "@/components/shared/truncated-text";
import {
  MoneyStat,
  OverviewStat,
} from "@/components/shared/UsdcAmount";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AssetOverview,
  AssetOverviewSkeleton,
} from "@/components/escrow/trustline-section";
import type { NetworkType } from "@/lib/network-config";
import type { OrganizedEscrowData } from "@/mappers/escrow-mapper";

interface TitleCardProps {
  organized: OrganizedEscrowData;
  network: NetworkType;
  trustlineLoading?: boolean;
  /** Shorter addresses on mobile. */
  addressSize?: "sm" | "lg";
}

export const TitleCardSkeleton = () => (
  <section className="mb-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-col gap-2">
        <Skeleton className="h-7 w-56 sm:h-8 sm:w-72" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-4 w-3/4 max-w-sm" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-5 w-28 rounded-4xl" />
        <Skeleton className="h-5 w-24 rounded-4xl" />
      </div>
    </div>

    <dl className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
      ))}
    </dl>

    <div className="my-6 border-t border-border" />

    <AssetOverviewSkeleton />

    <div className="mt-6 flex flex-col gap-1.5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>

    <div className="mt-6 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-10" />
      </div>
      <Skeleton className="h-1 w-full rounded-full" />
    </div>
  </section>
);

function ContractIdField({ contractId }: { contractId: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    void navigator.clipboard.writeText(contractId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm text-muted-foreground">Contract ID</span>
      <div className="flex min-w-0 items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
        <TruncatedText
          as="code"
          className="flex-1 font-mono text-xs tracking-tight sm:text-sm"
        >
          {contractId}
        </TruncatedText>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={copy}
          aria-label="Copy contract ID"
        >
          {copied ? (
            <CheckCircle
              className="size-3.5 text-foreground"
              weight="duotone"
            />
          ) : (
            <Copy className="size-3.5 text-foreground" weight="duotone" />
          )}
          <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
    </div>
  );
}

export const TitleCard = ({
  organized,
  network,
  trustlineLoading = false,
  addressSize = "lg",
}: TitleCardProps) => {
  const {
    title,
    description,
    progress,
    escrowType,
    properties,
    flags,
    trustline,
  } = organized;

  const symbol = trustline.assetCode;
  const amount = properties.amount ?? "0.00";
  const balance = properties.balance ?? "0.00";
  const platformFee = properties.platform_fee ?? "N/A";
  const engagementId = properties.engagement_id ?? "N/A";
  const contractId = properties.escrow_id ?? "";

  return (
    <section className="mb-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
      {/* Header: title + badges */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <TruncatedText
            as="h2"
            lines={2}
            className="text-xl font-semibold tracking-tight sm:text-2xl"
          >
            {title}
          </TruncatedText>
          {description ? (
            <TruncatedText
              as="p"
              lines={3}
              className="max-w-2xl text-sm text-muted-foreground"
            >
              {description}
            </TruncatedText>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {escrowType && (
            <Badge variant="outline">
              {escrowType === "multi-release"
                ? "Multi-Release"
                : "Single-Release"}
            </Badge>
          )}
          <Badge variant="success">
            {progress === 100 ? (
              <>
                <CheckCircleIcon className="size-4" />
                Completed
              </>
            ) : (
              "In Progress"
            )}
          </Badge>
          {flags.dispute_flag === "True" && (
            <StatusBadge status={flags.dispute_flag} type="dispute" />
          )}
          {flags.release_flag === "True" && (
            <StatusBadge status={flags.release_flag} type="release" />
          )}
          {flags.resolved_flag === "True" && (
            <StatusBadge status={flags.resolved_flag} type="resolve" />
          )}
        </div>
      </div>

      {/* Primary escrow stats */}
      <dl className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4 [&>*]:min-w-0">
        <MoneyStat label="Amount" value={amount} symbol={symbol} />
        <MoneyStat label="Balance" value={balance} symbol={symbol} />
        <OverviewStat label="Platform Fee" value={platformFee} />
        <OverviewStat label="Engagement ID" value={engagementId} mono />
      </dl>

      <div className="my-6 border-t border-border" />

      {/* Asset trustline — same OverviewStat rhythm, folded into this card */}
      <AssetOverview
        trustline={trustline}
        network={network}
        addressSize={addressSize}
        loading={trustlineLoading}
      />

      {contractId ? (
        <div className="mt-6">
          <ContractIdField contractId={contractId} />
        </div>
      ) : null}

      <div className="mt-6">
        <ProgressBar value={progress} label="Milestone Progress" />
      </div>
    </section>
  );
};
