import { redirect } from "next/navigation";
import type { NextPage } from "next";
import EscrowDetailsClient from "@/components/escrow/EscrowDetails";
import { isNetworkType, isVersionSegment } from "@/lib/resolve-escrow";

interface EscrowDetailsPageProps {
  params: Promise<{ network: string; version: string; id: string }>;
}

const EscrowDetailsPage: NextPage<EscrowDetailsPageProps> = async ({
  params,
}) => {
  const { network, version, id } = await params;

  if (!isNetworkType(network) || !isVersionSegment(version)) {
    redirect("/");
  }

  return (
    <EscrowDetailsClient
      initialEscrowId={id}
      initialNetwork={network}
      initialVersion={version}
    />
  );
};

export default EscrowDetailsPage;
