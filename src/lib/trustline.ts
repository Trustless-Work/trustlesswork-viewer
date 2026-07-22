import { Networks } from "@stellar/stellar-sdk";
import type { EscrowMap, EscrowValue } from "@/utils/ledgerkeycontract";
import { isStellarAddress } from "@/lib/format-address";
import { getNetworkConfig, type NetworkType } from "@/lib/network-config";
import { sacContractIdFromAsset } from "@/lib/token-service";

export interface TrustlineInfo {
  /** SAC / token contract (C…) when known */
  contractId: string | null;
  /** Classic asset issuer (G…) when known */
  issuer: string | null;
  /** Asset code e.g. USDC */
  assetCode: string | null;
}

type AddrLike = { address: string };
type StrLike = { string: string };
type MapEntry = { key: { symbol: string }; val: EscrowValue };

function isAddrLike(v: unknown): v is AddrLike {
  return (
    !!v &&
    typeof v === "object" &&
    typeof (v as AddrLike).address === "string"
  );
}

function isStrLike(v: unknown): v is StrLike {
  return (
    !!v && typeof v === "object" && typeof (v as StrLike).string === "string"
  );
}

function readField(tl: MapEntry[], key: string): EscrowValue | undefined {
  return tl.find((m) => m.key.symbol === key)?.val;
}

function asAddress(val: EscrowValue | undefined): string | undefined {
  if (isAddrLike(val)) return val.address;
  if (isStrLike(val) && isStellarAddress(val.string)) return val.string;
  return undefined;
}

function asString(val: EscrowValue | undefined): string | undefined {
  if (isStrLike(val)) {
    const s = val.string.trim();
    return s || undefined;
  }
  return undefined;
}

function isContractId(addr: string): boolean {
  return addr.startsWith("C") && isStellarAddress(addr);
}

function isIssuerId(addr: string): boolean {
  return addr.startsWith("G") && isStellarAddress(addr);
}

/**
 * Parse SAC `name()` values like `USDC:GABC…` into code + issuer.
 * Native XLM often returns `native` with no issuer.
 */
export function parseAssetName(name: string): {
  code: string | null;
  issuer: string | null;
} {
  const trimmed = name.trim();
  if (!trimmed || trimmed.toLowerCase() === "native") {
    return { code: trimmed ? "XLM" : null, issuer: null };
  }

  const idx = trimmed.indexOf(":");
  if (idx <= 0) return { code: trimmed, issuer: null };

  const code = trimmed.slice(0, idx).trim();
  const issuer = trimmed.slice(idx + 1).trim();
  if (code && isIssuerId(issuer)) return { code, issuer };
  return { code: trimmed, issuer: null };
}

/** Pull trustline fields from the on-chain escrow map (no RPC). */
export function extractTrustlineInfo(
  data: EscrowMap | null,
  network: NetworkType,
): TrustlineInfo {
  const empty: TrustlineInfo = {
    contractId: null,
    issuer: null,
    assetCode: null,
  };
  if (!data) return empty;

  const tl = data.find((e) => e.key.symbol === "trustline")?.val?.map;
  if (!tl) return empty;

  const assetCode =
    asString(readField(tl, "code")) ??
    asString(readField(tl, "symbol")) ??
    null;

  let issuer = asAddress(readField(tl, "issuer")) ?? null;
  let contractId =
    asAddress(readField(tl, "contract_id")) ??
    asString(readField(tl, "contract_id")) ??
    null;

  const address = asAddress(readField(tl, "address"));
  if (address) {
    if (isContractId(address) && !contractId) contractId = address;
    if (isIssuerId(address) && !issuer) issuer = address;
  }

  // Prefer typed C… / G… classification when fields were ambiguous strings
  if (contractId && isIssuerId(contractId) && !issuer) {
    issuer = contractId;
    contractId = null;
  }
  if (issuer && isContractId(issuer) && !contractId) {
    contractId = issuer;
    issuer = null;
  }

  // Derive SAC when we have classic asset parts but no C…
  if (!contractId && assetCode && issuer) {
    const passphrase =
      getNetworkConfig(network).networkPassphrase ??
      (network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET);
    try {
      contractId = sacContractIdFromAsset(assetCode, issuer, passphrase);
    } catch {
      // leave null — UI will fall back
    }
  }

  return {
    contractId,
    issuer,
    assetCode,
  };
}

/** True when we only have a single opaque id — show the compact fallback row. */
export function isTrustlineFallbackOnly(info: TrustlineInfo): boolean {
  const hasAsset = !!info.assetCode;
  const hasIssuer = !!info.issuer;
  const hasContract = !!info.contractId;
  return hasContract && !hasAsset && !hasIssuer;
}

export function mergeTrustlineInfo(
  base: TrustlineInfo,
  patch: Partial<TrustlineInfo>,
): TrustlineInfo {
  return {
    contractId: patch.contractId ?? base.contractId,
    issuer: patch.issuer ?? base.issuer,
    assetCode: patch.assetCode ?? base.assetCode,
  };
}
