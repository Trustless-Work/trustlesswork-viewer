"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { NavbarSimple } from "@/components/Navbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HomeSearchCard } from "@/components/escrow/home-search-card";
import { EXAMPLE_CONTRACT_IDS } from "@/lib/escrow-constants";
import { useNetwork } from "@/contexts/NetworkContext";
import {
  escrowPath,
  networkLabel,
  resolveEscrow,
  toastTitleForReason,
} from "@/lib/resolve-escrow";

const RESOLVE_TOAST_ID = "home-escrow-resolve";

const Home: NextPage = () => {
  const router = useRouter();
  const { currentNetwork, setNetwork } = useNetwork();
  const [contractId, setContractId] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNavigate = async () => {
    const trimmed = contractId.trim();
    if (!trimmed) {
      toast.error("Contract ID required", {
        description: "Paste a Soroban contract ID to continue.",
      });
      return;
    }

    setLoading(true);
    toast.loading("Resolving escrow", {
      id: RESOLVE_TOAST_ID,
      description: "Checking Testnet and Mainnet.",
    });

    try {
      const result = await resolveEscrow(trimmed, currentNetwork);

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

      router.push(escrowPath(result.network, trimmed));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") void handleNavigate();
  };

  const handleUseExample = () => {
    setContractId(EXAMPLE_CONTRACT_IDS[currentNetwork]);
    toast.info("Example loaded", {
      description: "Press search to open the sample contract.",
    });
  };

  return (
    <TooltipProvider>
      <div className="bg-background">
        <NavbarSimple showLogo={false} />

        <main className="flex flex-col gap-6 p-4 md:min-h-[calc(100svh-4rem)] md:px-8">
          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-8 md:py-12">
            <HomeSearchCard
              contractId={contractId}
              setContractId={setContractId}
              loading={loading}
              isSearchFocused={isSearchFocused}
              setIsSearchFocused={setIsSearchFocused}
              handleKeyDown={handleKeyDown}
              onSearch={handleNavigate}
              onUseExample={handleUseExample}
              currentNetwork={currentNetwork}
            />
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
};

export default Home;
