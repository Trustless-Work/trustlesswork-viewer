import type * as React from "react";

import { cn } from "@/lib/utils";

function Container({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="container"
      className={cn(
        "w-full rounded-2xl border border-border bg-card/40 p-6 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Container };
