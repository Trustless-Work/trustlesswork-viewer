"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  DiscordLogo,
  GithubLogo,
  InstagramLogo,
  TelegramLogo,
  XLogo,
  type Icon,
} from "@phosphor-icons/react";
import { FullWidthDivider } from "./FullWidthDivider";

type SocialLink = {
  label: string;
  href: string;
  Icon: Icon;
};

type FooterProps = {
  containedDividers?: boolean;
};

export const Footer = ({ containedDividers = false }: FooterProps) => {
  return (
    <div className="relative w-full overflow-x-clip mt-20">
      <FullWidthDivider contained position="top" />

      <footer className="relative mx-auto w-full max-w-5xl px-20 lg:border-x">
        <div className="grid max-w-5xl grid-cols-6 gap-6 p-4">
          <div className="col-span-6 flex flex-col gap-4 pt-5 md:col-span-4">
            <Link className="w-max" href="#">
              <Image
                src="/icon.png"
                alt="Trustless Work"
                width={50}
                height={50}
              />
            </Link>

            <p className="max-w-sm text-balance text-sm text-muted-foreground">
              Escrow infrastructure for stablecoin payments
            </p>

            <div className="flex gap-2">
              {socialLinks.map(({ href, Icon, label }) => (
                <Button
                  asChild
                  key={label}
                  size="icon"
                  variant="outline"
                  className="text-foreground hover:text-foreground"
                >
                  <Link
                    aria-label={label}
                    href={href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Icon
                      weight="duotone"
                      size={18}
                      color="currentColor"
                      className="size-[18px] shrink-0 text-foreground [&_path]:fill-current"
                      aria-hidden
                    />
                  </Link>
                </Button>
              ))}
            </div>
          </div>
          <div className="col-span-3 w-full md:col-span-1">
            <span className="text-xs text-muted-foreground">Resources</span>
            <div className="mt-2 flex flex-col gap-2">
              {resources.map(({ href, title }) => (
                <Link
                  className="w-max text-sm hover:underline"
                  href={href}
                  key={title}
                >
                  {title}
                </Link>
              ))}
            </div>
          </div>
          <div className="col-span-3 w-full md:col-span-1">
            <span className="text-xs text-muted-foreground">Company</span>
            <div className="mt-2 flex flex-col gap-2">
              {company.map(({ href, title }) => (
                <Link
                  className="w-max text-sm hover:underline"
                  href={href}
                  key={title}
                >
                  {title}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <FullWidthDivider contained={containedDividers} />

        <div className="flex items-center justify-center gap-2 py-4">
          <p className="text-center text-sm font-light text-muted-foreground">
            &copy; {new Date().getFullYear()}, All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

const company = [
  {
    title: "BackOffice",
    href: "https://backoffice.trustlesswork.com",
  },
  {
    title: "Escrow Blocks",
    href: "https://blocks.trustlesswork.com",
  },
];

const resources = [
  {
    title: "Website",
    href: "https://trustless.work",
  },
  {
    title: "Documentation",
    href: "https://docs.trustless.work",
  },
];

const socialLinks: SocialLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/Trustless-Work",
    Icon: GithubLogo,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/trustlesswork/",
    Icon: InstagramLogo,
  },
  {
    label: "Telegram",
    href: "https://t.me/+kmr8tGegxLU0NTA5",
    Icon: TelegramLogo,
  },
  {
    label: "X",
    href: "https://x.com/TrustlessWork",
    Icon: XLogo,
  },
  {
    label: "Discord",
    href: "https://discord.gg/BAU5s2kVp2",
    Icon: DiscordLogo,
  },
];
