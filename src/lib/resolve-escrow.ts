import { isStellarAddress } from "@/lib/format-address";
import type { NetworkType } from "@/lib/network-config";
import {
  getLedgerKeyContractCode,
  type EscrowMap,
} from "@/utils/ledgerkeycontract";

export type ResolveEscrowReason = "invalid_id" | "not_found" | "not_escrow";

export type ResolveEscrowResult =
  | {
      readonly ok: true;
      network: NetworkType;
      data: EscrowMap;
      switched: boolean;
    }
  | {
      readonly ok: false;
      reason: ResolveEscrowReason;
      message: string;
    };

const OTHER_NETWORK: Record<NetworkType, NetworkType> = {
  testnet: "mainnet",
  mainnet: "testnet",
};

function isContractIdFormat(id: string): boolean {
  return id.startsWith("C") && isStellarAddress(id);
}

function hasNonEmptyStringField(data: EscrowMap, symbol: string): boolean {
  const entry = data.find((e) => e.key.symbol === symbol);
  const s = entry?.val?.string?.trim();
  return typeof s === "string" && s.length > 0;
}

function hasAmountField(data: EscrowMap): boolean {
  const entry = data.find((e) => e.key.symbol === "amount");
  if (!entry?.val) return false;
  const val = entry.val;
  if (val.i128 || val.u128 || val.u64 || val.i64) return true;
  if (typeof val.string === "string" && val.string.trim() !== "") return true;
  if (typeof val.u32 === "number") return true;
  return false;
}

function hasRolesWithAddress(data: EscrowMap): boolean {
  const rolesEntry = data.find((e) => e.key.symbol === "roles");
  if (!rolesEntry?.val?.map || !Array.isArray(rolesEntry.val.map)) return false;
  return rolesEntry.val.map.some(
    (role) => typeof role.val?.address === "string" && role.val.address.length > 0,
  );
}

function hasMilestones(data: EscrowMap): boolean {
  const milestonesEntry = data.find((e) => e.key.symbol === "milestones");
  return (
    Array.isArray(milestonesEntry?.val?.vec) &&
    milestonesEntry.val.vec.length > 0
  );
}

/**
 * Minimal Trustless Work escrow shape: roles with ≥1 address, plus
 * milestones or a title/amount field.
 */
export function isValidEscrowMap(data: EscrowMap | null | undefined): boolean {
  if (!data || data.length === 0) return false;
  if (!hasRolesWithAddress(data)) return false;
  return (
    hasMilestones(data) ||
    hasNonEmptyStringField(data, "title") ||
    hasAmountField(data)
  );
}

type TryNetworkResult =
  | { kind: "ok"; data: EscrowMap }
  | { kind: "not_found" }
  | { kind: "not_escrow" }
  | { kind: "error"; message: string };

function classifyFetchError(error: unknown): TryNetworkResult {
  const message =
    error instanceof Error ? error.message : "Failed to fetch escrow data";
  const lower = message.toLowerCase();

  if (
    lower.includes("escrow data not found") ||
    lower.includes("schema may have changed") ||
    lower.includes("not a soroban instance")
  ) {
    return { kind: "not_escrow" };
  }

  if (lower.includes("contract not found")) {
    return { kind: "not_found" };
  }

  return { kind: "error", message };
}

async function tryNetwork(
  contractId: string,
  network: NetworkType,
): Promise<TryNetworkResult> {
  try {
    const data = await getLedgerKeyContractCode(contractId, network);
    if (!data || data.length === 0) return { kind: "not_escrow" };
    if (!isValidEscrowMap(data)) return { kind: "not_escrow" };
    return { kind: "ok", data };
  } catch (error) {
    return classifyFetchError(error);
  }
}

export function escrowPath(network: NetworkType, contractId: string): string {
  return `/${network}/${contractId.trim()}`;
}

export function isNetworkType(value: string): value is NetworkType {
  return value === "testnet" || value === "mainnet";
}

export function networkLabel(network: NetworkType): string {
  return network === "mainnet" ? "Mainnet" : "Testnet";
}

/**
 * Resolves a contract ID on the preferred network, then the other network.
 * Validates Soroban C… format and basic escrow storage shape.
 */
export async function resolveEscrow(
  contractId: string,
  preferredNetwork: NetworkType,
): Promise<ResolveEscrowResult> {
  const id = contractId.trim();

  if (!id || !isContractIdFormat(id)) {
    return {
      ok: false,
      reason: "invalid_id",
      message: "This is not a valid Trustless Work escrow.",
    };
  }

  const primary = await tryNetwork(id, preferredNetwork);
  if (primary.kind === "ok") {
    return {
      ok: true,
      network: preferredNetwork,
      data: primary.data,
      switched: false,
    };
  }

  // Same C… id can exist independently on the other network — always try it
  // when the preferred network did not yield a valid escrow.
  const other = OTHER_NETWORK[preferredNetwork];
  const secondary = await tryNetwork(id, other);

  if (secondary.kind === "ok") {
    return {
      ok: true,
      network: other,
      data: secondary.data,
      switched: true,
    };
  }

  const sawNonEscrow =
    primary.kind === "not_escrow" || secondary.kind === "not_escrow";
  if (sawNonEscrow) {
    return {
      ok: false,
      reason: "not_escrow",
      message: "This is not a valid Trustless Work escrow.",
    };
  }

  if (primary.kind === "error" && secondary.kind === "error") {
    return {
      ok: false,
      reason: "not_found",
      message: primary.message,
    };
  }

  return {
    ok: false,
    reason: "not_found",
    message: "No escrow found on Testnet or Mainnet.",
  };
}

export function toastTitleForReason(reason: ResolveEscrowReason): string {
  switch (reason) {
    case "invalid_id":
    case "not_escrow":
      return "Invalid contract ID";
    case "not_found":
      return "Contract not found";
  }
}
