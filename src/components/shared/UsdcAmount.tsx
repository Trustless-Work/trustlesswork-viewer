import Image from "next/image";
import type { ReactNode } from "react";
import { TruncatedText } from "@/components/shared/truncated-text";
import { formatAssetAmount, isUsdcSymbol } from "@/lib/format-address";
import { cn } from "@/lib/utils";

type UsdcAmountSize = "sm" | "md" | "lg" | "xl" | "2xl";

type UsdcAmountProps = {
  amount: number;
  symbol: string;
  className?: string;
  iconClassName?: string;
  size?: UsdcAmountSize;
  emphasis?: boolean;
};

const iconSizes: Record<UsdcAmountSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  "2xl": 32,
};

function getAmountTextSizeClass(size: UsdcAmountSize): string {
  switch (size) {
    case "sm":
      return "text-sm";
    case "md":
      return "text-base";
    case "lg":
      return "text-lg";
    case "xl":
      return "text-xl";
    case "2xl":
      return "text-2xl";
  }
}

export const UsdcAmount = ({
  amount,
  symbol,
  className,
  iconClassName,
  size = "md",
  emphasis = false,
}: UsdcAmountProps) => {
  const isUsdc = isUsdcSymbol(symbol);
  const iconSize = iconSizes[size];
  const formattedAmount = formatAssetAmount(amount);

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-2 tabular-nums",
        className,
      )}
    >
      {isUsdc ? (
        <Image
          src="/usdc.webp"
          alt="USDC"
          width={iconSize}
          height={iconSize}
          className={cn("shrink-0 rounded-full", iconClassName)}
        />
      ) : null}
      <span
        className={cn(
          "truncate font-medium",
          getAmountTextSizeClass(size),
          emphasis && "font-semibold",
        )}
      >
        {isUsdc ? formattedAmount : `${formattedAmount} ${symbol}`}
      </span>
    </span>
  );
};

type UsdcAmountStatProps = {
  label: string;
  amount: number;
  symbol: string;
  emphasis?: boolean;
  size?: UsdcAmountSize;
};

export const UsdcAmountStat = ({
  label,
  amount,
  symbol,
  emphasis = false,
  size,
}: UsdcAmountStatProps) => {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 min-w-0">
        <UsdcAmount
          amount={amount}
          symbol={symbol}
          size={size ?? (emphasis ? "lg" : "md")}
          emphasis={emphasis}
        />
      </dd>
    </div>
  );
};

type OverviewStatProps = {
  label: string;
  value: ReactNode;
  mono?: boolean;
};

export const OverviewStat = ({ label, value, mono }: OverviewStatProps) => {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 min-w-0">
        {typeof value === "string" ? (
          <TruncatedText
            as="span"
            className={cn(
              "block text-base font-medium",
              mono && "font-mono text-sm",
            )}
          >
            {value}
          </TruncatedText>
        ) : (
          <div
            className={cn(
              "truncate text-base font-medium",
              mono && "font-mono text-sm",
            )}
          >
            {value}
          </div>
        )}
      </dd>
    </div>
  );
};

type AssetAmountValueProps = {
  /** Numeric string from escrow properties (e.g. `"12.50"`). */
  value: string;
  /** Asset code from trustline (e.g. `"USDC"`). */
  symbol: string | null | undefined;
  size?: UsdcAmountSize;
};

/**
 * Renders {@link UsdcAmount} (with icon) only when the asset is USDC.
 * Otherwise returns the plain amount string unchanged.
 */
export function AssetAmountValue({
  value,
  symbol,
  size = "sm",
}: AssetAmountValueProps) {
  const amount = Number(value);
  if (symbol && isUsdcSymbol(symbol) && Number.isFinite(amount)) {
    return <UsdcAmount amount={amount} symbol={symbol} size={size} />;
  }
  return <>{value}</>;
}

type MoneyStatProps = {
  label: string;
  value: string;
  symbol: string | null | undefined;
  size?: UsdcAmountSize;
  emphasis?: boolean;
};

/** Amount / balance overview row — USDC gets icon via {@link UsdcAmountStat}. */
export function MoneyStat({
  label,
  value,
  symbol,
  size = "lg",
  emphasis = true,
}: MoneyStatProps) {
  const amount = Number(value);
  if (symbol && isUsdcSymbol(symbol) && Number.isFinite(amount)) {
    return (
      <UsdcAmountStat
        label={label}
        amount={amount}
        symbol={symbol}
        emphasis={emphasis}
        size={size}
      />
    );
  }

  return (
    <OverviewStat
      label={label}
      value={<AssetAmountValue value={value} symbol={symbol} size={size} />}
    />
  );
}
