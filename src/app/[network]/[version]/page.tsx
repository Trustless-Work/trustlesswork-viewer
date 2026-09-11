import { redirect } from "next/navigation";
import type { NextPage } from "next";
import { LegacyEscrowRedirect } from "@/components/escrow/legacy-escrow-redirect";
import { isNetworkType, isVersionSegment } from "@/lib/resolve-escrow";
import { isStellarAddress } from "@/lib/format-address";

interface VersionOrLegacyPageProps {
  params: Promise<{ network: string; version: string }>;
}

/**
 * Two-segment routes under `/[network]/[version]`:
 * - `/testnet/v1` or `/testnet/v2` (no id) → home
 * - `/testnet/C…` (legacy bookmark without version) → resolve network + version → canonical
 */
const VersionOrLegacyPage: NextPage<VersionOrLegacyPageProps> = async ({
  params,
}) => {
  const { network, version: segment } = await params;

  if (!isNetworkType(network)) {
    redirect("/");
  }

  if (isVersionSegment(segment)) {
    redirect("/");
  }

  if (segment.startsWith("C") && isStellarAddress(segment)) {
    return (
      <LegacyEscrowRedirect contractId={segment} preferredNetwork={network} />
    );
  }

  redirect("/");
};

export default VersionOrLegacyPage;
