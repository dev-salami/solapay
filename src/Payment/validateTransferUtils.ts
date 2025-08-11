/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  decodeInstruction,
  getAssociatedTokenAddress,
  isTransferCheckedInstruction,
  isTransferInstruction,
} from "@solana/spl-token";
import type {
  ConfirmedTransactionMeta,
  Connection,
  Finality,
  Message,
  TransactionInstruction,
  TransactionResponse,
  TransactionSignature,
} from "@solana/web3.js";
import {
  LAMPORTS_PER_SOL,
  SystemInstruction,
  Transaction,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";
import type {
  Amount,
  Memo,
  Recipient,
  Reference,
  References,
  SPLToken,
} from "./types.ts";
import { Instruction, SolanaTransfer } from "./helius-webhook-utils.js";

/**
 * Thrown when a transaction doesn't contain a valid Solana Pay transfer.
 */
export class ValidateTransferError extends Error {
  name = "ValidateTransferError";
}

/**
 * Fields of a Solana Pay transfer request to validate.
 */
export interface ValidateTransferFields {
  /** `recipient` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#recipient). */
  recipient: Recipient;
  /** `amount` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#amount). */
  amount: Amount;
  /** `spl-token` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#spl-token). */
  splToken?: SPLToken;
  /** `reference` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#reference). */
  reference?: References;
  /** `memo` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#memo). */
  memo?: Memo;
}

/**
 * Check that a given transaction contains a valid Solana Pay transfer.
 *
 * @param connection - A connection to the cluster.
 * @param signature - The signature of the transaction to validate.
 * @param fields - Fields of a Solana Pay transfer request to validate.
 * @param options - Options for `getTransaction`.
 *
 * @throws {ValidateTransferError}
 */
export async function validateTransfer(
  connection: Connection,
  signature: TransactionSignature,
  { recipient, amount, splToken, reference, memo }: ValidateTransferFields,
  options?: { commitment?: Finality }
): Promise<TransactionResponse> {
  const response = await connection.getTransaction(signature, options);
  if (!response) throw new ValidateTransferError("not found");

  const { message, signatures } = response.transaction;
  const meta = response.meta;
  if (!meta) throw new ValidateTransferError("missing meta");
  //   if (meta.err) throw meta.err;

  if (reference && !Array.isArray(reference)) {
    reference = [reference];
  }

  console.log(meta);

  // Deserialize the transaction and make a copy of the instructions we're going to validate.
  const transaction = Transaction.populate(message, signatures);
  console.log(transaction);

  const instructions = transaction.instructions.slice();

  // Transfer instruction must be the last instruction
  const instruction = instructions.pop();
  if (!instruction)
    throw new ValidateTransferError("missing transfer instruction");
  const [preAmount, postAmount] = splToken
    ? await validateSPLTokenTransfer(
        instruction,
        message,
        meta,
        recipient,
        splToken,
        reference
      )
    : await validateSystemTransfer(
        instruction,
        message,
        meta,
        recipient,
        reference
      );

  console.log(Number(postAmount), preAmount.toNumber(), amount.toNumber());

  if (postAmount.minus(preAmount).lt(amount))
    throw new ValidateTransferError("amount not transferred");

  if (memo !== undefined) {
    // Memo instruction must be the second to last instruction
    const instruction = instructions.pop();
    if (!instruction)
      throw new ValidateTransferError("missing memo instruction");
    validateMemo(instruction, memo);
  }

  return response;
}

function validateMemo(instruction: TransactionInstruction, memo: string): void {
  // Check that the instruction is a memo instruction with no keys and the expected memo data.
  //   if (!instruction.programId.equals(MEMO_PROGRAM_ID))
  //     throw new ValidateTransferError("invalid memo program");
  if (instruction.keys.length)
    throw new ValidateTransferError("invalid memo keys");
  if (!instruction.data.equals(Buffer.from(memo, "utf8")))
    throw new ValidateTransferError("invalid memo");
}

async function validateSystemTransfer(
  instruction: TransactionInstruction,
  message: Message,
  meta: ConfirmedTransactionMeta,
  recipient: Recipient,
  references?: Reference[]
): Promise<[BigNumber, BigNumber]> {
  const accountIndex = message.accountKeys.findIndex((pubkey) =>
    pubkey.equals(recipient)
  );
  if (accountIndex === -1)
    throw new ValidateTransferError("recipient not found");

  if (references) {
    // Check that the instruction is a system transfer instruction.
    SystemInstruction.decodeTransfer(instruction);

    // Check that the expected reference keys exactly match the extra keys provided to the instruction.
    const [_from, _to, ...extraKeys] = instruction.keys;
    const length = extraKeys.length;
    if (length !== references.length)
      throw new ValidateTransferError("invalid references");

    for (let i = 0; i < length; i++) {
      if (!extraKeys[i].pubkey.equals(references[i]))
        throw new ValidateTransferError(`invalid reference ${i}`);
    }
  }

  return [
    new BigNumber(meta.preBalances[accountIndex] || 0).div(LAMPORTS_PER_SOL),
    new BigNumber(meta.postBalances[accountIndex] || 0).div(LAMPORTS_PER_SOL),
  ];
}

async function validateSPLTokenTransfer(
  instruction: TransactionInstruction,
  message: Message,
  meta: ConfirmedTransactionMeta,
  recipient: Recipient,
  splToken: SPLToken,
  references?: Reference[]
): Promise<[BigNumber, BigNumber]> {
  const recipientATA = await getAssociatedTokenAddress(splToken, recipient);
  const accountIndex = message.accountKeys.findIndex((pubkey) =>
    pubkey.equals(recipientATA)
  );
  if (accountIndex === -1)
    throw new ValidateTransferError("recipient not found");

  if (references) {
    // Check that the first instruction is an SPL token transfer instruction.
    const decodedInstruction = decodeInstruction(instruction);
    if (
      !isTransferCheckedInstruction(decodedInstruction) &&
      !isTransferInstruction(decodedInstruction)
    )
      throw new ValidateTransferError("invalid transfer");

    // Check that the expected reference keys exactly match the extra keys provided to the instruction.
    const extraKeys = decodedInstruction.keys.multiSigners;
    const length = extraKeys.length;
    if (length !== references.length)
      throw new ValidateTransferError("invalid references");

    for (let i = 0; i < length; i++) {
      if (!extraKeys[i].pubkey.equals(references[i]))
        throw new ValidateTransferError(`invalid reference ${i}`);
    }
  }

  const preBalance = meta.preTokenBalances?.find(
    (x) => x.accountIndex === accountIndex
  );
  const postBalance = meta.postTokenBalances?.find(
    (x) => x.accountIndex === accountIndex
  );

  return [
    new BigNumber(preBalance?.uiTokenAmount.uiAmountString || 0),
    new BigNumber(postBalance?.uiTokenAmount.uiAmountString || 0),
  ];
}

/**
 * Extract reference keys from a Solana Pay transaction (Helius webhook format)
 * @param transaction - The transaction from Helius webhook
 * @returns Array of reference account addresses found in the transaction
 */
export function extractReferencesFromTransaction(
  transaction: SolanaTransfer
): string[] {
  if (!transaction.meta) {
    return [];
  }

  const { message } = transaction.transaction;
  const references: string[] = [];

  try {
    // Get all instructions from the transaction
    const instructions = message.instructions;

    // Find the transfer instruction by checking each instruction
    let transferInstruction: Instruction | null = null;

    // Look for the main transfer instruction (usually the last non-memo instruction)
    for (let i = instructions.length - 1; i >= 0; i--) {
      const instruction = instructions[i];
      const programId = message.accountKeys[instruction.programIdIndex];

      // Check if it's a system transfer or SPL token transfer
      if (programId === "11111111111111111111111111111112") {
        // System program transfer
        if (instruction.accounts.length >= 2) {
          transferInstruction = instruction;
          break;
        }
      } else if (programId === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") {
        // SPL Token program transfer
        transferInstruction = instruction;
        break;
      }
    }

    if (!transferInstruction) {
      return references;
    }

    const programId = message.accountKeys[transferInstruction.programIdIndex];

    if (programId === "11111111111111111111111111111112") {
      // System program transfer - references are extra accounts beyond from/to
      const accounts = transferInstruction.accounts;
      if (accounts.length > 2) {
        // First two accounts are from and to, rest are references
        for (let i = 2; i < accounts.length; i++) {
          const accountIndex = accounts[i];
          references.push(message.accountKeys[accountIndex]);
        }
      }
    } else if (programId === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") {
      // SPL Token transfer - references are additional accounts beyond the core transfer accounts
      const accounts = transferInstruction.accounts;

      // For SPL token transfers:
      // TransferChecked: [source, mint, destination, owner/authority, ...references]
      // Transfer: [source, destination, owner/authority, ...references]

      // Determine if it's TransferChecked by looking at instruction data or account count
      // TransferChecked typically has more accounts
      let coreAccountCount = 3; // Default for Transfer instruction

      if (accounts.length > 4) {
        // Likely TransferChecked which has: source, mint, destination, authority, ...references
        coreAccountCount = 4;
      }

      // Extract reference accounts
      for (let i = coreAccountCount; i < accounts.length; i++) {
        const accountIndex = accounts[i];
        references.push(message.accountKeys[accountIndex]);
      }
    }
  } catch (error) {
    console.error("Error extracting references:", error);
  }

  return references;
}

/**
 * Alternative method: Extract references by filtering known program accounts
 * This method identifies reference keys by excluding known system accounts
 */
export function extractReferencesByExclusion(
  transaction: SolanaTransfer
): string[] {
  if (!transaction.meta) {
    return [];
  }

  const { message } = transaction.transaction;
  const knownPrograms = new Set([
    "11111111111111111111111111111112", // System Program
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", // SPL Token Program
    "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr", // Memo Program
    "ComputeBudget111111111111111111111111111111", // Compute Budget Program
  ]);

  const references: string[] = [];
  const accountKeys = message.accountKeys;

  // Collect token account indices
  const tokenAccounts = new Set<number>();
  if (transaction.meta.preTokenBalances) {
    transaction.meta.preTokenBalances.forEach((balance) => {
      tokenAccounts.add(balance.accountIndex);
    });
  }
  if (transaction.meta.postTokenBalances) {
    transaction.meta.postTokenBalances.forEach((balance) => {
      tokenAccounts.add(balance.accountIndex);
    });
  }

  for (let i = 1; i < accountKeys.length; i++) {
    // Skip index 0 (payer/signer)
    const account = accountKeys[i];

    // Skip if it's a known program
    if (knownPrograms.has(account)) {
      continue;
    }

    // Skip if it's a token account
    if (tokenAccounts.has(i)) {
      continue;
    }

    // Skip if it has a balance (likely a wallet/token account)
    const hasBalance =
      transaction.meta.preBalances[i] > 0 ||
      transaction.meta.postBalances[i] > 0;
    if (hasBalance) {
      continue;
    }

    // This is likely a reference account
    references.push(account);
  }

  return references;
}

/**
 * Get references with additional context
 */
export function extractReferencesWithContext(
  transaction: SolanaTransfer
): Array<{
  publicKey: string;
  accountIndex: number;
  method: "instruction_analysis" | "exclusion_analysis";
}> {
  const instructionRefs = extractReferencesFromTransaction(transaction);
  const exclusionRefs = extractReferencesByExclusion(transaction);

  const results: Array<{
    publicKey: string;
    accountIndex: number;
    method: "instruction_analysis" | "exclusion_analysis";
  }> = [];

  const { message } = transaction.transaction;

  // Add instruction analysis results
  instructionRefs.forEach((ref) => {
    const accountIndex = message.accountKeys.findIndex((key) => key === ref);
    results.push({
      publicKey: ref,
      accountIndex,
      method: "instruction_analysis",
    });
  });

  // Add exclusion analysis results that aren't already included
  exclusionRefs.forEach((ref) => {
    if (!instructionRefs.includes(ref)) {
      const accountIndex = message.accountKeys.findIndex((key) => key === ref);
      results.push({
        publicKey: ref,
        accountIndex,
        method: "exclusion_analysis",
      });
    }
  });

  return results;
}

/**
 * Simple helper to check if a transaction contains Solana Pay references
 */
export function hasSolanaPayReferences(transaction: SolanaTransfer): boolean {
  const references = extractReferencesFromTransaction(transaction);
  return references.length > 0;
}

/**
 * Get the first reference (most common use case)
 */
export function getFirstReference(transaction: SolanaTransfer): string | null {
  const references = extractReferencesFromTransaction(transaction);
  return references.length > 0 ? references[0] : null;
}

// Usage example:
/*
// From your Helius webhook
const webhookTransaction: SolanaTransfer = {
  blockTime: 1754766269,
  // ... rest of your transaction data
};

const references = extractReferencesFromTransaction(webhookTransaction);
console.log("Found references:", references);
// Output: ["ATJsRoksBELe9kNfLaee3siRqr9eD4putVKSEmJYKduR"]

const firstRef = getFirstReference(webhookTransaction);
console.log("First reference:", firstRef);
// Output: "ATJsRoksBELe9kNfLaee3siRqr9eD4putVKSEmJYKduR"

const referencesWithContext = extractReferencesWithContext(webhookTransaction);
console.log("References with context:", referencesWithContext);
*/
