"use client";

import {
  CheckCircle,
  Info,
  SpinnerGap,
  Warning,
  WarningCircle,
} from "@phosphor-icons/react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Always uses Sonner's dark theme variants so success/error/info stay
 * deep-toned and readable on both light and dark app surfaces.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      richColors
      closeButton
      className="toaster group"
      icons={{
        success: <CheckCircle className="size-4" weight="duotone" />,
        info: <Info className="size-4" weight="duotone" />,
        warning: <Warning className="size-4" weight="duotone" />,
        error: <WarningCircle className="size-4" weight="duotone" />,
        loading: <SpinnerGap className="size-4 animate-spin" weight="duotone" />,
      }}
      style={
        {
          "--normal-bg": "oklch(0.22 0.01 260)",
          "--normal-text": "oklch(0.96 0.01 260)",
          "--normal-border": "oklch(0.32 0.02 260)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast shadow-lg",
          title: "font-medium",
          description: "text-sm opacity-90",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
