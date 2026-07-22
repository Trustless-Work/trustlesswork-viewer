"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NoData } from "@/components/shared/no-data";
import { InfoTooltip } from "@/components/shared/info-tooltip";
import {
  ArrowSquareOut,
  CaretRight,
  Clock,
  SpinnerGap,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  type TransactionMetadata,
  formatTransactionTime,
  truncateHash,
} from "@/utils/transactionFetcher";

interface TransactionTableProps {
  transactions: TransactionMetadata[];
  loading: boolean;
  error?: string | null;
  retentionNotice?: string;
  hasMore: boolean;
  onLoadMore: () => void;
  onTransactionClick: (txHash: string) => void;
  isMobile: boolean;
}

const TransactionTableSkeleton = () => (
  <>
    <div className="flex flex-col gap-3 md:hidden">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-16 rounded-4xl" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="hidden md:block">
      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="border-b">
              {["Hash", "Ledger", "Time", "Status", "Actions"].map((h) => (
                <th key={h} className="h-10 px-2 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">
                  <Skeleton className="h-4 w-28" />
                </td>
                <td className="p-2">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="p-2">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="p-2">
                  <Skeleton className="h-5 w-16 rounded-4xl" />
                </td>
                <td className="p-2">
                  <Skeleton className="size-8 rounded-4xl" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </>
);

function statusVariant(
  status: string,
): "secondary" | "destructive" | "outline" {
  if (status === "SUCCESS") return "secondary";
  if (status === "FAILED") return "destructive";
  return "outline";
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  loading,
  error,
  retentionNotice,
  hasMore,
  onLoadMore,
  onTransactionClick,
}) => {
  if (loading && transactions.length === 0) {
    return (
      <div className="flex w-full flex-col gap-4">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-foreground" weight="duotone" />
          <h3 className="text-lg font-semibold tracking-tight">
            Recent Transactions
          </h3>
        </div>
        <TransactionTableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-full flex-col gap-4">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-foreground" weight="duotone" />
          <h3 className="text-lg font-semibold tracking-tight">
            Recent Transactions
          </h3>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <WarningCircle className="size-4 shrink-0" weight="duotone" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-foreground" weight="duotone" />
        <h3 className="text-lg font-semibold tracking-tight">
          Recent Transactions
        </h3>
        <InfoTooltip content="Recent transaction history fetched from Soroban RPC. Click on any transaction to view detailed information including signers, function calls, and results." />
      </div>

      {retentionNotice && (
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex items-start gap-3">
            <WarningCircle className="mt-0.5 size-4 shrink-0 text-foreground" weight="duotone" />
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">Data Retention Notice</p>
              <p className="text-sm text-muted-foreground">{retentionNotice}</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="xs" asChild>
                  <Link
                    href="https://hubble.stellar.org"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ArrowSquareOut className="size-3 text-foreground" weight="duotone" />
                    Stellar Hubble
                  </Link>
                </Button>
                <Button variant="outline" size="xs" asChild>
                  <Link
                    href="https://console.cloud.google.com/bigquery"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ArrowSquareOut className="size-3 text-foreground" weight="duotone" />
                    BigQuery
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {transactions.length === 0 ? (
        <NoData
          icon={Clock}
          title="No Transactions Found"
          description="This could be due to RPC retention limits, no recent activity, or the contract has not been used yet. History is typically available for the last 24 hours to 7 days."
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {transactions.map((tx) => (
              <Card
                key={tx.txHash}
                className="cursor-pointer"
                onClick={() => onTransactionClick(tx.txHash)}
              >
                <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
                  <span className="font-mono text-sm text-primary">
                    {truncateHash(tx.txHash, true)}
                  </span>
                  <Badge variant={statusVariant(tx.status)}>{tx.status}</Badge>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Ledger
                    </span>
                    <span className="text-sm font-medium">
                      {tx.ledger.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Time</span>
                    <span className="text-sm font-medium">
                      {formatTransactionTime(tx.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="h-10 px-2 text-left font-medium">
                      Transaction Hash
                    </th>
                    <th className="h-10 px-2 text-left font-medium">Ledger</th>
                    <th className="h-10 px-2 text-left font-medium">Time</th>
                    <th className="h-10 px-2 text-left font-medium">Status</th>
                    <th className="h-10 px-2 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr
                      key={tx.txHash}
                      className="cursor-pointer border-b hover:bg-muted/50"
                      onClick={() => onTransactionClick(tx.txHash)}
                    >
                      <td className="p-2 align-middle font-mono text-sm text-primary">
                        {truncateHash(tx.txHash, false)}
                      </td>
                      <td className="p-2 align-middle">
                        {tx.ledger.toLocaleString()}
                      </td>
                      <td className="p-2 align-middle text-muted-foreground">
                        {formatTransactionTime(tx.createdAt)}
                      </td>
                      <td className="p-2 align-middle">
                        <Badge variant={statusVariant(tx.status)}>
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="p-2 align-middle">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              `https://stellar.expert/explorer/testnet/tx/${tx.txHash}`,
                              "_blank",
                              "noopener,noreferrer",
                            );
                          }}
                        >
                          <ArrowSquareOut weight="duotone" className="text-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                onClick={onLoadMore}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading ? (
                  <>
                    <SpinnerGap className="animate-spin text-foreground" weight="duotone" />
                    Loading...
                  </>
                ) : (
                  <>
                    <CaretRight weight="duotone" className="text-foreground" />
                    Load More Transactions
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
