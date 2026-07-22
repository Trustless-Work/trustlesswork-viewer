"use client";

import Image from "next/image";
import { MagnifyingGlass, SpinnerGap } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LiveStatusDot } from "@/components/shared/live-status-dot";
import { EXAMPLE_CONTRACT_IDS } from "@/lib/escrow-constants";
import { ADDRESS_CHARS, formatAddress } from "@/lib/format-address";
import type { NetworkType } from "@/lib/network-config";
import { cn } from "@/lib/utils";

interface HomeSearchCardProps {
  contractId: string;
  setContractId: (id: string) => void;
  loading?: boolean;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  onSearch: () => void;
  onUseExample: () => void;
  currentNetwork: NetworkType;
}

export const HomeSearchCard = ({
  contractId,
  setContractId,
  loading = false,
  isSearchFocused,
  setIsSearchFocused,
  handleKeyDown,
  onSearch,
  onUseExample,
  currentNetwork,
}: HomeSearchCardProps) => {
  const exampleId = EXAMPLE_CONTRACT_IDS[currentNetwork];
  const networkLabel = currentNetwork === "mainnet" ? "Mainnet" : "Testnet";

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8",
        "ring-1 ring-foreground/5 transition-[box-shadow,ring-color]",
        isSearchFocused && "ring-primary/30 shadow-md",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-12 size-48 rounded-full bg-primary/5 blur-3xl"
      />

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <Image
              src="/logo.png"
              alt="Trustless Work"
              width={48}
              height={48}
              priority
              className="mr-2 size-20 object-contain"
            />
            <div className="flex flex-col gap-1.5">
              <h1 className="text-pretty text-2xl font-semibold tracking-tight md:text-3xl">
                Escrow Viewer
              </h1>
              <p className="max-w-md text-sm text-muted-foreground md:text-base">
                Paste a Soroban contract ID to inspect milestones, roles, and
                on-chain balances.
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className="w-fit gap-1.5 normal-case tracking-normal"
          >
            <LiveStatusDot />
            {networkLabel}
          </Badge>
        </div>

        <div className="flex flex-col gap-3">
          <label
            htmlFor="home-contract-id"
            className="text-xs font-medium text-muted-foreground"
          >
            Contract ID
          </label>

          <div
            className={cn(
              "flex items-center gap-1.5 rounded-2xl border-2 border-border bg-background p-1 transition-colors",
              isSearchFocused && "border-primary/40",
            )}
          >
            <div className="relative min-w-0 flex-1">
              <MagnifyingGlass
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                weight="duotone"
              />
              <Input
                id="home-contract-id"
                type="text"
                placeholder="CDD53L..."
                spellCheck={false}
                autoComplete="off"
                value={contractId}
                onChange={(e) => setContractId(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                disabled={loading}
                className="h-8 border-0 bg-transparent pl-8 font-mono text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
              />
            </div>

            <Button
              type="button"
              size="icon-sm"
              onClick={onSearch}
              disabled={loading}
              aria-label="Search escrow"
              className="shrink-0 rounded-full"
            >
              {loading ? (
                <SpinnerGap className="animate-spin" weight="duotone" />
              ) : (
                <MagnifyingGlass weight="duotone" />
              )}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Need an ID?</span>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={onUseExample}
              className="font-mono normal-case"
            >
              {formatAddress(exampleId, ADDRESS_CHARS.sm)}
            </Button>
            <span className="hidden sm:inline">— try the example contract</span>
          </div>
        </div>

        <footer className="flex justify-end border-t border-border pt-5">
          <blockquote className="flex flex-col gap-1 text-left">
            <p className="text-sm text-foreground">
              &ldquo;Integrate trust in hours, not months.&rdquo;
            </p>
            <cite className="font-mono text-xs not-italic text-muted-foreground">
              ~ Trustless Work
            </cite>
          </blockquote>
        </footer>
      </div>
    </section>
  );
};
