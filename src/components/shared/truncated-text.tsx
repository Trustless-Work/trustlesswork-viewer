"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ElementType,
} from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const LINE_CLAMP_CLASS: Record<number, string> = {
  1: "truncate",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
};

type TruncatedTextProps = {
  children: string;
  /** Element to render. Default `span`. */
  as?: ElementType;
  className?: string;
  /**
   * Max visible lines. `1` uses single-line `truncate`;
   * `2`–`5` use `line-clamp-*`. Default `1`.
   */
  lines?: 1 | 2 | 3 | 4 | 5;
  tooltipClassName?: string;
  /** Tooltip body. Defaults to `children`. Use for abbreviated values (addresses). */
  tooltipText?: string;
  /** Show tooltip even when content fits (e.g. start…end address previews). */
  alwaysShowTooltip?: boolean;
};

/**
 * Truncates text to fit its container. When content overflows, a tooltip
 * shows the full string on hover / focus. No tooltip when text fits
 * (unless `alwaysShowTooltip` is set).
 */
export function TruncatedText({
  children,
  as: Comp = "span",
  className,
  lines = 1,
  tooltipClassName,
  tooltipText,
  alwaysShowTooltip = false,
}: TruncatedTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [open, setOpen] = useState(false);

  const checkOverflow = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // +1px tolerance avoids false positives from subpixel rounding
    const overflow =
      el.scrollWidth > el.clientWidth + 1 ||
      el.scrollHeight > el.clientHeight + 1;
    setTruncated(overflow);
  }, []);

  useEffect(() => {
    checkOverflow();
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      checkOverflow();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [checkOverflow, children, lines]);

  const showTooltip = alwaysShowTooltip || truncated;
  const tooltipBody = tooltipText ?? children;

  return (
    <Tooltip
      open={showTooltip ? open : false}
      onOpenChange={(next) => {
        if (showTooltip) setOpen(next);
      }}
    >
      <TooltipTrigger asChild>
        <Comp
          ref={ref}
          tabIndex={showTooltip ? 0 : undefined}
          className={cn(
            "min-w-0 max-w-full wrap-anywhere",
            LINE_CLAMP_CLASS[lines] ?? LINE_CLAMP_CLASS[1],
            showTooltip && "cursor-help",
            className,
          )}
        >
          {children}
        </Comp>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className={cn(
          "max-w-xs break-words text-left sm:max-w-sm",
          tooltipClassName,
        )}
      >
        <p className="whitespace-pre-wrap break-words text-xs">{tooltipBody}</p>
      </TooltipContent>
    </Tooltip>
  );
}
