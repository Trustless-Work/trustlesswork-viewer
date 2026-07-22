import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowSquareOut,
  DownloadIcon,
  Flask,
  MagnifyingGlass,
  SpinnerGap,
  X,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SectionCard } from "@/components/shared/section-card";
import {
  getStellarLabUrl,
  getStellarExpertContractUrl,
} from "@/lib/network-config";
import type { NetworkType } from "@/lib/network-config";
import type { OrganizedEscrowData } from "@/mappers/escrow-mapper";
import type { EscrowMap } from "@/utils/ledgerkeycontract";
import { exportEscrowToPDF } from "@/utils/escrowExport";
import { cn, getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

interface SearchCardProps {
  contractId: string;
  setContractId: (id: string) => void;
  loading: boolean;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  fetchEscrowData: () => Promise<void>;
  handleUseExample: () => void;
  raw?: EscrowMap | null;
  organized?: OrganizedEscrowData | null;
  initialEscrowId?: string;
  currentNetwork?: NetworkType;
  setShowOnlyTransactions?: (show: boolean) => void;
}

export const SearchCard = ({
  contractId,
  setContractId,
  loading,
  isSearchFocused,
  setIsSearchFocused,
  handleKeyDown,
  fetchEscrowData,
  handleUseExample,
  raw,
  organized,
  initialEscrowId,
  currentNetwork = "testnet",
}: SearchCardProps) => {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);

  const handleCloseContract = () => {
    router.push("/");
  };

  const resolveContractId = () => {
    const escrowIdFromData = organized?.properties?.escrow_id as
      | string
      | undefined;
    return (
      escrowIdFromData?.trim() || contractId?.trim() || initialEscrowId?.trim()
    );
  };

  const handleExportPDF = useCallback(async () => {
    if (!organized) {
      toast.error("Export unavailable", {
        description: "Load an escrow before exporting a PDF.",
      });
      return;
    }

    if (isExporting) return;

    setIsExporting(true);
    toast.loading("Exporting PDF", {
      id: "escrow-pdf-export",
      description: "Generating your escrow report.",
    });

    try {
      await exportEscrowToPDF(organized, currentNetwork);
      toast.success("PDF exported", {
        id: "escrow-pdf-export",
        description: "Your escrow report downloaded successfully.",
      });
    } catch (error) {
      const message = getErrorMessage(error, "Failed to export PDF");
      toast.error("Export failed", {
        id: "escrow-pdf-export",
        description: message,
      });
    } finally {
      setIsExporting(false);
    }
  }, [organized, currentNetwork, isExporting]);

  return (
    <SectionCard
      title="Contract Lookup"
      icon={MagnifyingGlass}
      className={cn(
        "mx-auto mb-6 transition-shadow w-full",
        isSearchFocused && "ring-1 ring-primary/40",
      )}
      action={
        raw ? (
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full p-5"
                  onClick={handleExportPDF}
                  disabled={!organized || isExporting}
                  aria-label={isExporting ? "Exporting..." : "Export to PDF"}
                >
                  {isExporting ? (
                    <SpinnerGap
                      className="animate-spin text-foreground"
                      weight="duotone"
                    />
                  ) : (
                    <DownloadIcon size={32} weight="duotone" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isExporting ? "Exporting..." : "Export to PDF"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full p-5"
                  onClick={() => {
                    const idToUse = resolveContractId();

                    if (!idToUse) {
                      toast.error("Contract ID required", {
                        description: "Load an escrow before opening Stellar Lab.",
                      });
                      return;
                    }
                    const labWindow = window.open(
                      getStellarLabUrl(currentNetwork, idToUse),
                      "_blank",
                      "noopener,noreferrer",
                    );
                    if (!labWindow) {
                      toast.error("Popup blocked", {
                        description: "Allow popups to open Stellar Lab.",
                      });
                    }
                  }}
                  aria-label="Open in Stellar Lab"
                >
                  <Flask className="size-4 text-foreground" weight="duotone" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open in Stellar Lab</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full p-5"
                  onClick={() => {
                    const idToUse = resolveContractId();

                    if (!idToUse) {
                      toast.error("Contract ID required", {
                        description:
                          "Load an escrow before opening Stellar Expert.",
                      });
                      return;
                    }
                    const expertWindow = window.open(
                      getStellarExpertContractUrl(currentNetwork, idToUse),
                      "_blank",
                      "noopener,noreferrer",
                    );
                    if (!expertWindow) {
                      toast.error("Popup blocked", {
                        description: "Allow popups to open Stellar Expert.",
                      });
                    }
                  }}
                  aria-label="Open in Stellar Expert"
                >
                  <ArrowSquareOut
                    className="text-foreground"
                    weight="duotone"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open in Stellar Expert</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon-sm"
                  className="rounded-full p-5"
                  onClick={handleCloseContract}
                  aria-label="Close"
                >
                  <X className="size-4" weight="bold" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Close</TooltipContent>
            </Tooltip>
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="text"
            placeholder="Enter escrow contract ID"
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            disabled={loading}
            className="w-full sm:w-3/5"
          />

          <Button
            onClick={fetchEscrowData}
            disabled={loading}
            size="sm"
            className="rounded-full"
          >
            {loading ? (
              <SpinnerGap className="animate-spin" weight="duotone" />
            ) : (
              <MagnifyingGlass weight="duotone" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>Example ID:</span>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={handleUseExample}
          >
            Click to use example
          </Button>
        </div>
      </div>
    </SectionCard>
  );
};
