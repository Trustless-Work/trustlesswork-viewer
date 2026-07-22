"use client";

import { useEffect, useState } from "react";
import type { NetworkType } from "@/lib/network-config";
import { fetchTokenIdentity } from "@/lib/token-service";
import {
  mergeTrustlineInfo,
  parseAssetName,
  type TrustlineInfo,
} from "@/lib/trustline";

const EMPTY_TRUSTLINE: TrustlineInfo = {
  contractId: null,
  issuer: null,
  assetCode: null,
};

/**
 * Enriches trustline with SAC `symbol` / `name` when the escrow map is incomplete.
 * Soft-fails to the base trustline so UI can fall back cleanly.
 */
export function useEnrichedTrustline(
  trustline: TrustlineInfo | null | undefined,
  network: NetworkType,
): { trustline: TrustlineInfo; loading: boolean } {
  const base = trustline ?? EMPTY_TRUSTLINE;
  const [info, setInfo] = useState<TrustlineInfo>(base);
  const [loading, setLoading] = useState(false);

  const baseContractId = base.contractId;
  const baseAssetCode = base.assetCode;
  const baseIssuer = base.issuer;

  useEffect(() => {
    const nextBase: TrustlineInfo = {
      contractId: baseContractId,
      assetCode: baseAssetCode,
      issuer: baseIssuer,
    };
    setInfo(nextBase);

    const needsEnrichment =
      !!baseContractId && (!baseAssetCode || !baseIssuer);

    if (!needsEnrichment || !baseContractId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const identity = await fetchTokenIdentity(network, baseContractId);
        if (cancelled) return;

        const fromName = identity.name
          ? parseAssetName(identity.name)
          : { code: null, issuer: null };

        setInfo(
          mergeTrustlineInfo(nextBase, {
            assetCode: baseAssetCode ?? identity.symbol ?? fromName.code,
            issuer: baseIssuer ?? fromName.issuer,
          }),
        );
      } catch {
        // Keep base — callers fall back to contract-only UI
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [baseContractId, baseAssetCode, baseIssuer, network]);

  return { trustline: info, loading };
}
