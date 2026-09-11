import {
  ShieldCheck,
  Wrench,
  Signature,
  Scales,
  HardDrives,
  User,
  Wallet,
  Eye,
  IdentificationCard,
  Crown,
  type Icon,
} from "@phosphor-icons/react";

/** Role icons — Phosphor duotone. Client-only (icons use React context). */
export const ROLE_ICONS: Record<string, { icon: Icon; color: string }> = {
  Approver: { icon: ShieldCheck, color: "text-foreground" },
  "Milestone Approver": { icon: ShieldCheck, color: "text-foreground" },
  "Service Provider": { icon: Wrench, color: "text-foreground" },
  "Release Signer": { icon: Signature, color: "text-foreground" },
  "Dispute Resolver": { icon: Scales, color: "text-foreground" },
  "Platform Address": { icon: HardDrives, color: "text-foreground" },
  Receiver: { icon: User, color: "text-foreground" },
  Issuer: { icon: IdentificationCard, color: "text-foreground" },
  Depositor: { icon: Wallet, color: "text-foreground" },
  Observer: { icon: Eye, color: "text-foreground" },
  Admin: { icon: Crown, color: "text-foreground" },
};
