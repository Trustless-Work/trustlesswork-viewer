"use client";

import Image from "next/image";
import React from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NetworkToggle } from "@/components/shared/network-toggle";
import { cn } from "@/lib/utils";

interface NavbarSimpleProps {
  showLogo?: boolean;
}

export function NavbarSimple({ showLogo = true }: NavbarSimpleProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div
        className={cn(
          "flex h-14 items-center gap-4 px-3 md:h-16 md:px-8",
          showLogo ? "justify-between" : "justify-end",
        )}
      >
        {showLogo ? (
          <Image
            src="/logo.png"
            alt="Trustless Work logo"
            width={50}
            height={50}
            priority
          />
        ) : null}

        <div className="flex items-center gap-3">
          <NetworkToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
