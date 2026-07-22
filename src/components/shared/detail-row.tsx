"use client";

import { useState } from "react";
import { Copy, CheckCircle } from "@phosphor-icons/react";
import { InfoTooltip } from "./info-tooltip";
import { TruncatedText } from "./truncated-text";
import { Button } from "@/components/ui/button";
import { useAddressHighlight } from "@/contexts/AddressHighlightContext";
import { ADDRESS_CHARS, formatAddress } from "@/lib/format-address";
import { cn } from "@/lib/utils";

interface DetailRowProps {
  label: string;
  value: string | React.ReactNode;
  tooltip?: string;
  canCopy?: boolean;
  /** Formats string values as start…end; copy still uses the full address. */
  isAddress?: boolean;
  /** Chars on each side when `isAddress`. Default desktop-friendly 8. */
  addressChars?: number;
  /** Clipboard override when `value` is a React node (e.g. a link). */
  copyValue?: string;
}

export const DetailRow = ({
  label,
  value,
  tooltip,
  canCopy = false,
  isAddress = false,
  addressChars = ADDRESS_CHARS.lg,
  copyValue,
}: DetailRowProps) => {
  const [copied, setCopied] = useState(false);
  const { setHoveredAddress, isHighlighted } = useAddressHighlight();

  const fullText = copyValue ?? (typeof value === "string" ? value : undefined);
  const addressValue =
    isAddress && typeof value === "string" ? value.trim() : null;
  const highlighted = Boolean(addressValue && isHighlighted(addressValue));

  const displayValue =
    isAddress && typeof value === "string"
      ? formatAddress(value, addressChars)
      : value;

  const copyToClipboard = () => {
    if (!fullText) return;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedLabel = label.replace(/_/g, " ");

  const stringDisplay =
    typeof displayValue === "string" ? displayValue || "N/A" : null;

  return (
    <div className="flex min-w-0 flex-col gap-1 border-b border-border py-2 last:border-0 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex w-full shrink-0 items-center gap-1.5 sm:w-2/5">
        <TruncatedText
          as="span"
          className="text-xs font-medium capitalize text-muted-foreground"
        >
          {formattedLabel}
        </TruncatedText>
        {tooltip ? <InfoTooltip content={tooltip} /> : null}
      </div>

      <div className="flex min-w-0 w-full items-center gap-1 sm:w-3/5">
        {isAddress && stringDisplay ? (
          <div
            className={cn(
              "min-w-0 flex-1 rounded-lg border bg-muted px-2 py-1 font-mono text-xs tracking-tight transition-[border-color,background-color,box-shadow]",
              !highlighted && "border-border",
              highlighted &&
                "border-dashed border-primary bg-primary/10 ring-1 ring-primary/25",
            )}
            onMouseEnter={() => {
              if (addressValue) setHoveredAddress(addressValue);
            }}
            onMouseLeave={() => {
              if (addressValue) setHoveredAddress(null);
            }}
          >
            <TruncatedText
              as="span"
              className="block font-mono text-xs tracking-tight"
              tooltipClassName="font-mono"
              tooltipText={fullText}
              alwaysShowTooltip={Boolean(fullText)}
            >
              {stringDisplay}
            </TruncatedText>
          </div>
        ) : stringDisplay ? (
          <TruncatedText
            as="span"
            className="flex-1 text-sm font-medium"
          >
            {stringDisplay}
          </TruncatedText>
        ) : (
          <div className="min-w-0 flex-1 truncate text-sm font-medium">
            {displayValue || "N/A"}
          </div>
        )}

        {canCopy && fullText && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-muted-foreground"
            onClick={copyToClipboard}
            title="Copy full address"
          >
            {copied ? (
              <CheckCircle className="text-foreground" weight="duotone" />
            ) : (
              <Copy className="text-foreground opacity-70" weight="duotone" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
