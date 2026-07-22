/**
 * Formats Stellar addresses / contract IDs / hashes so both ends stay visible.
 *
 * Example: formatAddress("CABC…XYZ", 6) → "CABCDE…WXYZAB"
 */

export const ADDRESS_CHARS = {
  /** Compact (mobile lists, narrow chips) */
  sm: 4,
  /** Default density */
  md: 6,
  /** Desktop detail rows / role cards */
  lg: 8,
  /** Wide panels */
  xl: 12,
} as const;

export type AddressCharSize = keyof typeof ADDRESS_CHARS;

export interface FormatAddressOptions {
  /** Characters kept at the start. Defaults to `chars`. */
  start?: number;
  /** Characters kept at the end. Defaults to `chars`. */
  end?: number;
}

function normalize(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "N/A") return null;
  return trimmed;
}

/**
 * True for typical Stellar account (`G…`) or contract (`C…`) IDs (56 chars).
 */
export function isStellarAddress(value: string | null | undefined): boolean {
  const v = normalize(value);
  if (!v) return false;
  return /^[GC][A-Z0-9]{55}$/.test(v);
}

/**
 * Formats an address as `start…end`.
 *
 * @param value - Full address or hash
 * @param chars - Characters to keep on **each** side (default {@link ADDRESS_CHARS.md})
 * @param options - Optional asymmetric start/end overrides
 */
export function formatAddress(
  value: string | null | undefined,
  chars: number = ADDRESS_CHARS.md,
  options?: FormatAddressOptions,
): string {
  const address = normalize(value);
  if (!address) return "N/A";

  const start = Math.max(0, options?.start ?? chars);
  const end = Math.max(0, options?.end ?? chars);

  if (start === 0 && end === 0) return address;
  if (address.length <= start + end + 1) return address;

  return `${address.slice(0, start)}…${address.slice(address.length - end)}`;
}

/**
 * Convenience: format using a named size preset.
 */
export function formatAddressBySize(
  value: string | null | undefined,
  size: AddressCharSize = "md",
): string {
  return formatAddress(value, ADDRESS_CHARS[size]);
}

export function formatAssetAmount(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function isUsdcSymbol(symbol: string): boolean {
  return symbol.trim().toUpperCase() === "USDC";
}
