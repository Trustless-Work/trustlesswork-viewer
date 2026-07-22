"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useNetwork } from "@/contexts/NetworkContext";
import {
  escrowPath,
  networkLabel,
  resolveEscrow,
  toastTitleForReason,
} from "@/lib/resolve-escrow";
import { AppShellSkeleton } from "@/components/shared/app-shell-skeleton";

const RESOLVE_TOAST_ID = "legacy-escrow-resolve";

interface LegacyEscrowRedirectProps {
  contractId: string;
}

/**
 * Legacy `/[contractId]` bookmarks: resolve network then replace with
 * `/{network}/{id}`.
 */
export function LegacyEscrowRedirect({
  contractId,
}: LegacyEscrowRedirectProps) {
  const router = useRouter();
  const { currentNetwork, setNetwork } = useNetwork();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let cancelled = false;

    async function run() {
      toast.loading("Resolving escrow", {
        id: RESOLVE_TOAST_ID,
        description: "Detecting network for this contract.",
      });

      const result = await resolveEscrow(contractId, currentNetwork);
      if (cancelled) return;

      if (!result.ok) {
        toast.error(toastTitleForReason(result.reason), {
          id: RESOLVE_TOAST_ID,
          description: result.message,
        });
        router.replace("/");
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
      router.replace(escrowPath(result.network, contractId));
    }

    void run();

    return () => {
      cancelled = true;
    };
    // Intentionally once on mount for this contract id
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId]);

  return <AppShellSkeleton />;
}
