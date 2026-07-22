"use client";

import { IconContext } from "@phosphor-icons/react";
import type { ReactNode } from "react";

/**
 * App-wide icon defaults: Phosphor duotone + shared currentColor.
 * Individual icons can still override size via `size` or `className`.
 */
export function IconProvider({ children }: { children: ReactNode }) {
  return (
    <IconContext.Provider
      value={{
        weight: "duotone",
        color: "currentColor",
        mirrored: false,
      }}
    >
      <div className="contents text-foreground">{children}</div>
    </IconContext.Provider>
  );
}
