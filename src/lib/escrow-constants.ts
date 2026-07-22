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
  type Icon,
} from "@phosphor-icons/react";
import {
  formatAddress,
  ADDRESS_CHARS,
} from "@/lib/format-address";

//? Mapping contract / API role keys to display names (docs: Roles in Trustless Work)
export const ROLE_MAPPING: { [key: string]: string } = {
  Approver: "Approver",
  "Milestone Approver": "Approver",
  approver: "Approver",
  "Service Provider": "Service Provider",
  service_provider: "Service Provider",
  serviceProvider: "Service Provider",
  "Release Signer": "Release Signer",
  release_signer: "Release Signer",
  releaseSigner: "Release Signer",
  "Dispute Resolver": "Dispute Resolver",
  dispute_resolver: "Dispute Resolver",
  disputeResolver: "Dispute Resolver",
  "Platform Address": "Platform Address",
  Platform: "Platform Address",
  platform: "Platform Address",
  platform_address: "Platform Address",
  platformAddress: "Platform Address",
  Receiver: "Receiver",
  receiver: "Receiver",
  Issuer: "Issuer",
  issuer: "Issuer",
  Depositor: "Depositor",
  depositor: "Depositor",
  funder: "Depositor",
  Funder: "Depositor",
  Observer: "Observer",
  observer: "Observer",
};

/** Resolve a contract/API role key to its Title Case display name. */
export const getRoleDisplayName = (key: string): string => {
  if (ROLE_MAPPING[key]) return ROLE_MAPPING[key];
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Role capability copy aligned with Trustless Work docs.
 * Status ≠ approval ≠ release — keep those actions distinct.
 */
export const ROLE_PERMISSIONS: { [key: string]: string } = {
  Approver:
    "Validates milestone completion by signing approval. Can raise a dispute if work is not satisfactory. Approvals are irreversible.",
  "Service Provider":
    "Delivers the work. Updates milestone status, can add evidence, and can raise a dispute. Cannot approve milestones or release funds.",
  "Release Signer":
    "Executes fund release once required approvals are in place — all milestones (single-release) or each approved milestone (multi-release). Can raise a dispute at the release stage.",
  "Dispute Resolver":
    "Arbitrates conflicts and redirects funds when a dispute is raised. Decisions are final and on-chain.",
  "Platform Address":
    "Collects platform fees automatically and can update escrow details before funding. Does not receive the payout — that goes to the Receiver.",
  Receiver:
    "Final destination of released funds. In multi-release escrows, each milestone can define its own receiver (may differ from the Service Provider).",
  Issuer:
    "Indexed address with no powers over the escrow — cannot update milestones, approve, release, or resolve disputes.",
  Depositor:
    "Any address that deposits funds into the escrow. Funding alone does not grant approval, release, or dispute-resolution rights.",
  Observer:
    "Read-only address for tracking the escrow. No on-chain actions (coming soon).",
};

//? Field tooltips
export const FIELD_TOOLTIPS: { [key: string]: string } = {
  escrow_id: "Unique contract address where funds are held.",
  balance: "Current amount of funds held in escrow.",
  amount: "Expected total amount to be held in escrow.",
  platform_fee:
    "Fee percentage collected by the Platform Address when funds are released.",
  engagement_id: "External reference ID (e.g., invoice, order, project ID).",
  dispute_flag:
    "True when a Service Provider, Approver, or Release Signer has raised a dispute.",
  release_flag: "True when the Release Signer has released funds.",
  resolved_flag:
    "True when the Dispute Resolver has settled a dispute and redirected funds.",
  milestone_title: "Name of the milestone.",
  milestone_description: "Details of the milestone's deliverable.",
  milestone_status:
    "Free-form progress text set by the Service Provider (e.g. Pending, In Progress, Delivered). Not the same as approval.",
  milestone_approved:
    "True when the Approver has signed off on completion. Irreversible — there is no un-approve on-chain.",
  milestone_receiver:
    "Address that receives this milestone's payout (multi-release). May differ from the Service Provider.",
  milestone_signer:
    "Release Signer for this milestone — authorized to release funds once it is approved.",
  milestone_approver:
    "Approver for this milestone — validates completion before funds can be released.",
  title: "Title of the escrow contract.",
  description: "Description of the escrow purpose.",
  trustline: "Stellar asset that is used for the escrow.",
  asset: "Asset code of the token held in escrow (e.g. USDC, EURC).",
  issuer: "Stellar account that issued the asset (G… address).",
  asset_contract:
    "Soroban Stellar Asset Contract (SAC) address for this token (C…).",
  transaction_history:
    "Recent transaction history fetched from Soroban RPC. Note: RPC typically retains 24h-7 days of history.",
  transaction_retention:
    "RPC history retention limits (~24h default, up to 7 days). For older data, recommend full indexers (e.g. Hubble/BigQuery).",
};

//? Role icons — Phosphor duotone, shared foreground color
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
};

//? Address formatting — prefer formatAddress / ADDRESS_CHARS from @/lib/format-address
export {
  formatAddress,
  formatAddressBySize,
  isStellarAddress,
  ADDRESS_CHARS,
} from "@/lib/format-address";
export type { AddressCharSize, FormatAddressOptions } from "@/lib/format-address";

/** @deprecated Prefer `formatAddress(address, chars)`. Kept for call-site compatibility. */
export const truncateAddress = (
  address: string,
  isMobileOrChars: boolean | number = 6,
): string => {
  if (typeof isMobileOrChars === "number") {
    return formatAddress(address, isMobileOrChars);
  }
  return formatAddress(
    address,
    isMobileOrChars ? ADDRESS_CHARS.sm : ADDRESS_CHARS.lg,
  );
};


/** Minimal milestone shape for progress — multi-release carries per-milestone flags. */
export interface ProgressMilestone {
  approved: boolean;
  release_flag?: boolean;
  resolved_flag?: boolean;
}

/** Escrow-level flags used as fallback for single-release (flags live on the escrow). */
export interface ProgressEscrowFlags {
  released?: boolean;
  resolved?: boolean;
}

/**
 * Progress = share of milestones that are finished.
 * Finished = approved AND (released OR resolved).
 * Multi-release: release/resolved come from the milestone.
 * Single-release: release/resolved come from escrow-level flags.
 */
export const calculateProgress = (
  milestones: ProgressMilestone[],
  escrowFlags?: ProgressEscrowFlags,
): number => {
  if (!milestones.length) return 0;

  const completed = milestones.filter((m) => {
    const released = m.release_flag ?? escrowFlags?.released ?? false;
    const resolved = m.resolved_flag ?? escrowFlags?.resolved ?? false;
    return m.approved && (released || resolved);
  }).length;

  return (completed / milestones.length) * 100;
};

//? Example contract IDs for UI placeholders
export const EXAMPLE_CONTRACT_IDS = {
  testnet: "CCMCEI4UQSO47VAUDWUTWFSUWMRNLN7DS6ZL7BJLYJCYCWFEVPQCA4LO",
  mainnet: "CANVLF5SPV7LF6YOA2PFFPJQAFEUXEEE7SLKXRHUAMAN65EXFHBDLARP",
};

export const EXAMPLE_CONTRACT_ID = EXAMPLE_CONTRACT_IDS.testnet;
