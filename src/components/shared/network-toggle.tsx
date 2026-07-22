"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useNetwork } from "@/contexts/NetworkContext";
import { NetworkType } from "@/lib/network-config";
import { escrowPath, isNetworkType } from "@/lib/resolve-escrow";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { CaretDown, CheckCircleIcon } from "@phosphor-icons/react";

interface NetworkToggleProps {
  className?: string;
}

const networks: { value: NetworkType; label: string }[] = [
  { value: "testnet", label: "Testnet" },
  { value: "mainnet", label: "Mainnet" },
];

function parseEscrowPath(pathname: string): {
  network: NetworkType;
  contractId: string;
} | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 2) return null;
  const [network, contractId] = segments;
  if (!isNetworkType(network) || !contractId.startsWith("C")) return null;
  return { network, contractId };
}

export function NetworkToggle({ className }: NetworkToggleProps) {
  const { currentNetwork, setNetwork } = useNetwork();
  const pathname = usePathname();
  const router = useRouter();
  const escrowRoute = parseEscrowPath(pathname);

  const handleSelect = (network: NetworkType) => {
    setNetwork(network);
    if (escrowRoute && network !== escrowRoute.network) {
      router.push(escrowPath(network, escrowRoute.contractId));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          {networks.find((n) => n.value === currentNetwork)?.label}
          <CaretDown className="size-4 text-foreground" weight="duotone" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {networks.map((network) => (
          <DropdownMenuItem
            key={network.value}
            onClick={() => handleSelect(network.value)}
            className="flex cursor-pointer items-center gap-2"
          >
            {currentNetwork === network.value && (
              <CheckCircleIcon className="size-4" weight="duotone" />
            )}
            <span>{network.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
