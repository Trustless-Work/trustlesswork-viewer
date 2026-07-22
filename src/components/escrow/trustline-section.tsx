"use client";

import Image from "next/image";
import Link from "next/link";
import { OverviewStat } from "@/components/shared/UsdcAmount";
import { TruncatedText } from "@/components/shared/truncated-text";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ADDRESS_CHARS,
  formatAddress,
  isUsdcSymbol,
  type AddressCharSize,
} from "@/lib/format-address";
import type { NetworkType } from "@/lib/network-config";
import {
  isTrustlineFallbackOnly,
  type TrustlineInfo,
} from "@/lib/trustline";

interface AssetOverviewProps {
  trustline: TrustlineInfo;
  network: NetworkType;
  addressSize?: AddressCharSize;
  loading?: boolean;
}

function AssetCodeValue({ code }: { code: string }) {
  if (!isUsdcSymbol(code)) {
    return (
      <TruncatedText as="span" className="block text-base font-medium">
        {code}
      </TruncatedText>
    );
  }

  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-2">
      <Image
        src="/usdc.webp"
        alt="USDC"
        width={20}
        height={20}
        className="shrink-0 rounded-full"
      />
      <TruncatedText as="span" className="text-base font-medium">
        {code}
      </TruncatedText>
    </span>
  );
}

function ContractLink({
  contractId,
  network,
  chars,
}: {
  contractId: string;
  network: NetworkType;
  chars: number;
}) {
  return (
    <Link
      href={`https://stellar.expert/explorer/${network}/contract/${contractId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline-offset-4 hover:underline"
    >
      {formatAddress(contractId, chars)}
    </Link>
  );
}

function AccountLink({
  address,
  network,
  chars,
}: {
  address: string;
  network: NetworkType;
  chars: number;
}) {
  return (
    <Link
      href={`https://stellar.expert/explorer/${network}/account/${address}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline-offset-4 hover:underline"
    >
      {formatAddress(address, chars)}
    </Link>
  );
}

/** Inline asset stats for TitleCard — no separate section shell. */
export const AssetOverviewSkeleton = () => (
  <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex flex-col gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-28" />
      </div>
    ))}
  </dl>
);

/**
 * Asset / trustline overview using the same OverviewStat rhythm as Amount/Balance.
 */
export const AssetOverview = ({
  trustline,
  network,
  addressSize = "lg",
  loading = false,
}: AssetOverviewProps) => {
  const chars = ADDRESS_CHARS[addressSize];

  if (loading && isTrustlineFallbackOnly(trustline)) {
    return <AssetOverviewSkeleton />;
  }

  const canShowBreakdown = !!(trustline.assetCode || trustline.issuer);

  if (!canShowBreakdown) {
    const id = trustline.contractId;
    if (!id) {
      return (
        <p className="text-sm text-muted-foreground">No asset data</p>
      );
    }
    return (
      <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <OverviewStat
          label="Asset Contract"
          value={
            <ContractLink contractId={id} network={network} chars={chars} />
          }
          mono
        />
      </dl>
    );
  }

  return (
    <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3 [&>*]:min-w-0">
      {trustline.assetCode ? (
        <OverviewStat
          label="Asset"
          value={<AssetCodeValue code={trustline.assetCode} />}
        />
      ) : null}
      {trustline.issuer ? (
        <OverviewStat
          label="Issuer"
          value={
            <AccountLink
              address={trustline.issuer}
              network={network}
              chars={chars}
            />
          }
          mono
        />
      ) : null}
      {trustline.contractId ? (
        <OverviewStat
          label="Asset Contract"
          value={
            <ContractLink
              contractId={trustline.contractId}
              network={network}
              chars={chars}
            />
          }
          mono
        />
      ) : null}
    </dl>
  );
};
