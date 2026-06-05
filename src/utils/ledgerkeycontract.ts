import { Contract, xdr, Address } from "@stellar/stellar-sdk";
import { NetworkType, getNetworkConfig } from "@/lib/network-config";

// Define types for the escrow data map
interface EscrowKey {
  symbol: string;
}

export interface EscrowValue {
  i128?: { hi: number | string; lo: number | string };
  u128?: { hi: number | string; lo: number | string };
  u32?: number;
  u64?: string | number;
  i64?: string | number;
  string?: string;
  address?: string;
  bool?: boolean;
  vec?: EscrowMapEntry[]; // For nested structures like milestones
  map?: EscrowMapEntry[]; // Ensure map is an array
}

interface EscrowMapEntry {
  key: EscrowKey;
  val: EscrowValue;
  map?: EscrowMapEntry[];
}

export type EscrowMap = EscrowMapEntry[];

interface StorageEntry {
  key: { vec?: { symbol: string }[]; symbol?: string };
  val: { map?: EscrowMapEntry[] };
}

// Possible keys the escrow contract might use
const ESCROW_KEYS = ["Escrow", "EscrowData", "escrow", "State", "Data"];

function matchesEscrowKey(entry: StorageEntry): boolean {
  for (const k of ESCROW_KEYS) {
    // Vec format: { vec: [{ symbol: "Escrow" }] }
    if (entry.key?.vec && entry.key.vec[0]?.symbol === k) return true;
    // Symbol format: { symbol: "Escrow" }
    if (entry.key?.symbol === k) return true;
  }
  return false;
}

/**
 * Build a LedgerKey for persistent ContractData with a Vec[Symbol] key.
 * This is how Soroban DataKey enum variants are stored (e.g. DataKey::Escrow).
 */
function buildPersistentEscrowLedgerKey(
  contractId: string,
  keySymbol: string,
): string {
  const ledgerKey = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: new Address(contractId).toScAddress(),
      key: xdr.ScVal.scvVec([xdr.ScVal.scvSymbol(keySymbol)]),
      durability: xdr.ContractDataDurability.persistent(),
    }),
  );
  return ledgerKey.toXDR("base64");
}

/**
 * Try reading the escrow from persistent storage.
 * Used as a fallback when contract_instance.storage is null (new contracts).
 */
async function fetchFromPersistentStorage(
  contractId: string,
  rpcUrl: string,
): Promise<EscrowMap | null> {
  for (const keySymbol of ESCROW_KEYS) {
    let keyBase64: string;
    try {
      keyBase64 = buildPersistentEscrowLedgerKey(contractId, keySymbol);
    } catch {
      continue;
    }

    const requestBody = {
      jsonrpc: "2.0",
      id: 8675309,
      method: "getLedgerEntries",
      params: {
        keys: [keyBase64],
        xdrFormat: "json",
      },
    };

    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) continue;

    const json = await res.json();
    if (json.error || !json.result?.entries?.length) continue;

    const entry = json.result.entries[0];
    const val = entry?.dataJson?.contract_data?.val;

    console.log(
      `[DEBUG] Persistent storage (key="${keySymbol}"):`,
      JSON.stringify(val, null, 2),
    );

    if (val?.map && Array.isArray(val.map)) {
      return val.map as EscrowMap;
    }
  }
  return null;
}

export async function getLedgerKeyContractCode(
  contractId: string,
  network: NetworkType = "testnet",
): Promise<EscrowMap> {
  const networkConfig = getNetworkConfig(network);
  const { rpcUrl } = networkConfig;

  // ── Step 1: fetch contract instance storage ──────────────────────────────
  const instanceKey = new Contract(contractId).getFootprint();
  const instanceKeyBase64 = instanceKey.toXDR("base64");

  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 8675309,
      method: "getLedgerEntries",
      params: { keys: [instanceKeyBase64], xdrFormat: "json" },
    }),
  });

  if (!res.ok) {
    throw new Error(`RPC request failed (HTTP ${res.status})`);
  }

  const json = await res.json();

  if (json.error) {
    throw new Error(json.error.message || "RPC returned an error");
  }

  const entry = json.result?.entries?.[0];
  if (!entry) {
    throw new Error(
      "Contract not found. Check the contract ID and selected network.",
    );
  }

  const contractData = entry?.dataJson?.contract_data?.val?.contract_instance;
  if (!contractData) {
    throw new Error("Contract is not a Soroban instance contract.");
  }

  const storage = contractData.storage;

  // ── Step 2: try instance storage first ───────────────────────────────────
  if (storage && Array.isArray(storage)) {
    console.log(
      "[DEBUG] Raw contract instance storage:",
      JSON.stringify(storage, null, 2),
    );

    const escrowEntry = storage.find((s: StorageEntry) => matchesEscrowKey(s));

    if (escrowEntry) {
      if (!escrowEntry.val?.map || !Array.isArray(escrowEntry.val.map)) {
        return [];
      }
      return escrowEntry.val.map as EscrowMap;
    }
  }

  // ── Step 3: instance storage is null/empty → try persistent storage ──────
  // New contract versions store escrow data via env.storage().persistent()
  const persistentMap = await fetchFromPersistentStorage(contractId, rpcUrl);
  if (persistentMap !== null) {
    return persistentMap;
  }

  throw new Error(
    "Escrow data not found in contract storage. " +
      "This contract may not be a Trustless Work escrow, or the contract schema has changed.",
  );
}
