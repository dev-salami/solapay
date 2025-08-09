/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ParsedTransactionData {
  walletAddress: string;
  transactionReference: string;
  memo: string | null;
  transferAmount: number; // The amount transferred in UI units
  tokenMint: string | null; // The token mint address
  success: boolean;
}

export interface MemoData {
  trackingId?: string;
  amount?: number;
  currency?: string;
  recipientAccountNumber?: string;
  recipientBankCode?: string;
  description?: string;
  [key: string]: any;
}

/**
 * Parses a Solana transfer transaction to extract key information
 * @param transaction - The Solana transfer transaction from Helius webhook
 * @returns Parsed transaction data including wallet address, memo, transfer amount, and transaction reference
 */
export function parseSolanaTransaction(
  transaction: SolanaTransfer
): ParsedTransactionData {
  try {
    // Extract wallet address (first account key, which is the signer/sender)
    const walletAddress = transaction.transaction.message.accountKeys[0];

    // Extract transaction reference (signature)
    const transactionReference = transaction.transaction.signatures[0];

    // Extract memo from log messages
    const memo = extractMemo(transaction.meta.logMessages);

    // Extract transfer amount and token mint
    const { transferAmount, tokenMint } = extractTransferAmount(
      transaction,
      walletAddress
    );

    // Determine if transaction was successful
    const success = transaction.meta.err === null;

    return {
      walletAddress,
      transactionReference,
      memo,
      transferAmount,
      tokenMint,
      success,
    };
  } catch (error) {
    throw new Error(
      `Failed to parse Solana transaction: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Extracts the transfer amount by comparing pre and post token balances
 * @param transaction - The Solana transfer transaction
 * @param senderAddress - The sender's wallet address
 * @returns Transfer amount in UI units and token mint address
 */
function extractTransferAmount(
  transaction: SolanaTransfer,
  senderAddress: string
): { transferAmount: number; tokenMint: string | null } {
  const preTokenBalances = transaction.meta.preTokenBalances || [];
  const postTokenBalances = transaction.meta.postTokenBalances || [];

  // Find the sender's token account by owner address
  const senderPreBalance = preTokenBalances.find(
    (balance) => balance.owner === senderAddress
  );
  const senderPostBalance = postTokenBalances.find(
    (balance) => balance.owner === senderAddress
  );

  if (senderPreBalance && senderPostBalance) {
    // Calculate the absolute difference (amount sent)
    const transferAmount = Math.abs(
      senderPreBalance.uiTokenAmount.uiAmount -
        senderPostBalance.uiTokenAmount.uiAmount
    );

    return {
      transferAmount: Math.round(transferAmount * 1000000) / 1000000, // Round to 6 decimal places
      tokenMint: senderPreBalance.mint,
    };
  }

  // Fallback: if we can't find sender's balance, look for any balance change
  for (const postBalance of postTokenBalances) {
    const preBalance = preTokenBalances.find(
      (pre) => pre.accountIndex === postBalance.accountIndex
    );

    if (preBalance) {
      const amountDiff = Math.abs(
        postBalance.uiTokenAmount.uiAmount - preBalance.uiTokenAmount.uiAmount
      );

      if (amountDiff > 0) {
        return {
          transferAmount: Math.round(amountDiff * 1000000) / 1000000,
          tokenMint: postBalance.mint,
        };
      }
    }
  }

  return { transferAmount: 0, tokenMint: null };
}

/**
 * Extracts and decodes memo from transaction log messages
 * @param logMessages - Array of log messages from the transaction
 * @returns Decoded memo data or null if no memo found
 */
function extractMemo(logMessages: string[]): ParsedTransactionData["memo"] {
  try {
    // Find the memo log message
    const memoLogMessage = logMessages.find(
      (log) => log.includes("Program log: Memo") && log.includes('"')
    );

    if (!memoLogMessage) {
      return null;
    }

    // Extract the base64 encoded memo using regex
    const memoMatch = memoLogMessage.match(/"([^"]+)"/);
    if (!memoMatch || !memoMatch[1]) {
      return null;
    }

    const base64Memo = memoMatch[1];

    return base64Memo;
  } catch (error) {
    console.error("Error extracting memo:", error);
    return null;
  }
}

/**
 * Utility function to get detailed token transfer information from the transaction
 * @param transaction - The Solana transfer transaction
 * @returns Token transfer information including amount and token addresses
 */
export function getTokenTransferDetails(transaction: SolanaTransfer) {
  const preTokenBalances = transaction.meta.preTokenBalances || [];
  const postTokenBalances = transaction.meta.postTokenBalances || [];

  const transfers = [];

  // Compare pre and post balances to determine transfers
  for (const postBalance of postTokenBalances) {
    const preBalance = preTokenBalances.find(
      (pre) => pre.accountIndex === postBalance.accountIndex
    );

    if (preBalance) {
      const amountDiff =
        parseInt(postBalance.uiTokenAmount.amount) -
        parseInt(preBalance.uiTokenAmount.amount);

      if (amountDiff !== 0) {
        transfers.push({
          accountIndex: postBalance.accountIndex,
          mint: postBalance.mint,
          owner: postBalance.owner,
          amountChange: amountDiff,
          uiAmountChange:
            postBalance.uiTokenAmount.uiAmount -
            preBalance.uiTokenAmount.uiAmount,
          decimals: postBalance.uiTokenAmount.decimals,
          direction: amountDiff > 0 ? "received" : "sent",
        });
      }
    }
  }

  return transfers;
}

/**
 * Helper function to decode a base64 memo to readable text
 * @param base64Memo - The base64 encoded memo
 * @returns Decoded memo string or null if decoding fails
 */
export function decodeMemo(base64Memo: string): string | null {
  try {
    return atob(base64Memo);
  } catch (error) {
    console.error("Error decoding memo:", error);
    return null;
  }
}

/**
 * Helper function to parse decoded memo as JSON
 * @param decodedMemo - The decoded memo string
 * @returns Parsed JSON object or null if parsing fails
 */
export function parseMemoAsJSON(decodedMemo: string): MemoData | null {
  try {
    if (
      decodedMemo.trim().startsWith("{") &&
      decodedMemo.trim().endsWith("}")
    ) {
      return JSON.parse(decodedMemo);
    }
    return null;
  } catch (error) {
    console.error("Error parsing memo as JSON:", error);
    return null;
  }
}
export interface SolanaTransfer {
  blockTime: number;
  indexWithinBlock: number;
  meta: Meta;
  slot: number;
  transaction: Transaction;
  version: string;
}

export interface Transaction {
  message: Message;
  signatures: string[];
}

export interface Message {
  accountKeys: string[];
  addressTableLookups?: any;
  header: Header;
  instructions: Instruction[];
  recentBlockhash: string;
}

export interface Instruction {
  accounts: number[];
  data: string;
  programIdIndex: number;
}

export interface Header {
  numReadonlySignedAccounts: number;
  numReadonlyUnsignedAccounts: number;
  numRequiredSignatures: number;
}

export interface Meta {
  err?: any;
  fee: number;
  innerInstructions: any[];
  loadedAddresses: LoadedAddresses;
  logMessages: string[];
  postBalances: number[];
  postTokenBalances: PostTokenBalance[];
  preBalances: number[];
  preTokenBalances: PostTokenBalance[];
  rewards: any[];
}

export interface PostTokenBalance {
  accountIndex: number;
  mint: string;
  owner: string;
  programId: string;
  uiTokenAmount: UiTokenAmount;
}

export interface UiTokenAmount {
  amount: string;
  decimals: number;
  uiAmount: number;
  uiAmountString: string;
}

export interface LoadedAddresses {
  readonly: any[];
  writable: any[];
}
