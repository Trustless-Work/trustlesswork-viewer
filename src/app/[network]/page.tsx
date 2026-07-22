import { redirect } from "next/navigation";
import type { NextPage } from "next";
import { LegacyEscrowRedirect } from "@/components/escrow/legacy-escrow-redirect";
import { isNetworkType } from "@/lib/resolve-escrow";

interface NetworkOrLegacyPageProps {
  params: Promise<{ network: string }>;
}

/**
 * Single-segment routes under `/[network]`:
 * - `/testnet` or `/mainnet` → home
 * - `/C…` (legacy bookmark) → resolve then redirect to `/{network}/{id}`
 */
const NetworkOrLegacyPage: NextPage<NetworkOrLegacyPageProps> = async ({
  params,
}) => {
  const { network: segment } = await params;

  if (isNetworkType(segment)) {
    redirect("/");
  }

  return <LegacyEscrowRedirect contractId={segment} />;
};

export default NetworkOrLegacyPage;
