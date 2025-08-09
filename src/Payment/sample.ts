import { SolanaTransfer } from "./helius-webhook-utils";

export const transfer_transaction: SolanaTransfer[] = [
  {
    blockTime: 1754731870,
    indexWithinBlock: 10,
    meta: {
      err: null,
      fee: 80000,
      innerInstructions: [],
      loadedAddresses: { readonly: [], writable: [] },
      logMessages: [
        "Program ComputeBudget111111111111111111111111111111 invoke [1]",
        "Program ComputeBudget111111111111111111111111111111 success",
        "Program ComputeBudget111111111111111111111111111111 invoke [1]",
        "Program ComputeBudget111111111111111111111111111111 success",
        "Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr invoke [1]",
        'Program log: Memo (len 288): "IntcInRyYWNraW5nSWRcIjpcIjRxdXRBeHg5d1pHSHY5UWtudTRUZGZXQVJ2REJLVzRLSHZwckdtODNiQnl4XCIsXCJhbW91bnRcIjo0MDAsXCJjdXJyZW5jeVwiOlwiTkdOXCIsXCJyZWNpcGllbnRBY2NvdW50TnVtYmVyXCI6XCIwNTA0MzI1NzY1XCIsXCJyZWNpcGllbnRCYW5rQ29kZVwiOlwiMDcwMTUwXCIsXCJkZXNjcmlwdGlvblwiOlwiUGF5bWVudCBmb3IgY2l3YXRcIn0i"',
        "Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr consumed 102665 of 136296 compute units",
        "Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr success",
        "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [1]",
        "Program log: Instruction: TransferChecked",
        "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 6462 of 33631 compute units",
        "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
      ],
      postBalances: [
        996600737, 2039280, 2039280, 0, 168551902685, 1, 553498881, 4136087700,
      ],
      postTokenBalances: [
        {
          accountIndex: 1,
          mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
          owner: "H7DNE1wz4FfRxyP5eG9T4NEs4WVmniZ88PEvqAsocSdS",
          programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          uiTokenAmount: {
            amount: "13590000",
            decimals: 6,
            uiAmount: 13.59,
            uiAmountString: "13.59",
          },
        },
        {
          accountIndex: 2,
          mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
          owner: "6BU22Rzfw4PpZMjW2ffRc3Snzn6znVSiBUufhxtWv8N2",
          programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          uiTokenAmount: {
            amount: "14410000",
            decimals: 6,
            uiAmount: 14.41,
            uiAmountString: "14.41",
          },
        },
      ],
      preBalances: [
        996680737, 2039280, 2039280, 0, 168551902685, 1, 553498881, 4136087700,
      ],
      preTokenBalances: [
        {
          accountIndex: 1,
          mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
          owner: "H7DNE1wz4FfRxyP5eG9T4NEs4WVmniZ88PEvqAsocSdS",
          programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          uiTokenAmount: {
            amount: "13330000",
            decimals: 6,
            uiAmount: 13.33,
            uiAmountString: "13.33",
          },
        },
        {
          accountIndex: 2,
          mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
          owner: "6BU22Rzfw4PpZMjW2ffRc3Snzn6znVSiBUufhxtWv8N2",
          programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          uiTokenAmount: {
            amount: "14670000",
            decimals: 6,
            uiAmount: 14.67,
            uiAmountString: "14.67",
          },
        },
      ],
      rewards: [],
    },
    slot: 399973704,
    transaction: {
      message: {
        accountKeys: [
          "6BU22Rzfw4PpZMjW2ffRc3Snzn6znVSiBUufhxtWv8N2",
          "4yyT4jTVZo9EwTFt8DKfTBZ1rmLfmvdKbxD4PReKSFDv",
          "B1fVsJVmxo78BiVr8AhFCVTnVarzoGaC1fsgBJoL54q7",
          "4qutAxx9wZGHv9Qknu4TdfWARvDBKW4KHvprGm83bByx",
          "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
          "ComputeBudget111111111111111111111111111111",
          "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
          "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        ],
        addressTableLookups: null,
        header: {
          numReadonlySignedAccounts: 0,
          numReadonlyUnsignedAccounts: 5,
          numRequiredSignatures: 1,
        },
        instructions: [
          { accounts: [], data: "3nyTCb16PWvj", programIdIndex: 5 },
          { accounts: [], data: "HsbtFy", programIdIndex: 5 },
          {
            accounts: [],
            data: "21Ucm3s5471GFTU6AQZA4UCaD2dSR6LCfPWixhHyZPsep7wp1F4z735HuTqZ8iZngxT5PEhV4shNzWUZJNcuLewniwSCg8D5eBdPrMrRGZoyAMUHbhmsLdpHUUvh5sPwaTuSu96XsDLsiZMVc2bkaanfuZW6JJ4YxR4MW9yCB4BhR1LNa2YxuCnmrbQsr7MmXzkVvaifJ38WpWdL3GdZNyH2NLv3yzTzpAcEhpL9RofFybQy9mFDJWZVrhmjkkCAJjPSa2tX2pEpYnJz5zsLk2bNB9YJYB37E5AKKAFcACTzxm9oFAytxrY8nTHrNqfMSf8APeBfrBSCfL3noTaQzqSzjPwWxvF391AqXAX6P4hxkmPJg2tk7QK3y5Ceu43UGjGCDGpTb6",
            programIdIndex: 6,
          },
          {
            accounts: [2, 4, 1, 0, 0, 3],
            data: "i9nNA5Cdp9ksw",
            programIdIndex: 7,
          },
        ],
        recentBlockhash: "2djJvLJrzePDv1f5PfedoyFWZ8HMDwKomQ9cYwrWkF6R",
      },
      signatures: [
        "DGEyvS75cQtXHSDmP8N73KXXXkwgS3LdFu4HRwppMTiUUPrNTd54mUQMdEKr8SXXMXNKhy6ZV6X1M3UCgJcLACz",
      ],
    },
    version: "legacy",
  },
];
