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
  Broadcast,
  CaretRight,
  SpinnerGap,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  type EscrowEvent,
  formatTransactionTime,
} from "@/utils/eventFetcher";
import {
  getStellarExpertTxUrl,
  type NetworkType,
} from "@/lib/network-config";
import { FIELD_TOOLTIPS } from "@/lib/escrow-constants";

interface EventsTableProps {
  events: EscrowEvent[];
  loading: boolean;
  error?: string | null;
  retentionNotice?: string;
  hasMore: boolean;
  network: NetworkType;
  onLoadMore: () => void;
}

const EventsTableSkeleton = () => (
  <>
    <div className="flex flex-col gap-3 md:hidden">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
            <Skeleton className="h-5 w-28 rounded-4xl" />
            <Skeleton className="size-8 rounded-4xl" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 w-20" />
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
              {["Event", "Ledger", "Time", "Actions"].map((h) => (
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
                  <Skeleton className="h-5 w-24 rounded-4xl" />
                </td>
                <td className="p-2">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="p-2">
                  <Skeleton className="h-4 w-24" />
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

export const EventsTable: React.FC<EventsTableProps> = ({
  events,
  loading,
  error,
  retentionNotice,
  hasMore,
  network,
  onLoadMore,
}) => {
  if (loading && events.length === 0) {
    return (
      <div className="flex w-full flex-col gap-4">
        <div className="flex items-center gap-2">
          <Broadcast className="size-4 text-foreground" weight="duotone" />
          <h3 className="text-lg font-semibold tracking-tight">Events</h3>
        </div>
        <EventsTableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-full flex-col gap-4">
        <div className="flex items-center gap-2">
          <Broadcast className="size-4 text-foreground" weight="duotone" />
          <h3 className="text-lg font-semibold tracking-tight">Events</h3>
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
        <Broadcast className="size-4 text-foreground" weight="duotone" />
        <h3 className="text-lg font-semibold tracking-tight">Events</h3>
        <InfoTooltip
          content={
            FIELD_TOOLTIPS.contract_events ??
            "On-chain contract events from Soroban RPC (getEvents)."
          }
        />
      </div>

      {retentionNotice && events.length === 0 && (
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex items-start gap-3">
            <WarningCircle
              className="mt-0.5 size-4 shrink-0 text-foreground"
              weight="duotone"
            />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold">RPC retention</p>
              <p className="text-sm text-muted-foreground">{retentionNotice}</p>
            </div>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <NoData
          icon={Broadcast}
          title="No Events Found"
          description="No contract events in the RPC window. History is typically available for the last 24 hours to 7 days."
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
                  <div className="flex flex-col gap-1">
                    <Badge variant="secondary" className="w-fit">
                      {event.label}
                    </Badge>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {event.name}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link
                      href={getStellarExpertTxUrl(network, event.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open transaction on Stellar Expert"
                    >
                      <ArrowSquareOut
                        weight="duotone"
                        className="text-foreground"
                      />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Ledger</span>
                    <span className="text-sm font-medium">
                      {event.ledger.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Time</span>
                    <span className="text-sm font-medium">
                      {event.createdAt
                        ? formatTransactionTime(event.createdAt)
                        : "—"}
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
                    <th className="h-10 px-2 text-left font-medium">Event</th>
                    <th className="h-10 px-2 text-left font-medium">Ledger</th>
                    <th className="h-10 px-2 text-left font-medium">Time</th>
                    <th className="h-10 px-2 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b">
                      <td className="p-2 align-middle">
                        <div className="flex flex-col gap-1">
                          <Badge variant="secondary" className="w-fit">
                            {event.label}
                          </Badge>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {event.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-2 align-middle">
                        {event.ledger.toLocaleString()}
                      </td>
                      <td className="p-2 align-middle text-muted-foreground">
                        {event.createdAt
                          ? formatTransactionTime(event.createdAt)
                          : "—"}
                      </td>
                      <td className="p-2 align-middle">
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link
                            href={getStellarExpertTxUrl(network, event.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Open transaction on Stellar Expert"
                          >
                            <ArrowSquareOut
                              weight="duotone"
                              className="text-foreground"
                            />
                          </Link>
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
                    <SpinnerGap
                      className="animate-spin text-foreground"
                      weight="duotone"
                    />
                    Loading...
                  </>
                ) : (
                  <>
                    <CaretRight weight="duotone" className="text-foreground" />
                    Load More Events
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
