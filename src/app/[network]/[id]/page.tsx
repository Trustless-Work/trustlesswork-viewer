import { redirect } from "next/navigation";
import type { NextPage } from "next";
import EscrowDetailsClient from "@/components/escrow/EscrowDetails";
import { isNetworkType } from "@/lib/resolve-escrow";

interface EscrowDetailsPageProps {
  params: Promise<{ network: string; id: string }>;
}

const EscrowDetailsPage: NextPage<EscrowDetailsPageProps> = async ({
  params,
}) => {
  const { network, id } = await params;

  if (!isNetworkType(network)) {
    redirect("/");
  }

  return (
    <EscrowDetailsClient initialEscrowId={id} initialNetwork={network} />
  );
};

export default EscrowDetailsPage;
