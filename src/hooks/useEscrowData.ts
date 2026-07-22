// src/hooks/useEscrowData.ts
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getLedgerKeyContractCode,
  type EscrowMap,
} from "@/utils/ledgerkeycontract";
import {
  organizeEscrowData,
  type OrganizedEscrowData,
} from "@/mappers/escrow-mapper";
import { isValidEscrowMap } from "@/lib/resolve-escrow";
import type { NetworkType } from "@/lib/network-config";

const ESCROW_TOAST_ID = "escrow-fetch";

/**
 * Loads raw escrow contract storage and maps it to OrganizedEscrowData for UI.
 * Purely client-side; no caching layer yet.
 *
 * Hard failures surface via `error` so the page can auto-switch / redirect;
 * success still uses a short Sonner toast.
 */
export function useEscrowData(
  contractId: string,
  network: NetworkType,
) {
  const [raw, setRaw] = useState<EscrowMap | null>(null);
  const [organized, setOrganized] = useState<OrganizedEscrowData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!contractId) return;
    setLoading(true);
    setError(null);

    toast.loading("Loading escrow", {
      id: ESCROW_TOAST_ID,
      description: "Fetching contract data from the network.",
    });

    try {
      const data = await getLedgerKeyContractCode(contractId, network);

      if (!data.length || !isValidEscrowMap(data)) {
        setRaw(null);
        setOrganized(null);
        const message = "This is not a valid Trustless Work escrow.";
        setError(message);
        toast.dismiss(ESCROW_TOAST_ID);
        return;
      }

      setRaw(data);
      setOrganized(organizeEscrowData(data, contractId, network));
      toast.success("Escrow loaded", {
        id: ESCROW_TOAST_ID,
        description: "Contract details are ready to view.",
      });
    } catch (e) {
      setRaw(null);
      setOrganized(null);
      const message =
        e instanceof Error ? e.message : "Failed to fetch escrow data";
      setError(message);
      // Leave toast dismissal to the page recover flow (auto-switch / redirect)
      toast.dismiss(ESCROW_TOAST_ID);
    } finally {
      setLoading(false);
    }
  }, [contractId, network]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { raw, organized, loading, error, refresh };
}
