"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { toast } from "sonner";
import { NavbarSimple } from "@/components/Navbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { EXAMPLE_CONTRACT_IDS } from "@/lib/escrow-constants";
import { useRouter } from "next/navigation";
import { useNetwork } from "@/contexts/NetworkContext";
import { getErrorMessage } from "@/lib/utils";
import type { NetworkType } from "@/lib/network-config";
import {
  escrowPath,
  networkLabel,
  resolveEscrow,
  toastTitleForReason,
} from "@/lib/resolve-escrow";

import { Header } from "@/components/escrow/header";
import { SearchCard } from "@/components/escrow/search-card";
import { EscrowContent } from "@/components/escrow/escrow-content";
import { TransactionTable } from "@/components/escrow/TransactionTable";
import { TransactionDetailModal } from "@/components/escrow/TransactionDetailModal";
import {
  fetchTransactions,
  type TransactionMetadata,
  type TransactionResponse,
} from "@/utils/transactionFetcher";
import { LedgerBalancePanel } from "@/components/escrow/LedgerBalancePanel";
import { useIsMobile } from "@/hooks/useIsMobile";

import { useEscrowData } from "@/hooks/useEscrowData";
import { useEnrichedTrustline } from "@/hooks/useEnrichedTrustline";
import { useTokenBalance } from "@/hooks/useTokenBalance";

const DEBUG = process.env.NODE_ENV !== "production";
const RESOLVE_TOAST_ID = "escrow-resolve";

interface EscrowDetailsClientProps {
  initialEscrowId: string;
  initialNetwork: NetworkType;
}

const EscrowDetailsClient: React.FC<EscrowDetailsClientProps> = ({
  initialEscrowId,
  initialNetwork,
}) => {
  const router = useRouter();
  const { currentNetwork, setNetwork } = useNetwork();

  const [contractId, setContractId] = useState<string>(initialEscrowId);
  const [resolving, setResolving] = useState(false);
  const isMobile = useIsMobile();
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const autoSwitchAttempted = useRef(false);

  // URL is source of truth for network on this page
  useEffect(() => {
    if (currentNetwork !== initialNetwork) {
      setNetwork(initialNetwork);
    }
  }, [initialNetwork, currentNetwork, setNetwork]);

  useEffect(() => {
    setContractId(initialEscrowId);
    autoSwitchAttempted.current = false;
  }, [initialEscrowId, initialNetwork]);

  const { raw, organized, loading, error, refresh } = useEscrowData(
    initialEscrowId,
    initialNetwork,
  );

  const { ledgerBalance, decimals, mismatch } = useTokenBalance(
    initialEscrowId,
    raw,
    initialNetwork,
  );

  const { trustline: enrichedTrustline, loading: trustlineLoading } =
    useEnrichedTrustline(organized?.trustline, initialNetwork);

  const organizedWithLive = useMemo(() => {
    if (!organized) return null;
    return {
      ...organized,
      trustline: enrichedTrustline,
      properties: {
        ...organized.properties,
        ...(ledgerBalance ? { balance: ledgerBalance } : {}),
      },
    };
  }, [organized, ledgerBalance, enrichedTrustline]);

  const [transactions, setTransactions] = useState<TransactionMetadata[]>([]);
  const [transactionLoading, setTransactionLoading] = useState<boolean>(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [transactionResponse, setTransactionResponse] =
    useState<TransactionResponse | null>(null);
  const [selectedTxHash, setSelectedTxHash] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showOnlyTransactions, setShowOnlyTransactions] =
    useState<boolean>(false);
  const txRef = useRef<HTMLDivElement | null>(null);

  const fetchTransactionData = useCallback(
    async (id: string, cursor?: string) => {
      if (!id) return;
      setTransactionLoading(true);
      setTransactionError(null);
      try {
        const response = await fetchTransactions(id, { cursor, limit: 20 });
        setTransactionResponse(response);
        if (cursor) {
          setTransactions((prev) => [...prev, ...response.transactions]);
        } else {
          setTransactions(response.transactions);
        }
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Failed to fetch transactions");
        setTransactionError(message);
        toast.error("Transactions failed", {
          description: message,
        });
      } finally {
        setTransactionLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!initialEscrowId) return;
    fetchTransactionData(initialEscrowId);
  }, [initialEscrowId, initialNetwork, fetchTransactionData]);

  // Auto-switch / bail out when the URL network has no valid escrow
  useEffect(() => {
    if (loading || organized || autoSwitchAttempted.current) return;
    if (!error) return;

    autoSwitchAttempted.current = true;
    let cancelled = false;

    async function recover() {
      setResolving(true);
      try {
        const result = await resolveEscrow(initialEscrowId, initialNetwork);
        if (cancelled) return;

        if (result.ok && result.network !== initialNetwork) {
          setNetwork(result.network);
          toast.info(`Switched to ${networkLabel(result.network)}`, {
            description: "Contract found on the other network.",
          });
          router.replace(escrowPath(result.network, initialEscrowId));
          return;
        }

        if (result.ok) {
          await refresh();
          return;
        }

        toast.error(toastTitleForReason(result.reason), {
          description: result.message,
        });
        router.replace("/");
      } finally {
        if (!cancelled) setResolving(false);
      }
    }

    void recover();

    return () => {
      cancelled = true;
    };
  }, [
    loading,
    organized,
    error,
    initialEscrowId,
    initialNetwork,
    router,
    setNetwork,
    refresh,
  ]);

  const navigateToResolved = useCallback(
    async (id: string) => {
      const trimmed = id.trim();
      if (!trimmed) {
        toast.error("Contract ID required", {
          description: "Paste a Soroban contract ID to continue.",
        });
        return;
      }

      setResolving(true);
      toast.loading("Resolving escrow", {
        id: RESOLVE_TOAST_ID,
        description: "Checking Testnet and Mainnet.",
      });

      try {
        const result = await resolveEscrow(trimmed, initialNetwork);

        if (!result.ok) {
          toast.error(toastTitleForReason(result.reason), {
            id: RESOLVE_TOAST_ID,
            description: result.message,
          });
          return;
        }

        setNetwork(result.network);
        if (result.switched) {
          toast.info(`Switched to ${networkLabel(result.network)}`, {
            id: RESOLVE_TOAST_ID,
            description: "Contract found on the other network.",
          });
        } else {
          toast.dismiss(RESOLVE_TOAST_ID);
        }

        if (
          result.network === initialNetwork &&
          trimmed === initialEscrowId
        ) {
          await refresh();
          fetchTransactionData(trimmed);
        } else {
          router.push(escrowPath(result.network, trimmed));
        }
      } finally {
        setResolving(false);
      }
    },
    [
      initialNetwork,
      initialEscrowId,
      setNetwork,
      refresh,
      fetchTransactionData,
      router,
    ],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") void navigateToResolved(contractId);
  };

  const handleUseExample = () => {
    const id = EXAMPLE_CONTRACT_IDS[initialNetwork];
    setContractId(id);
    void navigateToResolved(id);
  };

  const handleFetch = async () => {
    await navigateToResolved(contractId);
  };

  const handleTransactionClick = (txHash: string) => {
    setSelectedTxHash(txHash);
    setIsModalOpen(true);
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTxHash(null);
  };
  const handleLoadMoreTransactions = () => {
    if (transactionResponse?.cursor && initialEscrowId) {
      fetchTransactionData(initialEscrowId, transactionResponse.cursor);
    }
  };

  useEffect(() => {
    if (showOnlyTransactions && txRef.current) {
      try {
        txRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch {
        // ignore scroll failures
      }
    }
  }, [showOnlyTransactions]);

  useEffect(() => {
    if (!DEBUG) return;
    console.log("[DBG][EscrowDetails] network:", initialNetwork);
    console.log("[DBG][EscrowDetails] contractId:", initialEscrowId);
  }, [initialNetwork, initialEscrowId]);

  useEffect(() => {
    if (!DEBUG) return;
    console.log("[DBG][EscrowDetails] raw escrow map:", raw);
  }, [raw]);

  useEffect(() => {
    if (!DEBUG) return;
    console.log("[DBG][EscrowDetails] organized data:", organized);
  }, [organized]);

  useEffect(() => {
    if (!DEBUG) return;
    console.log("[DBG][EscrowDetails] token live balance:", {
      ledgerBalance,
      decimals,
      mismatch,
    });
  }, [ledgerBalance, decimals, mismatch]);

  const busy = loading || resolving;

  return (
    <TooltipProvider>
      <div className="bg-background">
        <NavbarSimple />

        <main className="flex flex-col gap-6 p-4 md:px-8">
          <div className="mx-auto w-full max-w-5xl">
            <Header />

            {!showOnlyTransactions && (
              <SearchCard
                contractId={contractId}
                setContractId={setContractId}
                loading={busy}
                isSearchFocused={isSearchFocused}
                setIsSearchFocused={setIsSearchFocused}
                handleKeyDown={handleKeyDown}
                fetchEscrowData={handleFetch}
                handleUseExample={handleUseExample}
                raw={raw}
                organized={organized}
                initialEscrowId={initialEscrowId}
                currentNetwork={initialNetwork}
                setShowOnlyTransactions={setShowOnlyTransactions}
              />
            )}

            {!showOnlyTransactions && (
              <EscrowContent
                loading={busy}
                organized={error ? null : organizedWithLive}
                trustlineLoading={trustlineLoading}
                isMobile={isMobile}
                error={error}
              />
            )}

            {!showOnlyTransactions && raw && ledgerBalance && !error && (
              <LedgerBalancePanel
                balance={ledgerBalance}
                symbol={enrichedTrustline.assetCode}
                decimals={decimals}
                mismatch={mismatch}
              />
            )}

            {raw && !error && showOnlyTransactions && (
              <div ref={txRef} className="mt-2 flex flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-semibold tracking-tight md:text-xl">
                      Transaction History
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Complete blockchain activity record for this escrow
                      contract
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOnlyTransactions(false)}
                    aria-label="Back to details"
                  >
                    Back to Details
                  </Button>
                </div>

                <section className="rounded-3xl border border-border bg-card p-4 sm:p-6">
                  <TransactionTable
                    transactions={transactions}
                    loading={transactionLoading}
                    error={transactionError}
                    retentionNotice={transactionResponse?.retentionNotice}
                    hasMore={transactionResponse?.hasMore || false}
                    onLoadMore={handleLoadMoreTransactions}
                    onTransactionClick={handleTransactionClick}
                    isMobile={isMobile}
                  />
                </section>
              </div>
            )}

            <TransactionDetailModal
              txHash={selectedTxHash}
              isOpen={isModalOpen}
              onClose={handleModalClose}
              isMobile={isMobile}
            />
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
};

export default EscrowDetailsClient;
