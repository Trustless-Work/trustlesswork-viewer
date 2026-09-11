// src/mappers/escrow-mapper.ts
import {
  calculateProgress,
  getRoleDisplayName,
  ROLE_ORDER,
} from "@/lib/escrow-constants";
import type { EscrowMap, EscrowValue } from "@/utils/ledgerkeycontract";
import {
  extractTrustlineInfo,
  type TrustlineInfo,
} from "@/lib/trustline";
import type { NetworkType } from "@/lib/network-config";

export type EscrowType = "single-release" | "multi-release";
export type EscrowContractVersion = "v1" | "v2";
export type EscrowExtractedValue = string | { label: string; url: string };
export type { TrustlineInfo };

export interface EscrowRole {
  key: string;
  label: string;
  addresses: string[];
}

export interface MilestoneApprovals {
  target: number;
  count: number;
  approvedBy: string[];
}

export interface ParsedMilestone {
  id: number;
  title: string;
  description: string;
  status: string;
  approved: boolean;
  amount?: string;
  release_flag?: boolean;
  dispute_flag?: boolean;
  resolved_flag?: boolean;
  signer?: string;
  approver?: string;
  receiver?: string;
  evidence?: string;
  approvals?: MilestoneApprovals;
  dispute_reason?: string;
}

export type EscrowFlags = {
  dispute_flag: string;
  release_flag: string;
  resolved_flag: string;
  lifecycle_state: string;
  dispute_reason?: string;
};

export interface OrganizedEscrowData {
  title: string;
  description: string;
  properties: Record<string, string>;
  /** Structured trustline (asset / issuer / SAC). Prefer over `properties.trustline`. */
  trustline: TrustlineInfo;
  roles: EscrowRole[];
  flags: EscrowFlags;
  milestones: ParsedMilestone[];
  progress: number;
  escrowType: EscrowType;
  version: EscrowContractVersion;
}

/* ---------------- helpers ---------------- */
function getStr(m: Record<string, EscrowValue>, k: string): string | undefined {
  const v = m[k] as unknown;
  return isStrLike(v) ? v.string : undefined;
}
function getAddr(
  m: Record<string, EscrowValue>,
  k: string,
): string | undefined {
  const v = m[k] as unknown;
  return isAddrLike(v) ? v.address : undefined;
}
// Reads an address from the first matching key. The multi-release milestone
// schema names the per-milestone payee `receiver`, but tolerate the known
// alternates so a contract revision doesn't silently drop the field.
function getAddrAny(
  m: Record<string, EscrowValue>,
  keys: string[],
): string | undefined {
  for (const k of keys) {
    const addr = getAddr(m, k);
    if (addr) return addr;
  }
  return undefined;
}
function getBool(
  m: Record<string, EscrowValue>,
  k: string,
): boolean | undefined {
  const v = m[k] as unknown;
  return isBoolLike(v) ? v.bool : undefined;
}
function getMap(
  m: Record<string, EscrowValue>,
  k: string,
): MapEntry[] | undefined {
  const v = m[k] as unknown;
  return isMapLike(v) ? v.map : undefined;
}
function getI128(
  m: Record<string, EscrowValue>,
  k: string,
): I128Like | U128Like | undefined {
  const v = m[k] as unknown;
  if (isI128Like(v)) return v as I128Like;
  if (isU128Like(v)) return v as U128Like;
  return undefined;
}

type BoolLike = { bool: boolean };
type StrLikePresent = { string: string };
type AddrLikePresent = { address: string };
type MapEntry = { key: { symbol: string }; val: EscrowValue };
type MapLikePresent = { map: MapEntry[] };
type VecLikePresent = { vec: EscrowValue[] };
type I128Parts = { hi?: number | string; lo?: number | string };
type I128Like = { i128: string | I128Parts };
type U128Like = { u128: string | I128Parts };
type U32Like = { u32: number };
type U64Like = { u64: string | number };

function isBoolLike(v: unknown): v is BoolLike {
  return !!v && typeof (v as Record<"bool", unknown>).bool === "boolean";
}
function isStrLike(v: unknown): v is StrLikePresent {
  return !!v && typeof (v as Record<"string", unknown>).string === "string";
}
function isAddrLike(v: unknown): v is AddrLikePresent {
  return !!v && typeof (v as Record<"address", unknown>).address === "string";
}
function isMapLike(v: unknown): v is MapLikePresent {
  const m = v as { map?: unknown };
  return !!v && Array.isArray(m.map);
}
function isVecLike(v: unknown): v is VecLikePresent {
  const m = v as { vec?: unknown };
  return !!v && Array.isArray(m.vec);
}

function isI128Parts(v: unknown): v is I128Parts {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return "hi" in r || "lo" in r;
}

function isI128Like(v: unknown): v is I128Like {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  if (!("i128" in r)) return false;
  const raw = (r as { i128: unknown }).i128;
  return typeof raw === "string" || isI128Parts(raw);
}

function isU128Like(v: unknown): v is U128Like {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  if (!("u128" in r)) return false;
  const raw = (r as { u128: unknown }).u128;
  return typeof raw === "string" || isI128Parts(raw);
}

function isU32Like(v: unknown): v is U32Like {
  return (
    !!v &&
    typeof v === "object" &&
    typeof (v as Record<string, unknown>).u32 === "number"
  );
}

function isU64Like(v: unknown): v is U64Like {
  if (!v || typeof v !== "object") return false;
  const u64 = (v as Record<string, unknown>).u64;
  return u64 !== undefined && (typeof u64 === "string" || typeof u64 === "number");
}

function i128ToBigIntFlexibleSafe(v: I128Like | U128Like): bigint | null {
  const raw = "i128" in v ? v.i128 : v.u128;
  if (typeof raw === "string") {
    try {
      return BigInt(raw);
    } catch {
      return null;
    }
  }
  if (isI128Parts(raw)) {
    const hi = BigInt(String(raw.hi ?? 0));
    const lo = BigInt(String(raw.lo ?? 0));
    return (hi << BigInt(64)) + lo;
  }
  return null;
}

function getDecimalsFromEscrowMap(data: EscrowMap | null): number | undefined {
  if (!data) return undefined;
  const tl = data.find((e) => e.key.symbol === "trustline")?.val?.map;
  if (!tl) return undefined;
  const decVal = tl.find((m) => m.key.symbol === "decimals")?.val as
    | { u32?: number }
    | undefined;
  if (decVal && typeof decVal.u32 === "number") return decVal.u32;
  return undefined;
}

function safeDecimals(decimals?: number): number {
  if (typeof decimals !== "number" || !Number.isFinite(decimals)) return 7; // Stellar default
  if (decimals < 0) return 0;
  if (decimals > 18) return 7; // clamp outliers
  return Math.floor(decimals);
}

function formatFixed(n: number, digits: number): string {
  return n.toFixed(digits);
}

/** On-chain platform_fee is always basis points (e.g. 200 = 2%). */
function formatPlatformFeePercent(bps: number): string {
  const pct = bps / 100;
  return `${parseFloat(pct.toFixed(2))}%`;
}

function formatAmountFromI128(
  val: I128Like | U128Like,
  decimals?: number,
): string | null {
  const big = i128ToBigIntFlexibleSafe(val);
  if (big === null) return null;
  const d = safeDecimals(decimals);
  return (Number(big) / Math.pow(10, d)).toFixed(d);
}

function boolLabel(v: boolean): string {
  return v ? "True" : "False";
}

function mapEntriesToRecord(entries: MapEntry[]): Record<string, EscrowValue> {
  return entries.reduce<Record<string, EscrowValue>>((acc, entry) => {
    if (entry.key?.symbol) acc[entry.key.symbol] = entry.val;
    return acc;
  }, {});
}

function extractAddressesFromRoleVal(val: EscrowValue | undefined): string[] {
  if (!val) return [];
  if (isAddrLike(val)) return [val.address];
  if (isVecLike(val)) {
    return val.vec
      .map((item) => (isAddrLike(item) ? item.address : null))
      .filter((a): a is string => typeof a === "string" && a.length > 0);
  }
  return [];
}

function parseApprovals(
  milestoneMap: Record<string, EscrowValue>,
): MilestoneApprovals | undefined {
  const nested = getMap(milestoneMap, "approvals");
  if (!nested) return undefined;
  const rec = mapEntriesToRecord(nested);
  const target = isU32Like(rec.target) ? rec.target.u32 : 0;
  const count = isU32Like(rec.approval_count) ? rec.approval_count.u32 : 0;
  const approvedBy = extractAddressesFromRoleVal(rec.approved_by);
  return { target, count, approvedBy };
}

function parseDisputeFromMap(map: Record<string, EscrowValue>): {
  disputed: boolean;
  resolved: boolean;
  reason: string;
} {
  const nested = getMap(map, "dispute");
  if (nested) {
    const rec = mapEntriesToRecord(nested);
    return {
      disputed: !!getBool(rec, "is_disputed"),
      resolved: !!getBool(rec, "resolved"),
      reason: getStr(rec, "reason")?.trim() ?? "",
    };
  }
  return { disputed: false, resolved: false, reason: "" };
}

/* ---------------- detection ---------------- */

export function detectEscrowVersion(
  data: EscrowMap | null,
): EscrowContractVersion {
  if (!data) return "v1";

  const rolesEntry = data.find((e) => e.key.symbol === "roles");
  const rolesMap = rolesEntry?.val?.map;
  if (rolesMap) {
    const hasApproversVec = rolesMap.some(
      (r) => r.key.symbol === "approvers" && isVecLike(r.val),
    );
    const hasSingularApprover = rolesMap.some(
      (r) => r.key.symbol === "approver" && isAddrLike(r.val),
    );
    if (hasApproversVec) return "v2";
    if (hasSingularApprover) return "v1";
    if (rolesMap.some((r) => r.key.symbol === "admin")) return "v2";
  }

  const milestonesEntry = data.find((e) => e.key.symbol === "milestones");
  const milestones = milestonesEntry?.val?.vec;
  if (milestones?.some((m) => m.map?.some((e) => e.key.symbol === "approvals"))) {
    return "v2";
  }
  if (
    data.some((e) => e.key.symbol === "flags") ||
    milestones?.some((m) => m.map?.some((e) => e.key.symbol === "flags"))
  ) {
    return "v1";
  }

  return "v1";
}

export function detectEscrowType(data: EscrowMap | null): EscrowType {
  if (!data) return "single-release";
  const milestonesEntry = data.find((e) => e.key.symbol === "milestones");
  if (milestonesEntry?.val?.vec) {
    const hasMilestoneAmount = milestonesEntry.val.vec.some((m) =>
      m.map?.some((e) => e.key.symbol === "amount"),
    );
    if (hasMilestoneAmount) return "multi-release";
  }
  const hasTopLevelAmount = data.some((e) => e.key.symbol === "amount");
  return hasTopLevelAmount ? "single-release" : "single-release";
}

/* ---------------- extractors ---------------- */

export const extractValue = (
  data: EscrowMap | null,
  key: string,
): EscrowExtractedValue => {
  if (!data) return "N/A";
  const item = data.find((entry) => entry.key.symbol === key);
  if (!item) {
    return "N/A";
  }
  const val: unknown = item.val;
  if (val == null) return "N/A";

  if (key === "platform_fee") {
    if (isStrLike(val)) {
      const str = val.string.trim();
      if (str.includes("%")) return str;
      const num = parseFloat(str.replace("%", "").trim());
      if (!isNaN(num)) return formatPlatformFeePercent(num);
      return str;
    }

    if (isU32Like(val)) {
      return formatPlatformFeePercent(val.u32);
    }

    if (isU64Like(val)) {
      const num =
        typeof val.u64 === "string" ? parseInt(val.u64, 10) : val.u64;
      if (!isNaN(num)) {
        return formatPlatformFeePercent(num);
      }
    }
  }

  if (isBoolLike(val)) return val.bool ? "True" : "False";
  if (isStrLike(val)) return val.string;
  if (isAddrLike(val)) return val.address;

  if (isMapLike(val) && key === "trustline") {
    const tm: MapEntry[] = val.map ?? [];
    const addrVal = tm.find((e) => e.key.symbol === "address")?.val;
    const cidVal = tm.find((e) => e.key.symbol === "contract_id")?.val;
    const addr = isAddrLike(addrVal) ? addrVal.address : undefined;
    const cid = isStrLike(cidVal) ? cidVal.string : undefined;
    return addr ?? cid ?? "N/A";
  }

  if (isI128Like(val)) {
    if (key === "platform_fee") {
      const big = i128ToBigIntFlexibleSafe(val);
      if (big === null) return "N/A";
      return formatPlatformFeePercent(Number(big));
    }
    const formatted = formatAmountFromI128(val, getDecimalsFromEscrowMap(data));
    return formatted ?? "N/A";
  }

  if (isU128Like(val)) {
    if (key === "platform_fee") {
      const big = i128ToBigIntFlexibleSafe(val);
      if (big === null) return "N/A";
      return formatPlatformFeePercent(Number(big));
    }
    const formatted = formatAmountFromI128(val, getDecimalsFromEscrowMap(data));
    return formatted ?? "N/A";
  }

  if (isU64Like(val)) {
    const num =
      typeof val.u64 === "string" ? parseInt(val.u64, 10) : val.u64;
    if (isNaN(num)) return "N/A";
    if (key === "platform_fee") {
      return formatPlatformFeePercent(num);
    }
    if (key === "receiver_memo") {
      return String(num);
    }
    const d = safeDecimals(getDecimalsFromEscrowMap(data));
    return (num / Math.pow(10, d)).toFixed(d);
  }

  if (isU32Like(val)) {
    if (key === "receiver_memo") return String(val.u32);
    return String(val.u32);
  }

  return "N/A";
};

export const extractMilestones = (
  data: EscrowMap | null,
  escrowType: EscrowType,
): ParsedMilestone[] => {
  if (!data) return [];

  const decimals = getDecimalsFromEscrowMap(data);
  const milestonesEntry = data.find(
    (entry) => entry.key.symbol === "milestones",
  );
  if (!milestonesEntry?.val?.vec) return [];

  return milestonesEntry.val.vec.reduce<ParsedMilestone[]>(
    (acc, item, index) => {
      if (!item.map) return acc;

      const milestoneMap = mapEntriesToRecord(item.map as MapEntry[]);

      const nestedFlags: MapEntry[] | undefined = getMap(milestoneMap, "flags");
      const getNestedFlag = (
        name: "approved" | "released" | "disputed" | "resolved",
      ): boolean =>
        !!nestedFlags?.find((f: MapEntry) => f.key.symbol === name)?.val?.bool;

      const approvals = parseApprovals(milestoneMap);
      const approvedFromApprovals =
        approvals !== undefined &&
        approvals.target > 0 &&
        approvals.count >= approvals.target;

      const approved =
        approvedFromApprovals ||
        getNestedFlag("approved") ||
        !!getBool(milestoneMap, "approved") ||
        !!getBool(milestoneMap, "approved_flag");

      const dispute = parseDisputeFromMap(milestoneMap);

      const release_flag =
        getNestedFlag("released") ||
        !!getBool(milestoneMap, "release_flag") ||
        !!getBool(milestoneMap, "released");

      const dispute_flag =
        getNestedFlag("disputed") ||
        !!getBool(milestoneMap, "dispute_flag") ||
        dispute.disputed;

      const resolved_flag =
        getNestedFlag("resolved") ||
        !!getBool(milestoneMap, "resolved_flag") ||
        dispute.resolved;

      const title = getStr(milestoneMap, "title") ?? `Milestone ${index + 1}`;
      const description =
        getStr(milestoneMap, "description") ?? `Milestone ${index + 1}`;
      const status = getStr(milestoneMap, "status") ?? "pending";
      const evidence = getStr(milestoneMap, "evidence")?.trim() || undefined;

      const base: ParsedMilestone = {
        id: index,
        title,
        description,
        status,
        approved,
        evidence,
        approvals,
        dispute_reason: dispute.reason || undefined,
      };

      if (escrowType === "multi-release") {
        let amountStr: string | undefined;
        const i128 = getI128(milestoneMap, "amount");
        if (i128) {
          const formatted = formatAmountFromI128(i128, decimals);
          if (formatted !== null) {
            amountStr = Number(formatted).toFixed(2);
          }
        }

        return [
          ...acc,
          {
            ...base,
            amount: amountStr,
            release_flag,
            dispute_flag,
            resolved_flag,
            signer: getAddr(milestoneMap, "signer"),
            approver: getAddr(milestoneMap, "approver"),
            receiver: getAddrAny(milestoneMap, [
              "receiver",
              "receiver_address",
              "recipient",
              "recipient_address",
            ]),
          },
        ];
      }

      return [...acc, base];
    },
    [],
  );
};

export const extractRoles = (data: EscrowMap | null): EscrowRole[] => {
  if (!data) return [];
  const rolesEntry = data.find((entry) => entry.key.symbol === "roles");
  if (!rolesEntry?.val?.map) return [];

  const byKey = new Map<string, string[]>();
  for (const entry of rolesEntry.val.map) {
    if (!entry.key?.symbol) continue;
    const addresses = extractAddressesFromRoleVal(entry.val);
    if (addresses.length === 0) continue;
    byKey.set(entry.key.symbol, addresses);
  }

  const ordered: EscrowRole[] = [];
  const seen = new Set<string>();

  for (const key of ROLE_ORDER) {
    const addresses = byKey.get(key);
    if (!addresses) continue;
    seen.add(key);
    ordered.push({
      key,
      label: getRoleDisplayName(key),
      addresses,
    });
  }

  for (const [key, addresses] of byKey) {
    if (seen.has(key)) continue;
    ordered.push({
      key,
      label: getRoleDisplayName(key),
      addresses,
    });
  }

  return ordered;
};

export const extractFlags = (
  data: EscrowMap | null,
  escrowType: EscrowType,
  milestones: ParsedMilestone[],
): EscrowFlags => {
  const flags: EscrowFlags = {
    dispute_flag: "N/A",
    release_flag: "N/A",
    resolved_flag: "N/A",
    lifecycle_state: "N/A",
  };
  if (!data) return flags;

  // v1 single: nested `flags` map on escrow
  const flagsEntry = data.find((entry) => entry.key.symbol === "flags");
  if (flagsEntry?.val?.map) {
    for (const flag of flagsEntry.val.map) {
      const symbol = flag.key.symbol;
      const boolVal = flag.val?.bool === true;
      if (symbol === "disputed" || symbol === "dispute_flag")
        flags.dispute_flag = boolLabel(boolVal);
      if (symbol === "released" || symbol === "release_flag")
        flags.release_flag = boolLabel(boolVal);
      if (symbol === "resolved" || symbol === "resolved_flag")
        flags.resolved_flag = boolLabel(boolVal);

      if (
        symbol === "lifecycle_state" ||
        symbol === "status" ||
        symbol === "lifecycle"
      ) {
        if (flag.val?.string) flags.lifecycle_state = flag.val.string;
        else if (isStrLike(flag.val)) flags.lifecycle_state = flag.val.string;
        else if (typeof (flag.val as { u32?: number }).u32 === "number")
          flags.lifecycle_state = `State ${(flag.val as { u32?: number }).u32}`;
      }
    }
  }

  // v2 single: top-level `dispute` + `released`
  const escrowRec = mapEntriesToRecord(
    data.map((e) => ({ key: e.key, val: e.val })),
  );
  const topDispute = parseDisputeFromMap(escrowRec);
  if (getMap(escrowRec, "dispute")) {
    flags.dispute_flag = boolLabel(topDispute.disputed);
    flags.resolved_flag = boolLabel(topDispute.resolved);
    if (topDispute.reason) flags.dispute_reason = topDispute.reason;
  }
  if (getBool(escrowRec, "released") !== undefined) {
    flags.release_flag = boolLabel(!!getBool(escrowRec, "released"));
  }

  // Multi-release: aggregate from milestones when escrow-level flags are absent
  if (escrowType === "multi-release" && milestones.length > 0) {
    const anyDispute = milestones.some((m) => m.dispute_flag);
    const anyRelease = milestones.some((m) => m.release_flag);
    const anyResolved = milestones.some((m) => m.resolved_flag);
    const allReleased = milestones.every((m) => m.release_flag || m.resolved_flag);

    if (flags.dispute_flag === "N/A") flags.dispute_flag = boolLabel(anyDispute);
    if (flags.release_flag === "N/A") {
      flags.release_flag = boolLabel(allReleased || anyRelease);
    }
    if (flags.resolved_flag === "N/A") flags.resolved_flag = boolLabel(anyResolved);

    const reason = milestones.find((m) => m.dispute_reason)?.dispute_reason;
    if (reason) flags.dispute_reason = reason;
  }

  return flags;
};

export function formatFundedAmountValue(
  val: EscrowValue | null | undefined,
  decimals?: number,
): string | undefined {
  if (!val) return undefined;
  if (isI128Like(val) || isU128Like(val)) {
    const formatted = formatAmountFromI128(val, decimals);
    if (formatted === null) return undefined;
    return Number(formatted).toFixed(2);
  }
  return undefined;
}

export const organizeEscrowData = (
  escrowData: EscrowMap | null,
  contractId: string,
  network: NetworkType = "testnet",
  fundedAmountRaw?: EscrowValue | null,
): OrganizedEscrowData | null => {
  if (!escrowData) return null;

  const decimals = safeDecimals(getDecimalsFromEscrowMap(escrowData));
  const version = detectEscrowVersion(escrowData);
  const escrowType = detectEscrowType(escrowData);
  const milestones = extractMilestones(escrowData, escrowType);
  const roles = extractRoles(escrowData);
  const flags = extractFlags(escrowData, escrowType, milestones);
  const progress = calculateProgress(milestones, {
    released: flags.release_flag === "True",
    resolved: flags.resolved_flag === "True",
  });
  const trustline = extractTrustlineInfo(escrowData, network);

  let totalAmount: string = String(extractValue(escrowData, "amount"));
  if (escrowType === "multi-release") {
    const sum = milestones.reduce((acc, m) => {
      if (m.amount && !isNaN(parseFloat(m.amount))) acc += parseFloat(m.amount);
      return acc;
    }, 0);
    if (sum > 0) totalAmount = formatFixed(sum, decimals);
  }

  let balance = String(extractValue(escrowData, "balance"));
  const balanceRaw = escrowData.find((e) => e.key.symbol === "balance")?.val;
  if (isI128Like(balanceRaw) || isU128Like(balanceRaw)) {
    const formatted = formatAmountFromI128(balanceRaw, decimals);
    balance = formatted ?? balance;
  }

  const displayAmount = Number(totalAmount)
    ? Number(totalAmount).toFixed(2)
    : "0.00";

  const displayBalance = Number(balance) ? Number(balance).toFixed(2) : "0.00";

  const trustlineFallback =
    trustline.contractId ??
    trustline.issuer ??
    String(extractValue(escrowData, "trustline"));

  const receiverMemoRaw = extractValue(escrowData, "receiver_memo");
  const receiverMemo =
    typeof receiverMemoRaw === "string" &&
    receiverMemoRaw !== "N/A" &&
    receiverMemoRaw !== "0"
      ? receiverMemoRaw
      : undefined;

  const fundedAmount = formatFundedAmountValue(fundedAmountRaw, decimals);

  const properties: Record<string, string> = {
    escrow_id: contractId,
    amount: displayAmount,
    balance: displayBalance,
    platform_fee: String(extractValue(escrowData, "platform_fee")),
    engagement_id: String(extractValue(escrowData, "engagement_id")),
    trustline: trustlineFallback,
  };
  if (receiverMemo) properties.receiver_memo = receiverMemo;
  if (fundedAmount) properties.funded_amount = fundedAmount;

  return {
    title: String(extractValue(escrowData, "title")),
    description: String(extractValue(escrowData, "description")),
    properties,
    trustline,
    roles,
    flags,
    milestones,
    progress,
    escrowType,
    version,
  };
};
