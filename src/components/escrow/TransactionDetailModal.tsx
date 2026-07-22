"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowSquareOut,
  CheckCircle,
  Clock,
  Code,
  Copy,
  Gear,
  Hash,
  SpinnerGap,
  User,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  type TransactionDetails,
  fetchTransactionDetails,
  formatTransactionTime,
  truncateHash,
} from "@/utils/transactionFetcher";
import { ADDRESS_CHARS, formatAddress } from "@/lib/format-address";
import { toast } from "sonner";

interface TransactionDetailModalProps {
  txHash: string | null;
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  txHash,
  isOpen,
  onClose,
  isMobile,
}) => {
  const [details, setDetails] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!txHash) return;

    setLoading(true);
    setError(null);

    toast.loading("Loading transaction", {
      id: "tx-detail",
      description: "Fetching details from the network.",
    });

    try {
      const transactionDetails = await fetchTransactionDetails(txHash);
      setDetails(transactionDetails);
      toast.success("Transaction loaded", {
        id: "tx-detail",
        description: "Details are ready to review.",
      });
    } catch (err) {
      setError("Failed to fetch transaction details");
      console.error("Error fetching transaction details:", err);
      toast.error("Transaction failed", {
        id: "tx-detail",
        description: "Could not load transaction details.",
      });
    } finally {
      setLoading(false);
    }
  }, [txHash]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied", {
        description: "Value copied to your clipboard.",
      });
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      toast.error("Copy failed", {
        description: "Could not copy this value.",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <CheckCircle className="size-4 text-foreground" weight="duotone" />
        );
      case "FAILED":
        return (
          <WarningCircle className="size-4 text-destructive" weight="duotone" />
        );
      default:
        return (
          <Clock className="size-4 text-foreground" weight="duotone" />
        );
    }
  };

  const getStatusVariant = (
    status: string,
  ): "secondary" | "destructive" | "outline" => {
    if (status === "SUCCESS") return "secondary";
    if (status === "FAILED") return "destructive";
    return "outline";
  };

  const formatJsonValue = (value: unknown): string => {
    if (value === null || value === undefined) return "null";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean")
      return String(value);
    return JSON.stringify(value, null, 2);
  };

  useEffect(() => {
    if (isOpen && txHash) {
      fetchDetails();
    }
  }, [isOpen, txHash, fetchDetails]);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className={`${isMobile ? "max-w-[95vw]" : "sm:max-w-4xl lg:max-w-5xl"} max-h-[92vh] overflow-y-auto`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="size-5 text-foreground" weight="duotone" />
            Transaction Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about the selected transaction
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center py-8">
            <SpinnerGap
              className="size-6 animate-spin text-foreground"
              weight="duotone"
            />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <WarningCircle className="size-4 shrink-0" weight="duotone" />
            <span>{error}</span>
          </div>
        )}

        {details && !loading && (
          <div className="flex flex-col gap-4">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transaction Overview</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Hash
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="rounded bg-muted px-2 py-1 font-mono text-sm"
                        title={details.txHash}
                      >
                        {truncateHash(details.txHash, isMobile)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          window.open(
                            `https://stellar.expert/explorer/${process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet"}/tx/${details.txHash}`,
                            "_blank",
                          )
                        }
                      >
                        <Copy weight="duotone" className="text-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          window.open(
                            `https://stellar.expert/explorer/testnet/tx/${details.txHash}`,
                            "_blank",
                          )
                        }
                      >
                        <ArrowSquareOut
                          weight="duotone"
                          className="text-foreground"
                        />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Status
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(details.status)}
                      <Badge variant={getStatusVariant(details.status)}>
                        {details.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Ledger
                    </label>
                    <p className="text-sm mt-1">
                      {details.ledger.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Time
                    </label>
                    <p className="text-sm mt-1">
                      {formatTransactionTime(details.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Signers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="size-5 text-foreground" weight="duotone" />
                  Signers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {details.signers.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {details.signers.map((signer, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span
                          className="rounded bg-muted px-2 py-1 font-mono text-sm"
                          title={signer}
                        >
                          {formatAddress(
                            signer,
                            isMobile ? ADDRESS_CHARS.sm : ADDRESS_CHARS.md,
                          )}
                        </span>
                        {signer !== "(Signature validation required)" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => copyToClipboard(signer)}
                          >
                            <Copy
                              weight="duotone"
                              className="text-foreground"
                            />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No signer information available
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Function Call */}
            {details.calledFunction && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Gear className="size-5 text-foreground" weight="duotone" />
                    Function Call
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Function
                    </label>
                    <p className="font-mono text-sm bg-muted px-2 py-1 rounded mt-1">
                      {details.calledFunction}
                    </p>
                  </div>

                  {details.args && details.args.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Arguments
                      </label>
                      <div className="mt-1 bg-muted p-3 rounded-lg">
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(details.args, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Result */}
            {details.result && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code className="size-5 text-foreground" weight="duotone" />
                    Result
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-3 rounded-lg">
                    <pre className="text-xs overflow-x-auto">
                      {formatJsonValue(details.result)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Raw Data (Collapsible) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Raw Transaction Data</CardTitle>
              </CardHeader>
              <CardContent>
                <details className="flex flex-col gap-2">
                  <summary className="cursor-pointer text-sm font-medium text-primary hover:text-primary/80">
                    Show Raw Data
                  </summary>
                  <div className="mt-3 bg-muted p-3 rounded-lg">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(
                        {
                          envelope: details.envelope,
                          meta: details.meta,
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                </details>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
