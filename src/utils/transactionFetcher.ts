/* eslint-disable @typescript-eslint/no-explicit-any */
import { Contract } from "@stellar/stellar-sdk";
import { ADDRESS_CHARS, formatAddress } from "@/lib/format-address";
import { getNetworkConfig, type NetworkType } from "@/lib/network-config";

// Types for transaction data
export interface TransactionMetadata {
  txHash: string;
  ledger: number;
  createdAt: string;
  status: "SUCCESS" | "FAILED" | "NOT_FOUND";
  applicationOrder?: number;
}

export interface TransactionDetails {
  txHash: string;
  ledger: number;
  createdAt: string;
  status: string;
  signers: string[];
  calledFunction?: string;
  args?: any[];
  result?: any;
  envelope?: any;
  meta?: any;
}

export interface FetchTransactionsOptions {
  startLedger?: number;
  cursor?: string;
  limit?: number;
  network?: NetworkType;
}

export interface TransactionResponse {
  transactions: TransactionMetadata[];
  latestLedger: number;
  oldestLedger: number;
  cursor?: string;
  hasMore: boolean;
  retentionNotice?: string;
}

function resolveRpcUrl(network: NetworkType = "testnet"): string {
  return (
    process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ||
    getNetworkConfig(network).rpcUrl
  );
}

/**
 * Fetches recent transactions for a contract using Soroban JSON-RPC
 * Gracefully handles retention-related errors
 */
export async function fetchTransactions(
  contractId: string,
  options: FetchTransactionsOptions = {},
): Promise<TransactionResponse> {
  try {
    const { startLedger, cursor, limit = 50, network = "testnet" } = options;
    const rpcUrl = resolveRpcUrl(network);

    const contract = new Contract(contractId);
    const contractAddress = contract.contractId();

    const requestBody = {
      jsonrpc: "2.0",
      id: 1,
      method: "getTransactions",
      params: {
        startLedger,
        cursor,
        limit,
        filters: [
          {
            type: "contract",
            contractIds: [contractAddress],
          },
        ],
      },
    };

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      if (
        data.error.code === -32600 ||
        data.error.message?.includes("retention")
      ) {
        return {
          transactions: [],
          latestLedger: 0,
          oldestLedger: 0,
          hasMore: false,
          retentionNotice:
            "Transaction data beyond retention period. RPC typically retains 24h-7 days of history.",
        };
      }
      throw new Error(data.error.message || "Failed to fetch transactions");
    }

    const result = data.result;
    const transactions: TransactionMetadata[] = (result.transactions || []).map(
      (tx: any) => ({
        txHash: tx.id,
        ledger: tx.ledger,
        createdAt: tx.createdAt,
        status: tx.status,
        applicationOrder: tx.applicationOrder,
      }),
    );

    return {
      transactions,
      latestLedger: result.latestLedger || 0,
      oldestLedger: result.oldestLedger || 0,
      cursor: result.cursor,
      hasMore: !!result.cursor,
      retentionNotice:
        transactions.length === 0
          ? "No recent transactions found. Note: RPC typically retains 24h-7 days of history."
          : undefined,
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);

    return {
      transactions: [],
      latestLedger: 0,
      oldestLedger: 0,
      hasMore: false,
      retentionNotice:
        "Unable to fetch transaction history. This may be due to retention limits or network issues.",
    };
  }
}

/**
 * Fetches detailed information for a specific transaction
 * Returns full details with XDR decoded as JSON
 */
export async function fetchTransactionDetails(
  txHash: string,
  network: NetworkType = "testnet",
): Promise<TransactionDetails | null> {
  try {
    const rpcUrl = resolveRpcUrl(network);
    const requestBody = {
      jsonrpc: "2.0",
      id: 2,
      method: "getTransaction",
      params: {
        hash: txHash,
      },
    };

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      console.error("Error fetching transaction details:", data.error);
      return null;
    }

    const tx = data.result;
    if (!tx) return null;

    const signers: string[] = [];
    if (tx.envelopeXdr && tx.envelope?.signatures) {
      signers.push("(Signature validation required)");
    }

    let calledFunction: string | undefined;
    let args: any[] | undefined;
    let result: any | undefined;

    if (tx.resultMetaXdr && tx.meta) {
      try {
        const operations = tx.envelope?.v1?.tx?.operations || [];
        const invokeOp = operations.find(
          (op: any) => op.body?.invokeHostFunction,
        );

        if (invokeOp) {
          const hostFunction = invokeOp.body.invokeHostFunction.hostFunction;
          if (hostFunction?.invokeContract) {
            calledFunction =
              hostFunction.invokeContract.functionName || "invoke_contract";
            args = hostFunction.invokeContract.args || [];
          }
        }

        if (tx.meta.v3?.sorobanMeta?.returnValue) {
          result = tx.meta.v3.sorobanMeta.returnValue;
        }
      } catch (parseError) {
        console.warn("Could not parse transaction details:", parseError);
      }
    }

    return {
      txHash: tx.id,
      ledger: tx.ledger,
      createdAt: tx.createdAt,
      status: tx.status,
      signers,
      calledFunction,
      args,
      result,
      envelope: tx.envelope,
      meta: tx.meta,
    };
  } catch (error) {
    console.error("Error fetching transaction details:", error);
    return null;
  }
}

/**
 * Helper function to format transaction timestamp
 */
export function formatTransactionTime(createdAt: string): string {
  try {
    const date = new Date(createdAt);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  } catch (error) {
    console.warn("Failed to format transaction time:", error);
    return "Invalid date";
  }
}

/**
 * Helper function to truncate transaction hash for display
 */
export function truncateHash(hash: string, isMobile: boolean = false): string {
  return formatAddress(hash, isMobile ? ADDRESS_CHARS.sm : ADDRESS_CHARS.md);
}
