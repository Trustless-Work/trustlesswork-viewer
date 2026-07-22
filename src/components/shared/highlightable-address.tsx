"use client";

import type { ReactNode } from "react";
import { useAddressHighlight } from "@/contexts/AddressHighlightContext";
import { cn } from "@/lib/utils";

interface HighlightableAddressProps {
  address: string;
  children: ReactNode;
  className?: string;
  title?: string;
}

/**
 * Marks an on-screen address as hoverable. Matching addresses across the
 * escrow view (roles, milestone receivers, issuer, etc.) share a dashed
 * primary highlight while any one of them is hovered.
 */
export function HighlightableAddress({
  address,
  children,
  className,
  title,
}: HighlightableAddressProps) {
  const { setHoveredAddress, isHighlighted } = useAddressHighlight();
  const highlighted = isHighlighted(address);

  return (
    <div
      className={cn(
        "min-w-0 transition-[border-color,background-color,box-shadow]",
        highlighted
          ? "border border-dashed border-primary bg-primary/10 ring-1 ring-primary/25"
          : "border border-transparent",
        className,
      )}
      title={title ?? address}
      onMouseEnter={() => setHoveredAddress(address)}
      onMouseLeave={() => setHoveredAddress(null)}
    >
      {children}
    </div>
  );
}
