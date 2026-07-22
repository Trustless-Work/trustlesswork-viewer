import { Badge } from "@/components/ui/badge";
import { AssetAmountValue } from "@/components/shared/UsdcAmount";

export function LedgerBalancePanel({
  balance,
  symbol,
  decimals,
  mismatch,
}: {
  balance: string;
  symbol?: string | null;
  decimals?: number | null;
  mismatch?: boolean;
}) {
  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">
            Ledger balance (from token contract)
          </span>
          <div className="text-lg font-semibold tracking-tight">
            <AssetAmountValue value={balance} symbol={symbol} size="lg" />
            {typeof decimals === "number" ? (
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                (d={decimals})
              </span>
            ) : null}
          </div>
        </div>

        {mismatch && (
          <Badge variant="outline">
            Mismatch — stored contract balance differs
          </Badge>
        )}
      </div>
    </section>
  );
}
