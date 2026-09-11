import { Contract } from "@stellar/stellar-sdk";
import { ADDRESS_CHARS, formatAddress } from "@/lib/format-address";
import { getNetworkConfig, type NetworkType } from "@/lib/network-config";
import {
  formatTransactionTime,
  truncateHash,
} from "@/utils/transactionFetcher";

/** Default lookback window — public RPCs reject / time-out on huge ranges. */
const DEFAULT_LEDGER_LOOKBACK = 10_000;

const EVENT_LABELS: Record<string, string> = {
  tw_init: "Initialized",
  tw_fund: "Funded",
  tw_release: "Released",
  tw_dispute: "Dispute Opened",
  tw_resolve: "Dispute Resolved",
  tw_update: "Escrow Updated",
  tw_ms_approve: "Milestone Approved",
  tw_ms_change: "Milestone Updated",
  tw_ms_dispute: "Milestone Dispute",
  tw_ms_resolve: "Milestone Resolved",
  tw_ms_release: "Milestone Released",
};

export interface EscrowEvent {
  id: string;
  type: string;
  name: string;
  label: string;
  engagementId: string | null;
  ledger: number;
  createdAt: string;
  txHash: string;
  successful: boolean;
  /** Compact key/value lines for the payload (most important fields). */
  summary: readonly { key: string; value: string }[];
  topics: readonly string[];
}

export interface FetchEventsOptions {
  startLedger?: number;
  cursor?: string;
  limit?: number;
  network?: NetworkType;
  /** Ledger lookback when `startLedger` is omitted (default 10_000). */
  lookback?: number;
}

export interface EventsResponse {
  events: EscrowEvent[];
  latestLedger: number;
  oldestLedger: number;
  cursor?: string;
  hasMore: boolean;
  retentionNotice?: string;
}

interface RpcEventRow {
  id?: string;
  type?: string;
  ledger?: number;
  ledgerClosedAt?: string;
  contractId?: string;
  txHash?: string;
  inSuccessfulContractCall?: boolean;
  topicJson?: unknown;
  valueJson?: unknown;
  topic?: unknown;
  value?: unknown;
}

interface RpcEventsResult {
  events?: RpcEventRow[];
  latestLedger?: number;
  oldestLedger?: number;
  cursor?: string;
}

interface RpcErrorBody {
  code?: number;
  message?: string;
}

function resolveRpcUrl(network: NetworkType = "testnet"): string {
  return (
    process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ||
    getNetworkConfig(network).rpcUrl
  );
}

async function jsonRpcCall<T>(
  rpcUrl: string,
  method: string,
  params?: Record<string, unknown>,
): Promise<{ result?: T; error?: RpcErrorBody }> {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return (await response.json()) as { result?: T; error?: RpcErrorBody };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatI128String(raw: string, decimals = 7): string {
  const negative = raw.startsWith("-");
  const digits = negative ? raw.slice(1) : raw;
  if (!/^\d+$/.test(digits)) return raw;

  const padded = digits.padStart(decimals + 1, "0");
  const whole = padded.slice(0, -decimals) || "0";
  const frac = padded.slice(-decimals).replace(/0+$/, "");
  const body = frac ? `${whole}.${frac}` : whole;
  return negative ? `-${body}` : body;
}

/** Flatten RPC `xdrFormat: "json"` ScVal into a short display string. */
export function scValJsonToDisplay(value: unknown, depth = 0): string {
  if (value == null) return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (depth > 4) return "…";

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    if (value.length <= 3) {
      return value.map((v) => scValJsonToDisplay(v, depth + 1)).join(", ");
    }
    return `${value.length} items`;
  }

  if (!isRecord(value)) return String(value);

  if ("symbol" in value && typeof value.symbol === "string") return value.symbol;
  if ("string" in value && typeof value.string === "string") return value.string;
  if ("address" in value && typeof value.address === "string") {
    return formatAddress(value.address, ADDRESS_CHARS.sm);
  }
  if ("bool" in value && typeof value.bool === "boolean") return value.bool ? "true" : "false";
  if ("u32" in value) return String(value.u32);
  if ("i32" in value) return String(value.i32);
  if ("u64" in value) return String(value.u64);
  if ("i64" in value) return String(value.i64);
  if ("u128" in value) return String(value.u128);
  if ("i128" in value) {
    const raw =
      typeof value.i128 === "string" || typeof value.i128 === "number"
        ? String(value.i128)
        : isRecord(value.i128) && value.i128 !== null
          ? String(
              (value.i128 as { lo?: unknown }).lo ??
                JSON.stringify(value.i128),
            )
          : JSON.stringify(value.i128);
    return formatI128String(raw);
  }
  if ("bytes" in value && typeof value.bytes === "string") {
    return `0x${value.bytes.slice(0, 16)}${value.bytes.length > 16 ? "…" : ""}`;
  }
  if ("vec" in value) return scValJsonToDisplay(value.vec, depth + 1);

  if ("map" in value && Array.isArray(value.map)) {
    if (depth > 0) return `${value.map.length} fields`;
    return value.map
      .map((entry) => {
        if (!isRecord(entry)) return null;
        const key = scValJsonToDisplay(entry.key, depth + 1);
        const val = scValJsonToDisplay(entry.val, depth + 1);
        return `${key}: ${val}`;
      })
      .filter((line): line is string => Boolean(line))
      .join(" · ");
  }

  return JSON.stringify(value);
}

function extractMapEntries(
  valueJson: unknown,
): { key: string; value: string }[] {
  if (!isRecord(valueJson) || !Array.isArray(valueJson.map)) return [];

  return valueJson.map
    .map((entry) => {
      if (!isRecord(entry)) return null;
      const key = scValJsonToDisplay(entry.key);
      const value = scValJsonToDisplay(entry.val);
      if (!key || key === "—") return null;
      return { key, value };
    })
    .filter((row): row is { key: string; value: string } => row !== null);
}

function topicParts(topicJson: unknown): string[] {
  if (!Array.isArray(topicJson)) return [];
  return topicJson.map((t) => scValJsonToDisplay(t)).filter((t) => t && t !== "—");
}

function eventLabel(name: string): string {
  return EVENT_LABELS[name] ?? name.replace(/^tw_/, "").replace(/_/g, " ");
}

function normalizeEvent(row: RpcEventRow): EscrowEvent | null {
  const txHash = typeof row.txHash === "string" ? row.txHash : "";
  const ledger = typeof row.ledger === "number" ? row.ledger : 0;
  if (!txHash || !ledger) return null;

  const topics = topicParts(row.topicJson);
  const name = topics[0] ?? row.type ?? "event";
  const engagementId =
    topics.length > 1 && topics[1] && topics[1] !== name ? topics[1] : null;

  let summary = extractMapEntries(row.valueJson);
  if (summary.length === 0 && row.valueJson != null) {
    const display = scValJsonToDisplay(row.valueJson);
    if (display && display !== "—") {
      summary = [{ key: "data", value: display }];
    }
  }

  return {
    id: typeof row.id === "string" ? row.id : `${txHash}-${ledger}-${name}`,
    type: typeof row.type === "string" ? row.type : "contract",
    name,
    label: eventLabel(name),
    engagementId,
    ledger,
    createdAt:
      typeof row.ledgerClosedAt === "string" ? row.ledgerClosedAt : "",
    txHash,
    successful: row.inSuccessfulContractCall !== false,
    summary,
    topics,
  };
}

/**
 * Fetches contract events via Soroban JSON-RPC `getEvents`.
 * Uses `xdrFormat: "json"` so topics/values arrive decoded.
 */
export async function fetchContractEvents(
  contractId: string,
  options: FetchEventsOptions = {},
): Promise<EventsResponse> {
  try {
    const {
      cursor,
      limit = 50,
      network = "testnet",
      lookback = DEFAULT_LEDGER_LOOKBACK,
    } = options;
    const rpcUrl = resolveRpcUrl(network);
    const contractAddress = new Contract(contractId).contractId();

    let startLedger = options.startLedger;

    if (!cursor && startLedger == null) {
      const latest = await jsonRpcCall<{ sequence: number }>(
        rpcUrl,
        "getLatestLedger",
      );
      const sequence = latest.result?.sequence;
      if (typeof sequence !== "number") {
        throw new Error("Unable to resolve latest ledger");
      }

      // Probe retention window with a tiny request, then clamp lookback.
      const probe = await jsonRpcCall<RpcEventsResult>(rpcUrl, "getEvents", {
        startLedger: Math.max(1, sequence - 50),
        filters: [
          {
            type: "contract",
            contractIds: [contractAddress],
          },
        ],
        pagination: { limit: 1 },
        xdrFormat: "json",
      });

      if (probe.error) {
        if (
          probe.error.code === -32600 ||
          probe.error.message?.includes("retention")
        ) {
          return {
            events: [],
            latestLedger: sequence,
            oldestLedger: 0,
            hasMore: false,
            retentionNotice:
              "Event history beyond RPC retention. Public RPC typically keeps ~24h–7 days.",
          };
        }
        throw new Error(probe.error.message || "Failed to fetch events");
      }

      const oldest = probe.result?.oldestLedger ?? 0;
      startLedger = Math.max(oldest || 1, sequence - lookback);
    }

    const params: Record<string, unknown> = {
      filters: [
        {
          type: "contract",
          contractIds: [contractAddress],
        },
      ],
      pagination: cursor ? { cursor, limit } : { limit },
      xdrFormat: "json",
    };
    if (!cursor && typeof startLedger === "number") {
      params.startLedger = startLedger;
    }

    const data = await jsonRpcCall<RpcEventsResult>(rpcUrl, "getEvents", params);

    if (data.error) {
      if (
        data.error.code === -32600 ||
        data.error.message?.includes("retention")
      ) {
        return {
          events: [],
          latestLedger: 0,
          oldestLedger: 0,
          hasMore: false,
          retentionNotice:
            "Event history beyond RPC retention. Public RPC typically keeps ~24h–7 days.",
        };
      }
      throw new Error(data.error.message || "Failed to fetch events");
    }

    const result = data.result ?? {};
    const events = (result.events ?? [])
      .map(normalizeEvent)
      .filter((e): e is EscrowEvent => e !== null)
      // Newest first for the activity feed
      .sort((a, b) => b.ledger - a.ledger || a.name.localeCompare(b.name));

    return {
      events,
      latestLedger: result.latestLedger ?? 0,
      oldestLedger: result.oldestLedger ?? 0,
      cursor: result.cursor,
      hasMore: Boolean(result.cursor),
      retentionNotice:
        events.length === 0
          ? "No events in the RPC retention window. Escrow contracts emit topics like tw_init, tw_fund, tw_release."
          : undefined,
    };
  } catch (error) {
    console.error("Error fetching contract events:", error);
    return {
      events: [],
      latestLedger: 0,
      oldestLedger: 0,
      hasMore: false,
      retentionNotice:
        "Unable to fetch events. This may be due to retention limits or network issues.",
    };
  }
}

export { formatTransactionTime, truncateHash };
